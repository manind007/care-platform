package com.careplatform.crm.controller;

import com.careplatform.client.model.Client;
import com.careplatform.crm.model.ClientLead;
import com.careplatform.crm.service.ClientLeadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/crm/leads")
@RequiredArgsConstructor
@Tag(name = "Home Care CRM & Lead Pipeline", description = "Inquiry intake, referral tracking, sales pipeline stages, and lead-to-client onboarding (AxisCare & CareSmartz360 Benchmark)")
public class ClientLeadController {

    private final ClientLeadService leadService;

    @GetMapping
    @Operation(summary = "List all client leads and inquiries")
    public ResponseEntity<List<ClientLead>> getAllLeads() {
        return ResponseEntity.ok(leadService.getAllLeads());
    }

    @GetMapping("/summary")
    @Operation(summary = "Get CRM pipeline conversion funnel metrics")
    public ResponseEntity<Map<String, Object>> getCrmSummary() {
        return ResponseEntity.ok(leadService.getCrmPipelineSummary());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific lead details")
    public ResponseEntity<ClientLead> getLeadById(@PathVariable Long id) {
        return ResponseEntity.ok(leadService.getLeadById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR') or hasAuthority('CLIENT_WRITE')")
    @Operation(summary = "Create a new prospect lead / care inquiry")
    public ResponseEntity<ClientLead> createLead(@RequestBody ClientLead lead) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.createLead(lead));
    }

    @PatchMapping("/{id}/stage")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Advance lead along pipeline stages (NEW_INQUIRY -> ASSESSMENT -> PROPOSAL -> CONVERTED)")
    public ResponseEntity<ClientLead> updateStage(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String stage = payload.get("stage");
        String notes = payload.get("notes");
        return ResponseEntity.ok(leadService.updatePipelineStage(id, stage, notes));
    }

    @PostMapping("/{id}/convert-to-client")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Convert qualified lead into an active longitudinal Client profile with 1 click")
    public ResponseEntity<Client> convertLeadToClient(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.convertLeadToClient(id));
    }
}

