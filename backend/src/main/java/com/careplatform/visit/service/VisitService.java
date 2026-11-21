package com.careplatform.visit.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.client.service.ClientService;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.exception.ResourceNotFoundException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.visit.dto.CheckInRequest;
import com.careplatform.visit.dto.CheckOutRequest;
import com.careplatform.visit.model.Visit;
import com.careplatform.visit.model.VisitStatus;
import com.careplatform.visit.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VisitService {

    private final VisitRepository visitRepository;
    private final AuditService auditService;
    private final ClientService clientService;

    @Transactional(readOnly = true)
    public List<Visit> getAllVisits() {
        return visitRepository.findByTenantId(TenantContext.getTenantId());
    }

    @Transactional(readOnly = true)
    public List<Visit> getVisitsForToday(Long staffId) {
        String tenant = TenantContext.getTenantId();
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        if (staffId != null) {
            return visitRepository.findByTenantIdAndStaffIdAndScheduledStartBetween(tenant, staffId, startOfDay, endOfDay);
        }
        return visitRepository.findByTenantIdAndScheduledStartBetween(tenant, startOfDay, endOfDay);
    }

    @Transactional(readOnly = true)
    public List<Visit> getVisitsByClient(Long clientId) {
        return visitRepository.findByTenantIdAndClientId(TenantContext.getTenantId(), clientId);
    }

    @Transactional(readOnly = true)
    public Visit getVisitById(Long id) {
        return visitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + id));
    }

    @Transactional
    public Visit createVisit(Visit visit) {
        visit.setTenantId(TenantContext.getTenantId());
        if (visit.getVisitReference() == null) {
            visit.setVisitReference("VST-" + System.currentTimeMillis() % 1000000);
        }
        Visit saved = visitRepository.save(visit);

        auditService.record("VISIT_CREATE", "Visit", saved.getId().toString(),
                "Visit scheduled for client " + saved.getClientName() + " (" + saved.getScheduledStart() + ")",
                null, "SCHEDULED");

        return saved;
    }

    @Transactional
    public Visit checkIn(Long id, CheckInRequest request, String workerUsername) {
        Visit visit = getVisitById(id);
        if (visit.getStatus() == VisitStatus.COMPLETED) {
            throw new CarePlatformException("Cannot check into an already completed visit.");
        }

        visit.setStatus(VisitStatus.IN_PROGRESS);
        visit.setActualStart(LocalDateTime.now());
        visit.setCheckInMethod(request.getMethod() != null ? request.getMethod() : "GPS");
        visit.setCheckInLatitude(request.getLatitude());
        visit.setCheckInLongitude(request.getLongitude());
        visit.setQrVerificationToken(request.getQrToken());

        Visit saved = visitRepository.save(visit);

        auditService.record("VISIT_CHECKIN", "Visit", id.toString(),
                "Care worker checked in via " + visit.getCheckInMethod() + " at lat=" + request.getLatitude() + ", lon=" + request.getLongitude(),
                "SCHEDULED", "IN_PROGRESS");

        clientService.addTimelineEvent(visit.getClientId(), "VISIT_CHECKIN",
                "Care Worker Arrived",
                "Worker " + (visit.getStaffName() != null ? visit.getStaffName() : workerUsername) + " checked in at " + visit.getActualStart().toLocalTime(),
                "INFO", workerUsername, true);

        return saved;
    }

    @Transactional
    public Visit checkOut(Long id, CheckOutRequest request, String workerUsername) {
        Visit visit = getVisitById(id);
        visit.setStatus(VisitStatus.COMPLETED);
        visit.setActualEnd(LocalDateTime.now());
        visit.setCheckOutLatitude(request.getLatitude());
        visit.setCheckOutLongitude(request.getLongitude());
        if (request.getCareNotes() != null) {
            visit.setCareNotes(request.getCareNotes());
        }

        Visit saved = visitRepository.save(visit);

        auditService.record("VISIT_CHECKOUT", "Visit", id.toString(),
                "Care worker checked out. Visit marked COMPLETED. Notes recorded.",
                "IN_PROGRESS", "COMPLETED");

        clientService.addTimelineEvent(visit.getClientId(), "VISIT_COMPLETED",
                "Visit Completed",
                "Care visit completed. Care notes: " + (request.getCareNotes() != null ? request.getCareNotes() : "Routine care delivered."),
                "INFO", workerUsername, true);

        return saved;
    }

    @Transactional
    public Visit assignStaff(Long id, Long staffId, String staffName) {
        Visit visit = getVisitById(id);
        visit.setStaffId(staffId);
        visit.setStaffName(staffName);
        visit.setStatus(VisitStatus.CONFIRMED);

        Visit saved = visitRepository.save(visit);
        auditService.record("VISIT_ASSIGN", "Visit", id.toString(),
                "Visit assigned to worker: " + staffName, null, "CONFIRMED");

        return saved;
    }
}
