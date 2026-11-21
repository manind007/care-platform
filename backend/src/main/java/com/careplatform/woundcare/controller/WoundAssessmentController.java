package com.careplatform.woundcare.controller;

import com.careplatform.woundcare.model.WoundAssessment;
import com.careplatform.woundcare.service.WoundAssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wounds")
@RequiredArgsConstructor
@Tag(name = "Wound Care & Tissue Viability", description = "Clinical pressure ulcer staging, anatomical body map tracking, and dressing management")
public class WoundAssessmentController {

    private final WoundAssessmentService woundService;

    @GetMapping("/client/{clientId}")
    @Operation(summary = "Get all wound assessments for a client")
    public List<WoundAssessment> getClientWounds(@PathVariable Long clientId) {
        return woundService.getClientWounds(clientId);
    }

    @GetMapping
    @Operation(summary = "Get all active wound assessments")
    public List<WoundAssessment> getAllWounds() {
        return woundService.getAllWounds();
    }

    @PostMapping
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_WORKER') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Record new wound assessment with staging & dressing protocol")
    public ResponseEntity<WoundAssessment> recordWound(@RequestBody WoundAssessment assessment) {
        return ResponseEntity.status(HttpStatus.CREATED).body(woundService.recordWoundAssessment(assessment));
    }
}

