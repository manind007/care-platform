package com.careplatform.careplan.controller;

import com.careplatform.careplan.model.CarePlan;
import com.careplatform.careplan.model.CarePlanStatus;
import com.careplatform.careplan.model.CarePlanVersion;
import com.careplatform.careplan.service.CarePlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/care-plans")
@RequiredArgsConstructor
@Tag(name = "Care Plans", description = "Person-centred care planning, versioning, and approval workflows")
public class CarePlanController {

    private final CarePlanService carePlanService;

    @GetMapping
    @Operation(summary = "List all care plans (optional client filter)")
    public List<CarePlan> getCarePlans(@RequestParam(required = false) Long clientId) {
        if (clientId != null) {
            return carePlanService.getPlansByClient(clientId);
        }
        return carePlanService.getAllPlans();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get care plan by ID including goals and tasks")
    public CarePlan getCarePlanById(@PathVariable Long id) {
        return carePlanService.getPlanById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CAREPLAN_WRITE') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Create a new person-centred care plan draft")
    public CarePlan createCarePlan(@RequestBody CarePlan plan) {
        return carePlanService.createPlan(plan);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CAREPLAN_WRITE') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Update care plan content")
    public CarePlan updateCarePlan(@PathVariable Long id, @RequestBody CarePlan plan) {
        return carePlanService.updatePlan(id, plan);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('CAREPLAN_APPROVE') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Advance care plan status (DRAFT, UNDER_REVIEW, APPROVED, ACTIVE, ARCHIVED)")
    public CarePlan updateStatus(
            @PathVariable Long id,
            @RequestParam CarePlanStatus status,
            @AuthenticationPrincipal UserDetails principal) {
        String reviewer = principal != null ? principal.getUsername() : "CareManager";
        return carePlanService.updateStatus(id, status, reviewer);
    }

    @PostMapping("/{id}/new-version")
    @PreAuthorize("hasAuthority('CAREPLAN_WRITE') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Fork a new version of the care plan (archives current active version)")
    public CarePlan createNewVersion(@PathVariable Long id) {
        return carePlanService.createNewVersion(id);
    }

    @GetMapping("/{id}/versions")
    @Operation(summary = "Get historical versions of care plan")
    public List<CarePlanVersion> getVersions(@PathVariable Long id) {
        return carePlanService.getVersionHistory(id);
    }
}
