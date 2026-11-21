package com.careplatform.risk.controller;

import com.careplatform.risk.model.Risk;
import com.careplatform.risk.service.RiskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/risks")
@RequiredArgsConstructor
@Tag(name = "Risks", description = "Risk assessment, scoring matrix, and mitigation monitoring")
public class RiskController {

    private final RiskService riskService;

    @GetMapping
    @Operation(summary = "List all risks for tenant (optional client filter)")
    public List<Risk> getRisks(@RequestParam(required = false) Long clientId) {
        if (clientId != null) {
            return riskService.getRisksByClient(clientId);
        }
        return riskService.getAllRisks();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get risk by ID")
    public Risk getRiskById(@PathVariable Long id) {
        return riskService.getRiskById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('RISK_MANAGE') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Create and score a new risk")
    public Risk createRisk(@RequestBody Risk risk) {
        return riskService.createRisk(risk);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('RISK_MANAGE') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Update risk status (OPEN, MITIGATED, CLOSED)")
    public Risk updateRiskStatus(@PathVariable Long id, @RequestParam String status) {
        return riskService.updateStatus(id, status);
    }
}
