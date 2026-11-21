package com.careplatform.audit.service;

import com.careplatform.audit.model.AuditEvent;
import com.careplatform.audit.repository.AuditEventRepository;
import com.careplatform.common.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditEventRepository auditEventRepository;

    @Transactional
    public void record(String actionType, String resourceType, String resourceId, String description, String prevState, String newState) {
        String actor = "system";
        String role = "SYSTEM";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            actor = auth.getName();
            if (!auth.getAuthorities().isEmpty()) {
                role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
            }
        }

        AuditEvent event = AuditEvent.builder()
                .actorUsername(actor)
                .actorRole(role)
                .actionType(actionType)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .description(description)
                .status("SUCCESS")
                .previousState(prevState)
                .newState(newState)
                .build();
        String tenant = TenantContext.getTenantId();
        if (tenant == null || tenant.isBlank()) {
            tenant = "TENANT-001";
        }
        event.setTenantId(tenant);
        event.setCreatedBy(actor);

        auditEventRepository.save(event);
        log.info("[AUDIT] Tenant: {}, Actor: {}, Action: {}, Resource: {}:{}",
                event.getTenantId(), actor, actionType, resourceType, resourceId);
    }

    @Transactional(readOnly = true)
    public List<AuditEvent> getRecentEvents() {
        return auditEventRepository.findByTenantIdOrderByCreatedAtDesc(TenantContext.getTenantId());
    }

    @Transactional(readOnly = true)
    public List<AuditEvent> getEventsByResource(String resourceType, String resourceId) {
        return auditEventRepository.findByTenantIdAndResourceIdOrderByCreatedAtDesc(TenantContext.getTenantId(), resourceId);
    }
}
