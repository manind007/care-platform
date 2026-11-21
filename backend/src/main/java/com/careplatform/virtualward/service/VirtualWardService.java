package com.careplatform.virtualward.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.client.service.ClientService;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.virtualward.model.VirtualWardStay;
import com.careplatform.virtualward.repository.VirtualWardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VirtualWardService {

    private final VirtualWardRepository virtualWardRepository;
    private final AuditService auditService;
    private final ClientService clientService;

    @Transactional(readOnly = true)
    public List<VirtualWardStay> getAllStays() {
        return virtualWardRepository.findByTenantIdOrderByAdmissionDateDesc(TenantContext.getTenantId());
    }

    @Transactional(readOnly = true)
    public List<VirtualWardStay> getActiveStays() {
        return virtualWardRepository.findByTenantIdAndStatusNot(TenantContext.getTenantId(), "DISCHARGED");
    }

    @Transactional
    public VirtualWardStay admitPatient(VirtualWardStay stay) {
        String tenantId = TenantContext.getTenantId();
        stay.setTenantId(tenantId);
        if (stay.getAdmissionDate() == null) {
            stay.setAdmissionDate(LocalDate.now());
        }
        if (stay.getStatus() == null) {
            stay.setStatus("ADMITTED");
        }
        VirtualWardStay saved = virtualWardRepository.save(stay);

        auditService.record("VIRTUAL_WARD_ADMISSION", "VirtualWardStay", saved.getId().toString(),
                "Patient " + saved.getClientName() + " admitted to " + saved.getVirtualWardName() + " (Consultant: " + saved.getAdmittingConsultant() + ")",
                null, saved.getStatus());

        clientService.addTimelineEvent(saved.getClientId(), "VIRTUAL_WARD_ADMISSION",
                "Admitted to Virtual Ward: " + saved.getVirtualWardName(),
                "Lead Consultant: " + saved.getAdmittingConsultant() + " | Telemetry Device: " + saved.getTelemetryDeviceId(),
                "INFO", saved.getAdmittingConsultant(), true);

        return saved;
    }

    @Transactional
    public VirtualWardStay recordRemoteRound(Long id, String roundNotes, Integer spo2, Integer heartRate, String bp, Double temp) {
        String tenantId = TenantContext.getTenantId();
        VirtualWardStay stay = virtualWardRepository.findById(id)
                .filter(s -> s.getTenantId().equals(tenantId))
                .orElseThrow(() -> new CarePlatformException("Virtual ward stay not found: " + id));

        stay.setLastRemoteRoundTime(LocalDateTime.now());
        stay.setRemoteRoundNotes(roundNotes);
        if (spo2 != null) stay.setLatestSpo2(spo2);
        if (heartRate != null) stay.setLatestHeartRate(heartRate);
        if (bp != null) stay.setLatestBloodPressure(bp);
        if (temp != null) stay.setLatestTemperature(temp);

        // Auto-acuity evaluation
        if ((spo2 != null && spo2 < 92) || (heartRate != null && (heartRate > 115 || heartRate < 45))) {
            stay.setAcuityLevel("HIGH");
            stay.setStatus("ESCALATED_TO_ED");
        } else {
            stay.setStatus("STABLE");
        }

        VirtualWardStay saved = virtualWardRepository.save(stay);

        auditService.record("VIRTUAL_WARD_REMOTE_ROUND", "VirtualWardStay", id.toString(),
                "Remote ward round documented for " + saved.getClientName() + ": " + roundNotes,
                null, saved.getStatus());

        return saved;
    }

    @Transactional
    public VirtualWardStay dischargePatient(Long id, String summary) {
        String tenantId = TenantContext.getTenantId();
        VirtualWardStay stay = virtualWardRepository.findById(id)
                .filter(s -> s.getTenantId().equals(tenantId))
                .orElseThrow(() -> new CarePlatformException("Virtual ward stay not found: " + id));

        stay.setStatus("DISCHARGED");
        stay.setActualDischargeDate(LocalDate.now());
        stay.setClinicalPlan(summary);

        VirtualWardStay saved = virtualWardRepository.save(stay);

        auditService.record("VIRTUAL_WARD_DISCHARGE", "VirtualWardStay", id.toString(),
                "Discharged from Virtual Ward " + saved.getVirtualWardName() + ". Summary: " + summary,
                null, "DISCHARGED");

        clientService.addTimelineEvent(saved.getClientId(), "VIRTUAL_WARD_DISCHARGED",
                "Discharged from Virtual Ward: " + saved.getVirtualWardName(),
                summary, "SUCCESS", "Virtual Ward Team", true);

        return saved;
    }
}

