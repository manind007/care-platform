package com.careplatform.insurance.controller;

import com.careplatform.insurance.model.InsuranceClaim;
import com.careplatform.insurance.service.InsuranceClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/insurance")
@RequiredArgsConstructor
@Tag(name = "TPA & Cashless Insurance Claims Desk", description = "Pre-authorization, corporate panels, policy verification, and cashless claims settlement (KareXpert, MocDoc & Medinous Benchmark)")
public class InsuranceClaimController {

    private final InsuranceClaimService claimService;

    @GetMapping("/claims")
    @Operation(summary = "List all insurance claims")
    public ResponseEntity<List<InsuranceClaim>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAllClaims());
    }

    @GetMapping("/claims/{id}")
    @Operation(summary = "Get single insurance claim details")
    public ResponseEntity<InsuranceClaim> getClaimById(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getClaimById(id));
    }

    @GetMapping("/claims/patient/{uhid}")
    @Operation(summary = "Get all insurance claims for a patient by UHID")
    public ResponseEntity<List<InsuranceClaim>> getClaimsByUhid(@PathVariable String uhid) {
        return ResponseEntity.ok(claimService.getClaimsByUhid(uhid));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get TPA cashless desk aggregate metrics and settlement rate")
    public ResponseEntity<Map<String, Object>> getTpaSummary() {
        return ResponseEntity.ok(claimService.getTpaSummary());
    }

    @PostMapping("/claims")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('FINANCE_ADMIN')")
    @Operation(summary = "Submit a new TPA cashless insurance claim / pre-authorization request")
    public ResponseEntity<InsuranceClaim> createClaim(@RequestBody InsuranceClaim claim) {
        return ResponseEntity.status(HttpStatus.CREATED).body(claimService.createClaim(claim));
    }

    @PatchMapping("/claims/{id}/status")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('FINANCE_ADMIN')")
    @Operation(summary = "Update claim pre-authorization status, approved cashless amount, and settlement remarks")
    public ResponseEntity<InsuranceClaim> updateClaimStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        String status = (String) payload.get("status");
        BigDecimal approvedAmt = payload.get("approvedAmount") != null ? new BigDecimal(payload.get("approvedAmount").toString()) : null;
        String preAuthCode = (String) payload.get("preAuthCode");
        String remarks = (String) payload.get("remarks");

        return ResponseEntity.ok(claimService.updateClaimStatus(id, status, approvedAmt, preAuthCode, remarks));
    }
}

