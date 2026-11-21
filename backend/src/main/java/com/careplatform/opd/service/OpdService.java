package com.careplatform.opd.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.opd.model.OpdAppointment;
import com.careplatform.opd.repository.OpdAppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OpdService {

    private final OpdAppointmentRepository opdRepository;
    private final AuditService auditService;

    public List<OpdAppointment> getAllAppointments() {
        return opdRepository.findByTenantIdOrderByTokenNumberAsc(TenantContext.getTenantId());
    }

    public OpdAppointment getAppointmentById(Long id) {
        return opdRepository.findById(id)
                .filter(a -> a.getTenantId().equals(TenantContext.getTenantId()))
                .orElseThrow(() -> new CarePlatformException("OPD Appointment not found with id: " + id));
    }

    @Transactional
    public OpdAppointment createAppointment(OpdAppointment appointment) {
        String tenantId = TenantContext.getTenantId();
        appointment.setTenantId(tenantId);
        if (appointment.getAppointmentTime() == null) {
            appointment.setAppointmentTime(LocalDateTime.now());
        }
        if (appointment.getTokenNumber() == null) {
            long count = opdRepository.findByTenantIdOrderByTokenNumberAsc(tenantId).size();
            appointment.setTokenNumber((int) (count + 1));
        }

        OpdAppointment saved = opdRepository.save(appointment);
        auditService.record("OPD_APPOINTMENT_CREATED", "OpdAppointment", saved.getId().toString(),
                "OPD appointment scheduled for " + saved.getPatientName() + " (Token #" + saved.getTokenNumber() + ")",
                null, "CREATED");
        return saved;
    }

    @Transactional
    public OpdAppointment updateConsultation(Long id, OpdAppointment updated) {
        OpdAppointment existing = getAppointmentById(id);

        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());
        if (updated.getTriagePriority() != null) existing.setTriagePriority(updated.getTriagePriority());
        if (updated.getChiefComplaints() != null) existing.setChiefComplaints(updated.getChiefComplaints());
        if (updated.getVitals() != null) existing.setVitals(updated.getVitals());
        if (updated.getDiagnosis() != null) existing.setDiagnosis(updated.getDiagnosis());
        if (updated.getClinicalNotes() != null) existing.setClinicalNotes(updated.getClinicalNotes());
        if (updated.getPrescriptionJson() != null) existing.setPrescriptionJson(updated.getPrescriptionJson());
        if (updated.getLabOrdersJson() != null) existing.setLabOrdersJson(updated.getLabOrdersJson());

        OpdAppointment saved = opdRepository.save(existing);
        auditService.record("OPD_CONSULTATION_UPDATED", "OpdAppointment", saved.getId().toString(),
                "Consultation updated for " + saved.getPatientName() + " by " + saved.getDoctorName(),
                null, saved.getStatus().name());
        return saved;
    }

    @Transactional
    public void deleteAppointment(Long id) {
        OpdAppointment appointment = getAppointmentById(id);
        opdRepository.delete(appointment);
        auditService.record("OPD_APPOINTMENT_DELETED", "OpdAppointment", id.toString(),
                "Deleted OPD appointment #" + id, null, "DELETED");
    }
}

