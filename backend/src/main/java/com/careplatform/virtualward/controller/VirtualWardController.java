package com.careplatform.virtualward.controller;

import com.careplatform.virtualward.model.VirtualWardStay;
import com.careplatform.virtualward.service.VirtualWardService;
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
@RequestMapping("/api/v1/virtual-ward")
@RequiredArgsConstructor
@Tag(name = "Virtual Ward & Hospital-at-Home", description = "Acute hospital-level care delivered in the patient's home")
public class VirtualWardController {

    private final VirtualWardService virtualWardService;

    @GetMapping
    @Operation(summary = "Get all virtual ward stays")
    public List<VirtualWardStay> getAllStays() {
        return virtualWardService.getAllStays();
    }

    @GetMapping("/active")
    @Operation(summary = "Get active virtual ward stays")
    public List<VirtualWardStay> getActiveStays() {
        return virtualWardService.getActiveStays();
    }

    @PostMapping("/admit")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR') or hasAuthority('CAREPLAN_WRITE')")
    @Operation(summary = "Admit an acute hospital patient to the Virtual Ward")
    public ResponseEntity<VirtualWardStay> admitPatient(@RequestBody VirtualWardStay stay) {
        return ResponseEntity.status(HttpStatus.CREATED).body(virtualWardService.admitPatient(stay));
    }

    @PostMapping("/{id}/remote-round")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_WORKER') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Record clinician remote ward round & biometric telemetry")
    public ResponseEntity<VirtualWardStay> recordRemoteRound(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        String roundNotes = (String) payload.getOrDefault("notes", "Daily virtual ward round conducted");
        Integer spo2 = payload.get("spo2") != null ? Integer.valueOf(payload.get("spo2").toString()) : null;
        Integer heartRate = payload.get("heartRate") != null ? Integer.valueOf(payload.get("heartRate").toString()) : null;
        String bp = (String) payload.get("bp");
        Double temp = payload.get("temp") != null ? Double.valueOf(payload.get("temp").toString()) : null;

        return ResponseEntity.ok(virtualWardService.recordRemoteRound(id, roundNotes, spo2, heartRate, bp, temp));
    }

    @PostMapping("/{id}/discharge")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Discharge patient from Virtual Ward to standard community care")
    public ResponseEntity<VirtualWardStay> dischargePatient(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String summary = payload.getOrDefault("summary", "Patient stabilized and stepped down to standard home care.");
        return ResponseEntity.ok(virtualWardService.dischargePatient(id, summary));
    }
}

