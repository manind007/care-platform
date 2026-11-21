package com.careplatform.visit.controller;

import com.careplatform.common.security.UserPrincipal;
import com.careplatform.visit.dto.CheckInRequest;
import com.careplatform.visit.dto.CheckOutRequest;
import com.careplatform.visit.model.Visit;
import com.careplatform.visit.service.VisitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/visits")
@RequiredArgsConstructor
@Tag(name = "Visits & Rostering", description = "Shift scheduling, assignments, and Electronic Call Monitoring (ECM)")
public class VisitController {

    private final VisitService visitService;

    @GetMapping
    @Operation(summary = "List visits (optional client filter)")
    public List<Visit> getVisits(@RequestParam(required = false) Long clientId) {
        if (clientId != null) {
            return visitService.getVisitsByClient(clientId);
        }
        return visitService.getAllVisits();
    }

    @GetMapping("/today")
    @Operation(summary = "List today's scheduled visits (optional staffId filter for carer view)")
    public List<Visit> getTodayVisits(@RequestParam(required = false) Long staffId) {
        return visitService.getVisitsForToday(staffId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get visit details by ID")
    public Visit getVisitById(@PathVariable Long id) {
        return visitService.getVisitById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('VISIT_WRITE') or hasRole('CARE_COORDINATOR') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Schedule a new care visit")
    public Visit createVisit(@RequestBody Visit visit) {
        return visitService.createVisit(visit);
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAuthority('VISIT_CHECKIN') or hasRole('CARE_WORKER') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Care Worker check-in with GPS or QR code token")
    public Visit checkIn(
            @PathVariable Long id,
            @RequestBody CheckInRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String username = principal != null ? principal.getFullName() : "Carer";
        return visitService.checkIn(id, request, username);
    }

    @PostMapping("/{id}/check-out")
    @PreAuthorize("hasAuthority('VISIT_CHECKIN') or hasRole('CARE_WORKER') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Care Worker check-out with GPS, outcome verification, and care notes")
    public Visit checkOut(
            @PathVariable Long id,
            @RequestBody CheckOutRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        String username = principal != null ? principal.getFullName() : "Carer";
        return visitService.checkOut(id, request, username);
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAuthority('VISIT_WRITE') or hasRole('CARE_COORDINATOR') or hasRole('ORG_ADMIN') or hasRole('CARE_MANAGER')")
    @Operation(summary = "Assign or reassign staff member to visit")
    public Visit assignStaff(
            @PathVariable Long id,
            @RequestParam Long staffId,
            @RequestParam String staffName) {
        return visitService.assignStaff(id, staffId, staffName);
    }
}
