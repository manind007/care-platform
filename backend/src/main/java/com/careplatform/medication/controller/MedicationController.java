package com.careplatform.medication.controller;

import com.careplatform.common.security.UserPrincipal;
import com.careplatform.medication.dto.RecordAdministrationRequest;
import com.careplatform.medication.model.Medication;
import com.careplatform.medication.model.MedicationAdministration;
import com.careplatform.medication.model.MedicationReconciliation;
import com.careplatform.medication.service.MedicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Medications & eMAR", description = "Electronic Medication Administration Records (eMAR) and prescription regimens")
public class MedicationController {

    private final MedicationService medicationService;

    @GetMapping("/medications/client/{clientId}")
    @Operation(summary = "Get all active prescribed medications for a client")
    public List<Medication> getClientMedications(@PathVariable Long clientId) {
        return medicationService.getClientMedications(clientId);
    }

    @PostMapping("/medications")
    @PreAuthorize("hasAuthority('CAREPLAN_WRITE') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Prescribe or register a medication for a client")
    public Medication addMedication(@Valid @RequestBody Medication medication) {
        return medicationService.addMedication(medication);
    }

    @PostMapping("/emar/administer")
    @PreAuthorize("hasAuthority('MEDICATION_ADMINISTER') or hasRole('CARE_WORKER') or hasRole('ORG_ADMIN') or hasRole('CARE_MANAGER') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Record medication round outcome (ADMINISTERED, REFUSED, MISSED, etc.)")
    public MedicationAdministration recordAdministration(
            @Valid @RequestBody RecordAdministrationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long workerId = principal != null ? principal.getId() : 1L;
        String workerName = principal != null ? principal.getFullName() : "Carer";
        return medicationService.recordAdministration(request, workerId, workerName);
    }

    @GetMapping("/emar/history/{clientId}")
    @Operation(summary = "Get complete eMAR administration history for a client")
    public List<MedicationAdministration> getAdministrationHistory(@PathVariable Long clientId) {
        return medicationService.getAdministrationHistory(clientId);
    }

    @GetMapping("/emar/exceptions")
    @Operation(summary = "Get list of medication exceptions (refused, missed, withheld) requiring alert")
    public List<MedicationAdministration> getTodayExceptions() {
        return medicationService.getTodayExceptions();
    }

    @PostMapping("/emar/prn-effectiveness")
    @PreAuthorize("hasAuthority('MEDICATION_ADMINISTER') or hasRole('CARE_WORKER') or hasRole('ORG_ADMIN') or hasRole('CARE_MANAGER') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Record post-dose PRN effectiveness evaluation")
    public ResponseEntity<MedicationAdministration> recordPrnEffectiveness(@RequestBody Map<String, Object> payload) {
        Long adminId = Long.valueOf(payload.get("adminId").toString());
        String effectiveness = (String) payload.get("effectiveness");
        return ResponseEntity.ok(medicationService.recordPrnEffectiveness(adminId, effectiveness));
    }

    @PostMapping("/emar/exceptions/{id}/resolve")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Office / Clinical resolution of medication exception alert")
    public ResponseEntity<MedicationAdministration> resolveException(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String resolutionNotes = payload.getOrDefault("resolutionNotes", "Resolved by care office");
        return ResponseEntity.ok(medicationService.resolveException(id, resolutionNotes));
    }

    @PatchMapping("/medications/{id}/status")
    @PreAuthorize("hasAuthority('CAREPLAN_WRITE') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Update medication lifecycle status (ACTIVE, SUSPENDED, DISCONTINUED)")
    public ResponseEntity<Medication> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String status = payload.getOrDefault("status", "ACTIVE");
        return ResponseEntity.ok(medicationService.updateMedicationStatus(id, status));
    }

    @PostMapping("/medications/{id}/reorder")
    @Operation(summary = "Submit repeat prescription reorder request")
    public ResponseEntity<Medication> reorderRepeat(@PathVariable Long id) {
        return ResponseEntity.ok(medicationService.reorderRepeatPrescription(id));
    }

    @PostMapping("/medications/{id}/receive-stock")
    @Operation(summary = "Record receipt of new medication stock from pharmacy")
    public ResponseEntity<Medication> receiveStock(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> payload) {
        Integer qty = payload.getOrDefault("quantity", 28);
        return ResponseEntity.ok(medicationService.receiveMedicationStock(id, qty));
    }

    @GetMapping("/medications/client/{clientId}/reconciliations")
    @Operation(summary = "Get hospital discharge and GP medication reconciliations")
    public ResponseEntity<List<MedicationReconciliation>> getReconciliations(@PathVariable Long clientId) {
        return ResponseEntity.ok(medicationService.getReconciliations(clientId));
    }

    @PostMapping("/medications/client/{clientId}/reconciliations")
    @PreAuthorize("hasAuthority('CAREPLAN_WRITE') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Create and record hospital discharge medication reconciliation")
    public ResponseEntity<MedicationReconciliation> createReconciliation(
            @PathVariable Long clientId,
            @RequestBody MedicationReconciliation rec) {
        rec.setClientId(clientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(medicationService.createReconciliation(rec));
    }

    @GetMapping("/emar/monthly-grid/{clientId}")
    @Operation(summary = "Get structured monthly 28/31-day MAR grid for CQC inspection audit")
    public ResponseEntity<Map<String, Object>> getMonthlyMarGrid(
            @PathVariable Long clientId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        return ResponseEntity.ok(medicationService.getMonthlyMarGrid(clientId, year, month));
    }
}
