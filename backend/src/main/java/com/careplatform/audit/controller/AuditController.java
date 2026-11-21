package com.careplatform.audit.controller;

import com.careplatform.audit.model.AuditEvent;
import com.careplatform.audit.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@Tag(name = "Audit", description = "Tamper-evident audit event trail endpoints")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @PreAuthorize("hasAuthority('AUDIT_READ') or hasRole('PLATFORM_ADMIN') or hasRole('ORG_ADMIN') or hasRole('AUDIT_TEAM') or hasRole('CARE_MANAGER')")
    @Operation(summary = "Get recent audit events for current tenant")
    public List<AuditEvent> getAuditEvents() {
        return auditService.getRecentEvents();
    }

    @GetMapping("/by-resource")
    @PreAuthorize("hasAuthority('AUDIT_READ') or hasRole('PLATFORM_ADMIN') or hasRole('ORG_ADMIN') or hasRole('AUDIT_TEAM') or hasRole('CARE_MANAGER')")
    @Operation(summary = "Get audit trail for a specific resource")
    public List<AuditEvent> getEventsByResource(
            @RequestParam String resourceType,
            @RequestParam String resourceId) {
        return auditService.getEventsByResource(resourceType, resourceId);
    }
}
