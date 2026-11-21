package com.careplatform.emergency.controller;

import com.careplatform.emergency.model.EmergencyTriage;
import com.careplatform.emergency.service.EmergencyTriageService;
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
@RequestMapping("/api/v1/emergency")
@RequiredArgsConstructor
@Tag(name = "Emergency Department (ED) & Trauma Triage", description = "Emergency Severity Index (ESI Levels 1-5), ambulance pre-arrival, rapid resuscitation, and fast-track IPD/OT transfers")
public class EmergencyTriageController {

    private final EmergencyTriageService triageService;

    @GetMapping("/triage")
    @Operation(summary = "List all emergency triage cases")
    public ResponseEntity<List<EmergencyTriage>> getAllTriageCases() {
        return ResponseEntity.ok(triageService.getAllTriageCases());
    }

    @GetMapping("/queue")
    @Operation(summary = "Get prioritized active emergency queue sorted by ESI acuity level (Level 1 first)")
    public ResponseEntity<List<EmergencyTriage>> getActiveQueue() {
        return ResponseEntity.ok(triageService.getActiveQueue());
    }

    @GetMapping("/triage/{id}")
    @Operation(summary = "Get specific emergency triage case details")
    public ResponseEntity<EmergencyTriage> getTriageById(@PathVariable Long id) {
        return ResponseEntity.ok(triageService.getTriageById(id));
    }

    @PostMapping("/triage")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_WORKER') or hasRole('CARE_COORDINATOR') or hasAuthority('CLIENT_WRITE')")
    @Operation(summary = "Register incoming emergency patient or ambulance pre-arrival intake")
    public ResponseEntity<EmergencyTriage> registerTriageCase(@RequestBody EmergencyTriage triage) {
        return ResponseEntity.status(HttpStatus.CREATED).body(triageService.registerTriageCase(triage));
    }

    @PatchMapping("/triage/{id}/vitals")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_WORKER') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Update emergency vitals, ESI triage level, and interventions")
    public ResponseEntity<EmergencyTriage> updateVitalsAndEsi(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Integer hr = payload.get("heartRate") != null ? Integer.valueOf(payload.get("heartRate").toString()) : null;
        String bp = (String) payload.get("bloodPressure");
        Integer rr = payload.get("respiratoryRate") != null ? Integer.valueOf(payload.get("respiratoryRate").toString()) : null;
        Integer spo2 = payload.get("oxygenSaturation") != null ? Integer.valueOf(payload.get("oxygenSaturation").toString()) : null;
        Double temp = payload.get("temperature") != null ? Double.valueOf(payload.get("temperature").toString()) : null;
        Integer gcs = payload.get("glasgowComaScale") != null ? Integer.valueOf(payload.get("glasgowComaScale").toString()) : null;
        Integer pain = payload.get("painScore") != null ? Integer.valueOf(payload.get("painScore").toString()) : null;
        Integer esi = payload.get("esiLevel") != null ? Integer.valueOf(payload.get("esiLevel").toString()) : null;
        String interventions = (String) payload.get("clinicalInterventions");

        return ResponseEntity.ok(triageService.updateVitalsAndEsi(id, hr, bp, rr, spo2, temp, gcs, pain, esi, interventions));
    }

    @PostMapping("/triage/{id}/admit-ipd")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Fast-track admit emergency patient directly into an Inpatient (IPD) ward bed")
    public ResponseEntity<EmergencyTriage> fastTrackAdmitToIpd(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Long bedId = payload.get("bedId") != null ? Long.valueOf(payload.get("bedId").toString()) : null;
        String doctor = (String) payload.get("admittingDoctor");
        String diagnosis = (String) payload.get("diagnosis");
        return ResponseEntity.ok(triageService.fastTrackAdmitToIpd(id, bedId, doctor, diagnosis));
    }

    @PostMapping("/triage/{id}/transfer-ot")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Emergency transfer to Operation Theatre")
    public ResponseEntity<EmergencyTriage> transferToOt(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String team = payload.getOrDefault("surgicalTeam", "Emergency On-Call Surgical Team");
        String procedure = payload.getOrDefault("procedureName", "Emergency Exploratory / Trauma Surgery");
        return ResponseEntity.ok(triageService.transferToOt(id, team, procedure));
    }

    @PostMapping("/triage/{id}/discharge")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Discharge stabilized patient from Emergency Department")
    public ResponseEntity<EmergencyTriage> dischargeFromEr(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String summary = payload.get("summary");
        return ResponseEntity.ok(triageService.dischargeFromEr(id, summary));
    }
}

