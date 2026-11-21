package com.careplatform.ipd.controller;

import com.careplatform.ipd.model.Bed;
import com.careplatform.ipd.model.IpdAdmission;
import com.careplatform.ipd.model.Ward;
import com.careplatform.ipd.service.IpdService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ipd")
@RequiredArgsConstructor
@Tag(name = "Inpatient Department (IPD) & Bed Management", description = "Ward occupancy, bed matrix, patient admission, transfers, nursing observations & discharge summaries")
public class IpdController {

    private final IpdService ipdService;

    @GetMapping("/wards")
    @Operation(summary = "List all hospital wards for current tenant")
    public ResponseEntity<List<Ward>> getAllWards() {
        return ResponseEntity.ok(ipdService.getAllWards());
    }

    @PostMapping("/wards")
    @Operation(summary = "Create a new hospital ward")
    public ResponseEntity<Ward> createWard(@RequestBody Ward ward) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ipdService.createWard(ward));
    }

    @GetMapping("/beds")
    @Operation(summary = "List all hospital beds with real-time occupancy status")
    public ResponseEntity<List<Bed>> getAllBeds() {
        return ResponseEntity.ok(ipdService.getAllBeds());
    }

    @PostMapping("/beds")
    @Operation(summary = "Add a new bed to a ward")
    public ResponseEntity<Bed> createBed(@RequestBody Bed bed) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ipdService.createBed(bed));
    }

    @GetMapping("/admissions")
    @Operation(summary = "List all IPD admissions and currently admitted patients")
    public ResponseEntity<List<IpdAdmission>> getAllAdmissions() {
        return ResponseEntity.ok(ipdService.getAllAdmissions());
    }

    @GetMapping("/admissions/{id}")
    @Operation(summary = "Get single IPD admission details")
    public ResponseEntity<IpdAdmission> getAdmissionById(@PathVariable Long id) {
        return ResponseEntity.ok(ipdService.getAdmissionById(id));
    }

    @PostMapping("/admissions")
    @Operation(summary = "Admit a patient to a ward bed")
    public ResponseEntity<IpdAdmission> admitPatient(@RequestBody IpdAdmission admission) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ipdService.admitPatient(admission));
    }

    @PostMapping("/admissions/{id}/transfer")
    @Operation(summary = "Transfer admitted patient to another bed")
    public ResponseEntity<IpdAdmission> transferBed(@PathVariable Long id, @RequestBody Map<String, Long> payload) {
        Long newBedId = payload.get("newBedId");
        return ResponseEntity.ok(ipdService.transferBed(id, newBedId));
    }

    @PostMapping("/admissions/{id}/discharge")
    @Operation(summary = "Discharge patient and generate discharge summary")
    public ResponseEntity<IpdAdmission> dischargePatient(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String summary = payload.get("dischargeSummary");
        String advice = payload.get("dischargeAdvice");
        return ResponseEntity.ok(ipdService.dischargePatient(id, summary, advice));
    }

    @PatchMapping("/admissions/{id}/nursing-notes")
    @Operation(summary = "Update nursing notes and observation vitals for admitted patient")
    public ResponseEntity<IpdAdmission> updateNursingNotes(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String notes = payload.get("nursingNotes");
        return ResponseEntity.ok(ipdService.updateNursingNotes(id, notes));
    }

    @PatchMapping("/beds/{id}/status")
    @Operation(summary = "Update bed turnaround status (AVAILABLE, CLEANING, MAINTENANCE) and complete housekeeping")
    public ResponseEntity<Bed> updateBedStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String statusStr = payload.getOrDefault("status", "AVAILABLE");
        String staffName = payload.get("staffName");
        String reason = payload.get("reason");
        Bed.BedStatus status = Bed.BedStatus.valueOf(statusStr);
        return ResponseEntity.ok(ipdService.updateBedStatus(id, status, staffName, reason));
    }
}

