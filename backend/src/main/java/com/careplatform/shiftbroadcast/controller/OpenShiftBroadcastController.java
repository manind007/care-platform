package com.careplatform.shiftbroadcast.controller;

import com.careplatform.common.security.UserPrincipal;
import com.careplatform.shiftbroadcast.model.OpenShiftBroadcast;
import com.careplatform.shiftbroadcast.service.OpenShiftBroadcastService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/shifts/broadcast")
@RequiredArgsConstructor
@Tag(name = "Open Shift Broadcasting & Claiming", description = "Broadcast unfilled care shifts to qualified carers, open shift claiming, and urgent visit coverage (AxisCare & CareSmartz360 Benchmark)")
public class OpenShiftBroadcastController {

    private final OpenShiftBroadcastService broadcastService;

    @GetMapping
    @Operation(summary = "List all shift broadcasts")
    public ResponseEntity<List<OpenShiftBroadcast>> getAllBroadcasts() {
        return ResponseEntity.ok(broadcastService.getAllBroadcasts());
    }

    @GetMapping("/open")
    @Operation(summary = "List currently available open shifts for claiming")
    public ResponseEntity<List<OpenShiftBroadcast>> getOpenBroadcasts() {
        return ResponseEntity.ok(broadcastService.getOpenBroadcasts());
    }

    @PostMapping
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Broadcast a new unfilled or urgent care shift")
    public ResponseEntity<OpenShiftBroadcast> broadcastShift(@RequestBody OpenShiftBroadcast broadcast) {
        return ResponseEntity.status(HttpStatus.CREATED).body(broadcastService.broadcastShift(broadcast));
    }

    @PostMapping("/{id}/claim")
    @Operation(summary = "Care worker claims an open shift in real time")
    public ResponseEntity<OpenShiftBroadcast> claimShift(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Map<String, String> payload) {
        Long userId = (principal != null) ? principal.getId() : 5L;
        String carerName = (principal != null) ? principal.getFullName() : (payload != null ? payload.getOrDefault("carerName", "Senior Carer") : "Senior Carer");
        return ResponseEntity.ok(broadcastService.claimShift(id, userId, carerName));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Cancel an open shift broadcast")
    public ResponseEntity<OpenShiftBroadcast> cancelBroadcast(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload) {
        String reason = (payload != null) ? payload.get("reason") : null;
        return ResponseEntity.ok(broadcastService.cancelBroadcast(id, reason));
    }
}

