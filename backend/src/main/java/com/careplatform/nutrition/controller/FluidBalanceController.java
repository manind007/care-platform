package com.careplatform.nutrition.controller;

import com.careplatform.nutrition.model.FluidBalanceEntry;
import com.careplatform.nutrition.service.FluidBalanceService;
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
@RequestMapping("/api/v1/nutrition")
@RequiredArgsConstructor
@Tag(name = "Hydration, Nutrition & Fluid Balance", description = "24-hour fluid intake vs output, dehydration risk monitoring, and IDDSI diet textures")
public class FluidBalanceController {

    private final FluidBalanceService fluidService;

    @GetMapping("/client/{clientId}/history")
    @Operation(summary = "Get complete fluid balance history for a client")
    public List<FluidBalanceEntry> getClientHistory(@PathVariable Long clientId) {
        return fluidService.getClientHistory(clientId);
    }

    @GetMapping("/client/{clientId}/today-summary")
    @Operation(summary = "Get today's 24-hour hydration target, intake, output & net balance")
    public Map<String, Object> getTodaySummary(@PathVariable Long clientId) {
        return fluidService.getTodaySummary(clientId);
    }

    @PostMapping("/client/{clientId}/entry")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_WORKER') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Record fluid intake or output entry")
    public ResponseEntity<FluidBalanceEntry> recordEntry(
            @PathVariable Long clientId,
            @RequestBody FluidBalanceEntry entry) {
        entry.setClientId(clientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(fluidService.recordEntry(entry));
    }
}

