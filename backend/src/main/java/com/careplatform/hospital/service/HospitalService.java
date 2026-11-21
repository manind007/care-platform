package com.careplatform.hospital.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.hospital.model.BloodBankUnit;
import com.careplatform.hospital.model.OperationTheatreBooking;
import com.careplatform.hospital.repository.BloodBankUnitRepository;
import com.careplatform.hospital.repository.OperationTheatreBookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final OperationTheatreBookingRepository otRepository;
    private final BloodBankUnitRepository bloodBankRepository;
    private final AuditService auditService;

    public List<OperationTheatreBooking> getAllOtBookings() {
        return otRepository.findByTenantIdOrderByScheduledDateTimeAsc(TenantContext.getTenantId());
    }

    public List<BloodBankUnit> getAllBloodUnits() {
        return bloodBankRepository.findByTenantIdOrderByExpiryDateAsc(TenantContext.getTenantId());
    }

    @Transactional
    public OperationTheatreBooking createOtBooking(OperationTheatreBooking booking) {
        booking.setTenantId(TenantContext.getTenantId());
        if (booking.getBookingCode() == null || booking.getBookingCode().isBlank()) {
            booking.setBookingCode("OT-" + System.currentTimeMillis() % 100000);
        }
        OperationTheatreBooking saved = otRepository.save(booking);
        auditService.record("OT_BOOKING_SCHEDULED", "OperationTheatreBooking", saved.getId().toString(),
                "Scheduled " + saved.getSurgeryName() + " for " + saved.getPatientName() + " in " + saved.getOtRoom(),
                null, "SCHEDULED");
        return saved;
    }

    @Transactional
    public OperationTheatreBooking updateOtStatus(Long id, OperationTheatreBooking.SurgeryStatus status, String operativeNotes) {
        OperationTheatreBooking booking = otRepository.findById(id)
                .filter(b -> b.getTenantId().equals(TenantContext.getTenantId()))
                .orElseThrow(() -> new CarePlatformException("OT Booking not found: " + id));

        booking.setStatus(status);
        if (operativeNotes != null) {
            booking.setOperativeNotes(operativeNotes);
        }
        OperationTheatreBooking saved = otRepository.save(booking);
        auditService.record("OT_STATUS_UPDATED", "OperationTheatreBooking", id.toString(),
                "Updated surgery status to " + status.name() + " for " + saved.getPatientName(),
                null, status.name());
        return saved;
    }

    @Transactional
    public BloodBankUnit addBloodUnit(BloodBankUnit unit) {
        unit.setTenantId(TenantContext.getTenantId());
        BloodBankUnit saved = bloodBankRepository.save(unit);
        auditService.record("BLOOD_UNIT_ADDED", "BloodBankUnit", saved.getId().toString(),
                "Added blood unit " + saved.getUnitCode() + " (" + saved.getBloodGroup() + ")",
                null, "AVAILABLE");
        return saved;
    }

    @Transactional
    public BloodBankUnit reserveBloodUnit(Long id, String uhid, String patientName) {
        BloodBankUnit unit = bloodBankRepository.findById(id)
                .filter(u -> u.getTenantId().equals(TenantContext.getTenantId()))
                .orElseThrow(() -> new CarePlatformException("Blood unit not found: " + id));

        unit.setStatus(BloodBankUnit.UnitStatus.RESERVED);
        unit.setReservedForUhid(uhid);
        unit.setReservedForName(patientName);

        BloodBankUnit saved = bloodBankRepository.save(unit);
        auditService.record("BLOOD_UNIT_RESERVED", "BloodBankUnit", id.toString(),
                "Reserved blood unit " + saved.getUnitCode() + " for " + patientName,
                null, "RESERVED");
        return saved;
    }
}

