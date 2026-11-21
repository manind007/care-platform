package com.careplatform.assessment.controller;

import com.careplatform.assessment.model.AssessmentSubmission;
import com.careplatform.assessment.model.AssessmentTemplate;
import com.careplatform.assessment.service.AssessmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assessments")
@RequiredArgsConstructor
@Tag(name = "Assessments", description = "Clinical risk assessments (Falls, Skin/Waterlow, Nutrition, Mobility)")
public class AssessmentController {

    private final AssessmentService assessmentService;

    @GetMapping("/templates")
    @Operation(summary = "List all configurable assessment templates")
    public List<AssessmentTemplate> getTemplates() {
        return assessmentService.getTemplates();
    }

    @GetMapping("/templates/{id}")
    @Operation(summary = "Get assessment template with its questions")
    public AssessmentTemplate getTemplateById(@PathVariable Long id) {
        return assessmentService.getTemplateById(id);
    }

    @PostMapping("/submit")
    @PreAuthorize("hasAuthority('ASSESSMENT_WRITE') or hasRole('CARE_MANAGER') or hasRole('CARE_WORKER') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Submit a completed assessment with question answers and calculated score")
    public AssessmentSubmission submitAssessment(@RequestBody AssessmentSubmission submission) {
        return assessmentService.submitAssessment(submission);
    }

    @GetMapping("/client/{clientId}")
    @Operation(summary = "Get all completed assessments for a client")
    public List<AssessmentSubmission> getClientSubmissions(@PathVariable Long clientId) {
        return assessmentService.getClientSubmissions(clientId);
    }
}
