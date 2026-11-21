package com.careplatform.emergency.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.emergency.model.EmergencyTriage;
import com.careplatform.emergency.repository.EmergencyTriageRepository;
import com.careplatform.ipd.model.IpdAdmission;
import com.careplatform.ipd.service.IpdService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmergencyTriageService {

    private final EmergencyTriageRepository triageRepository;
    private final IpdService ipdService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<EmergencyTriage> getAllTriageCases() {
        return triageRepository.findByTenantIdOrderByArrivalDateTimeDesc(TenantContext.getTenantId());
    }

    @Transactional(readOnly = true)
    public List<EmergencyTriage> getActiveQueue() {
        List<String> activeStatuses = List.of(
                "PRE_ARRIVAL",
                "WAITING_IN_TRIAGE",
                "IN_RESUSCITATION",
                "UNDER_OBSERVATION"
        );
        return triageRepository.findByTenantIdAndStatusInOrderByEsiLevelAscArrivalDateTimeAsc(
                TenantContext.getTenantId(),
                activeStatuses
        );
    }

    @Transactional(readOnly = true)
    public EmergencyTriage getTriageById(Long id) {
        return triageRepository.findById(id)
                .filter(t -> t.getTenantId().equals(TenantContext.getTenantId()))
                .orElseThrow(() -> new CarePlatformException("Emergency triage case not found: " + id));
    }

    @Transactional
    public EmergencyTriage registerTriageCase(EmergencyTriage triage) {
        String tenantId = TenantContext.getTenantId();
        triage.setTenantId(tenantId);
        if (triage.getArrivalDateTime() == null) {
            triage.setArrivalDateTime(LocalDateTime.now());
        }
        if (triage.getTriageNumber() == null || triage.getTriageNumber().isBlank()) {
            triage.setTriageNumber("ER-" + System.currentTimeMillis() % 1000000);
        }

        // Compute triage color from ESI level if not explicitly provided
        if (triage.getEsiLevel() != null) {
            switch (triage.getEsiLevel()) {
                case 1 -> triage.setTriageColor("RED");
                case 2 -> triage.setTriageColor("ORANGE");
                case 3 -> triage.setTriageColor("YELLOW");
                case 4 -> triage.setTriageColor("GREEN");
                default -> triage.setTriageColor("BLUE");
            }
        }

        EmergencyTriage saved = triageRepository.save(triage);
        auditService.record("EMERGENCY_TRIAGE_CREATED", "EmergencyTriage", saved.getId().toString(),
                "Registered ER triage " + saved.getTriageNumber() + " (" + saved.getPatientName() + ", ESI Level " + saved.getEsiLevel() + " - " + saved.getTriageColor() + ")",
                null, saved.getStatus());
        return saved;
    }

    @Transactional
    public EmergencyTriage updateVitalsAndEsi(Long id, Integer hr, String bp, Integer rr, Integer spo2, Double temp, Integer gcs, Integer pain, Integer esiLevel, String interventions) {
        EmergencyTriage triage = getTriageById(id);
        if (hr != null) triage.setHeartRate(hr);
        if (bp != null) triage.setBloodPressure(bp);
        if (rr != null) triage.setRespiratoryRate(rr);
        if (spo2 != null) triage.setOxygenSaturation(spo2);
        if (temp != null) triage.setTemperature(temp);
        if (gcs != null) triage.setGlasgowComaScale(gcs);
        if (pain != null) triage.setPainScore(pain);
        if (esiLevel != null) {
            triage.setEsiLevel(esiLevel);
            switch (esiLevel) {
                case 1 -> triage.setTriageColor("RED");
                case 2 -> triage.setTriageColor("ORANGE");
                case 3 -> triage.setTriageColor("YELLOW");
                case 4 -> triage.setTriageColor("GREEN");
                default -> triage.setTriageColor("BLUE");
            }
        }
        if (interventions != null) {
            triage.setClinicalInterventions(interventions);
        }
        return triageRepository.save(triage);
    }

    @Transactional
    public EmergencyTriage fastTrackAdmitToIpd(Long triageId, Long bedId, String admittingDoctor, String diagnosis) {
        EmergencyTriage triage = getTriageById(triageId);

        IpdAdmission admission = IpdAdmission.builder()
                .patientName(triage.getPatientName())
                .uhid(triage.getUhid() != null ? triage.getUhid() : "UHID-" + System.currentTimeMillis() % 100000)
                .admissionDateTime(LocalDateTime.now())
                .admittingDoctor(admittingDoctor != null ? admittingDoctor : triage.getAttendingEmergencyPhysician())
                .provisionalDiagnosis(diagnosis != null ? diagnosis : triage.getChiefComplaint())
                .bedId(bedId)
                .status(IpdAdmission.AdmissionStatus.ADMITTED)
                .nursingNotes("Fast-tracked admission from Emergency Dept (" + triage.getTriageNumber() + ", ESI Level " + triage.getEsiLevel() + "). Vitals: BP " + triage.getBloodPressure() + ", SpO2 " + triage.getOxygenSaturation() + "%")
                .build();

        IpdAdmission savedAdmission = ipdService.admitPatient(admission);

        triage.setStatus(triage.getEsiLevel() <= 2 ? "TRANSFERRED_ICU" : "ADMITTED_IPD");
        triage.setDestinationWardId(savedAdmission.getWardId());
        triage.setDestinationBedId(savedAdmission.getBedId());
        triage.setDispositionNotes("Direct fast-track admission to " + savedAdmission.getWardName() + " (Bed " + savedAdmission.getBedNumber() + ") under " + savedAdmission.getAdmittingDoctor());

        EmergencyTriage saved = triageRepository.save(triage);
        auditService.record("EMERGENCY_FAST_TRACK_IPD", "EmergencyTriage", saved.getId().toString(),
                "Fast-track admitted " + saved.getPatientName() + " to " + savedAdmission.getWardName() + " Bed " + savedAdmission.getBedNumber(),
                null, saved.getStatus());
        return saved;
    }

    @Transactional
    public EmergencyTriage transferToOt(Long triageId, String surgicalTeam, String procedureName) {
        EmergencyTriage triage = getTriageById(triageId);
        triage.setStatus("TRANSFERRED_OT");
        triage.setDispositionNotes("Immediate emergency transfer to Operation Theatre. Procedure: " + procedureName + ". Team: " + surgicalTeam);
        EmergencyTriage saved = triageRepository.save(triage);
        auditService.record("EMERGENCY_TRANSFER_OT", "EmergencyTriage", saved.getId().toString(),
                "Emergency transfer of " + saved.getPatientName() + " to OT for " + procedureName,
                null, "TRANSFERRED_OT");
        return saved;
    }

    @Transactional
    public EmergencyTriage dischargeFromEr(Long triageId, String summary) {
        EmergencyTriage triage = getTriageById(triageId);
        triage.setStatus("DISCHARGED");
        triage.setDispositionNotes(summary != null ? summary : "Stabilized and discharged home with outpatient follow-up advice.");
        EmergencyTriage saved = triageRepository.save(triage);
        auditService.record("EMERGENCY_DISCHARGED", "EmergencyTriage", saved.getId().toString(),
                "Discharged " + saved.getPatientName() + " from Emergency Dept",
                null, "DISCHARGED");
        return saved;
    }
}

