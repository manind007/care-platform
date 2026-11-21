package com.careplatform.ai.controller;

import com.careplatform.ai.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI Assistive Services", description = "Operational intelligence: note summaries, scheduling assistance, care plan drafting, risk signals")
public class AiController {

    private final AiService aiService;

    @GetMapping("/care-note-summary/{clientId}")
    @PreAuthorize("hasAuthority('AI_ASSIST') or hasRole('CARE_MANAGER') or hasRole('CARE_WORKER') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Summarise client care notes and flag items requiring human review")
    public Map<String, Object> summarizeNotes(@PathVariable Long clientId) {
        return aiService.summarizeCareNotes(clientId);
    }

    @GetMapping("/schedule-assistance/{visitId}")
    @PreAuthorize("hasAuthority('AI_ASSIST') or hasRole('CARE_COORDINATOR') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Suggest worker assignments using skills, continuity, and travel proximity")
    public Map<String, Object> suggestAssignment(@PathVariable Long visitId) {
        return aiService.suggestScheduleAssignment(visitId);
    }

    @GetMapping("/care-plan-draft/{clientId}")
    @PreAuthorize("hasAuthority('AI_ASSIST') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Draft a person-centred care plan with goals and tasks from assessments")
    public Map<String, Object> draftCarePlan(
            @PathVariable Long clientId,
            @RequestParam(required = false) String focus) {
        return aiService.draftCarePlan(clientId, focus);
    }

    @GetMapping("/risk-signals/{clientId}")
    @PreAuthorize("hasAuthority('AI_ASSIST') or hasRole('CARE_MANAGER') or hasRole('AUDIT_TEAM') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Scan care records, incidents, and eMAR exceptions for risk patterns")
    public Map<String, Object> detectRiskSignals(@PathVariable Long clientId) {
        return aiService.detectRiskSignals(clientId);
    }
}
