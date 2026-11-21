package com.careplatform.incident.controller;

import com.careplatform.common.security.UserPrincipal;
import com.careplatform.incident.model.Incident;
import com.careplatform.incident.model.IncidentStatus;
import com.careplatform.incident.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
@Tag(name = "Incidents", description = "Incident logging, investigation workflows, and corrective actions")
public class IncidentController {

    private final IncidentService incidentService;

    @GetMapping
    @Operation(summary = "List all incidents for tenant (optional client filter)")
    public List<Incident> getIncidents(@RequestParam(required = false) Long clientId) {
        if (clientId != null) {
            return incidentService.getIncidentsByClient(clientId);
        }
        return incidentService.getAllIncidents();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get incident details by ID")
    public Incident getIncidentById(@PathVariable Long id) {
        return incidentService.getIncidentById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('INCIDENT_REPORT') or hasRole('CARE_WORKER') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Report a new clinical/safeguarding incident")
    public Incident reportIncident(@RequestBody Incident incident, @AuthenticationPrincipal UserPrincipal principal) {
        String reporter = principal != null ? principal.getFullName() : "Carer";
        return incidentService.reportIncident(incident, reporter);
    }

    @PatchMapping("/{id}/workflow")
    @PreAuthorize("hasAuthority('INCIDENT_MANAGE') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Advance incident through review/investigation/closed workflow")
    public Incident advanceWorkflow(
            @PathVariable Long id,
            @RequestParam IncidentStatus status,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal UserPrincipal principal) {
        String investigator = principal != null ? principal.getFullName() : "Manager";
        return incidentService.advanceWorkflow(id, status, notes, investigator);
    }
}
