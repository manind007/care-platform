package com.careplatform.ipd.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.ipd.model.Bed;
import com.careplatform.ipd.model.IpdAdmission;
import com.careplatform.ipd.model.Ward;
import com.careplatform.ipd.repository.BedRepository;
import com.careplatform.ipd.repository.IpdAdmissionRepository;
import com.careplatform.ipd.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IpdService {

    private final WardRepository wardRepository;
    private final BedRepository bedRepository;
    private final IpdAdmissionRepository admissionRepository;
    private final AuditService auditService;

    public List<Ward> getAllWards() {
        return wardRepository.findByTenantIdOrderByWardNameAsc(TenantContext.getTenantId());
    }

    public List<Bed> getAllBeds() {
        return bedRepository.findByTenantIdOrderByBedNumberAsc(TenantContext.getTenantId());
    }

    public List<IpdAdmission> getAllAdmissions() {
        return admissionRepository.findByTenantIdOrderByAdmissionDateTimeDesc(TenantContext.getTenantId());
    }

    public IpdAdmission getAdmissionById(Long id) {
        return admissionRepository.findById(id)
                .filter(a -> a.getTenantId().equals(TenantContext.getTenantId()))
                .orElseThrow(() -> new CarePlatformException("Admission not found with id: " + id));
    }

    @Transactional
    public Ward createWard(Ward ward) {
        ward.setTenantId(TenantContext.getTenantId());
        return wardRepository.save(ward);
    }

    @Transactional
    public Bed createBed(Bed bed) {
        bed.setTenantId(TenantContext.getTenantId());
        return bedRepository.save(bed);
    }

    @Transactional
    public IpdAdmission admitPatient(IpdAdmission admission) {
        String tenantId = TenantContext.getTenantId();
        admission.setTenantId(tenantId);
        if (admission.getAdmissionDateTime() == null) {
            admission.setAdmissionDateTime(LocalDateTime.now());
        }
        if (admission.getAdmissionCode() == null || admission.getAdmissionCode().isBlank()) {
            admission.setAdmissionCode("IPD-" + System.currentTimeMillis() % 100000);
        }

        // Update Bed status to OCCUPIED
        if (admission.getBedId() != null) {
            bedRepository.findById(admission.getBedId()).ifPresent(bed -> {
                bed.setStatus(Bed.BedStatus.OCCUPIED);
                bed.setOccupiedByUhid(admission.getUhid());
                bed.setOccupiedByName(admission.getPatientName());
                bed.setAdmissionDate(admission.getAdmissionDateTime());
                bedRepository.save(bed);
                admission.setBedNumber(bed.getBedNumber());
                admission.setWardId(bed.getWardId());
                admission.setWardName(bed.getWardName());
            });
        }

        IpdAdmission saved = admissionRepository.save(admission);
        auditService.record("IPD_PATIENT_ADMITTED", "IpdAdmission", saved.getId().toString(),
                "Admitted " + saved.getPatientName() + " to " + saved.getWardName() + " (Bed " + saved.getBedNumber() + ")",
                null, "ADMITTED");
        return saved;
    }

    @Transactional
    public IpdAdmission transferBed(Long admissionId, Long newBedId) {
        IpdAdmission admission = getAdmissionById(admissionId);
        Long oldBedId = admission.getBedId();

        // Release old bed
        if (oldBedId != null) {
            bedRepository.findById(oldBedId).ifPresent(oldBed -> {
                oldBed.setStatus(Bed.BedStatus.CLEANING);
                oldBed.setOccupiedByUhid(null);
                oldBed.setOccupiedByName(null);
                bedRepository.save(oldBed);
            });
        }

        // Assign new bed
        Bed newBed = bedRepository.findById(newBedId)
                .filter(b -> b.getTenantId().equals(TenantContext.getTenantId()))
                .orElseThrow(() -> new CarePlatformException("Bed not found: " + newBedId));

        newBed.setStatus(Bed.BedStatus.OCCUPIED);
        newBed.setOccupiedByUhid(admission.getUhid());
        newBed.setOccupiedByName(admission.getPatientName());
        bedRepository.save(newBed);

        admission.setBedId(newBed.getId());
        admission.setBedNumber(newBed.getBedNumber());
        admission.setWardId(newBed.getWardId());
        admission.setWardName(newBed.getWardName());
        admission.setStatus(IpdAdmission.AdmissionStatus.TRANSFERRED);

        IpdAdmission saved = admissionRepository.save(admission);
        auditService.record("IPD_BED_TRANSFERRED", "IpdAdmission", saved.getId().toString(),
                "Transferred " + saved.getPatientName() + " to " + newBed.getWardName() + " (Bed " + newBed.getBedNumber() + ")",
                null, "TRANSFERRED");
        return saved;
    }

    @Transactional
    public IpdAdmission dischargePatient(Long admissionId, String dischargeSummary, String advice) {
        IpdAdmission admission = getAdmissionById(admissionId);
        admission.setStatus(IpdAdmission.AdmissionStatus.DISCHARGED);
        admission.setDischargeDateTime(LocalDateTime.now());
        admission.setDischargeSummary(dischargeSummary);
        admission.setDischargeAdvice(advice);

        // Mark bed as CLEANING/AVAILABLE
        if (admission.getBedId() != null) {
            bedRepository.findById(admission.getBedId()).ifPresent(bed -> {
                bed.setStatus(Bed.BedStatus.CLEANING);
                bed.setOccupiedByUhid(null);
                bed.setOccupiedByName(null);
                bed.setAdmissionDate(null);
                bedRepository.save(bed);
            });
        }

        IpdAdmission saved = admissionRepository.save(admission);
        auditService.record("IPD_PATIENT_DISCHARGED", "IpdAdmission", saved.getId().toString(),
                "Discharged " + saved.getPatientName() + " with summary", null, "DISCHARGED");
        return saved;
    }

    @Transactional
    public IpdAdmission updateNursingNotes(Long id, String notes) {
        IpdAdmission admission = getAdmissionById(id);
        admission.setNursingNotes(notes);
        return admissionRepository.save(admission);
    }

    @Transactional
    public Bed updateBedStatus(Long bedId, Bed.BedStatus status, String staffName, String reason) {
        Bed bed = bedRepository.findById(bedId)
                .filter(b -> b.getTenantId().equals(TenantContext.getTenantId()))
                .orElseThrow(() -> new CarePlatformException("Bed not found: " + bedId));
        bed.setStatus(status);
        if (status == Bed.BedStatus.AVAILABLE) {
            bed.setLastCleanedAt(LocalDateTime.now());
            bed.setCleanedBy(staffName != null && !staffName.isBlank() ? staffName : "Housekeeping Team");
            bed.setMaintenanceReason(null);
            bed.setOccupiedByUhid(null);
            bed.setOccupiedByName(null);
            bed.setAdmissionDate(null);
        } else if (status == Bed.BedStatus.MAINTENANCE) {
            bed.setMaintenanceReason(reason != null && !reason.isBlank() ? reason : "Routine engineering maintenance");
        }
        Bed saved = bedRepository.save(bed);
        auditService.record("BED_STATUS_UPDATED", "Bed", saved.getId().toString(),
                "Bed " + saved.getBedNumber() + " (" + saved.getWardName() + ") status updated to " + status + (staffName != null ? " by " + staffName : ""),
                null, status.name());
        return saved;
    }
}

