package com.careplatform.shiftbroadcast.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.shiftbroadcast.model.OpenShiftBroadcast;
import com.careplatform.shiftbroadcast.repository.OpenShiftBroadcastRepository;
import com.careplatform.visit.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenShiftBroadcastService {

    private final OpenShiftBroadcastRepository broadcastRepository;
    private final VisitRepository visitRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<OpenShiftBroadcast> getAllBroadcasts() {
        return broadcastRepository.findByTenantIdOrderByShiftDateAscStartTimeAsc(TenantContext.getTenantId());
    }

    @Transactional(readOnly = true)
    public List<OpenShiftBroadcast> getOpenBroadcasts() {
        return broadcastRepository.findByTenantIdAndBroadcastStatusOrderByShiftDateAscStartTimeAsc(
                TenantContext.getTenantId(),
                "OPEN"
        );
    }

    @Transactional
    public OpenShiftBroadcast broadcastShift(OpenShiftBroadcast broadcast) {
        String tenantId = TenantContext.getTenantId();
        broadcast.setTenantId(tenantId);
        broadcast.setBroadcastStatus("OPEN");
        OpenShiftBroadcast saved = broadcastRepository.save(broadcast);
        auditService.record("SHIFT_BROADCAST_CREATED", "OpenShiftBroadcast", saved.getId().toString(),
                "Broadcasted open shift for " + saved.getClientName() + " on " + saved.getShiftDate() + " (" + saved.getStartTime() + "-" + saved.getEndTime() + ") with urgency " + saved.getUrgency(),
                null, "OPEN");
        return saved;
    }

    @Transactional
    public OpenShiftBroadcast claimShift(Long broadcastId, Long userId, String carerName) {
        OpenShiftBroadcast broadcast = broadcastRepository.findById(broadcastId)
                .filter(b -> b.getTenantId().equals(TenantContext.getTenantId()))
                .orElseThrow(() -> new CarePlatformException("Open shift broadcast not found: " + broadcastId));

        if (!"OPEN".equalsIgnoreCase(broadcast.getBroadcastStatus())) {
            throw new CarePlatformException("This shift is no longer open (Current status: " + broadcast.getBroadcastStatus() + ")");
        }

        broadcast.setBroadcastStatus("CLAIMED");
        broadcast.setClaimedByUserId(userId);
        broadcast.setClaimedByName(carerName);
        broadcast.setClaimedAt(LocalDateTime.now());

        // Update corresponding Visit if attached
        if (broadcast.getVisitId() != null) {
            visitRepository.findById(broadcast.getVisitId()).ifPresent(visit -> {
                visit.setStaffId(userId);
                visit.setStaffName(carerName);
                visitRepository.save(visit);
            });
        }

        OpenShiftBroadcast saved = broadcastRepository.save(broadcast);
        auditService.record("SHIFT_BROADCAST_CLAIMED", "OpenShiftBroadcast", saved.getId().toString(),
                "Carer " + carerName + " successfully claimed shift for " + saved.getClientName() + " on " + saved.getShiftDate(),
                null, "CLAIMED");
        return saved;
    }

    @Transactional
    public OpenShiftBroadcast cancelBroadcast(Long broadcastId, String reason) {
        OpenShiftBroadcast broadcast = broadcastRepository.findById(broadcastId)
                .filter(b -> b.getTenantId().equals(TenantContext.getTenantId()))
                .orElseThrow(() -> new CarePlatformException("Open shift broadcast not found: " + broadcastId));

        broadcast.setBroadcastStatus("CANCELLED");
        broadcast.setBroadcastNotes(reason != null ? reason : "Cancelled by care coordinator");
        return broadcastRepository.save(broadcast);
    }
}

