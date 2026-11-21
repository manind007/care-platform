package com.careplatform.ehr.controller;

import com.careplatform.ehr.dto.CdsAlert;
import com.careplatform.ehr.dto.CdsEvaluationRequest;
import com.careplatform.ehr.service.ClinicalDecisionSupportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cds")
@RequiredArgsConstructor
@Tag(name = "Clinical Decision Support (CDS)", description = "Epic BestPractice Advisories (BPAs): real-time drug-allergy, drug-drug, NEWS2 early warning deterioration, and preventive care alerts")
public class CdsController {

    private final ClinicalDecisionSupportService cdsService;

    @PostMapping("/evaluate")
    @Operation(summary = "Evaluate patient data for real-time Clinical Decision Support alerts")
    public ResponseEntity<List<CdsAlert>> evaluate(@RequestBody CdsEvaluationRequest request) {
        return ResponseEntity.ok(cdsService.evaluatePatient(request));
    }
}

