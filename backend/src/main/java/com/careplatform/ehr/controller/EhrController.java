package com.careplatform.ehr.controller;

import com.careplatform.ehr.dto.LongitudinalPatientRecord;
import com.careplatform.ehr.model.*;
import com.careplatform.ehr.service.EhrService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ehr")
@RequiredArgsConstructor
@Tag(name = "EHR & Longitudinal Patient Record", description = "Epic-grade EHR: 360° chart, allergies, problem list, medications, immunizations, procedures, SOAP notes, documents, and histories")
public class EhrController {

    private final EhrService ehrService;

    // 1. Unified 360° Chart
    @GetMapping("/patients/{clientId}/chart")
    @Operation(summary = "Get unified 360-degree longitudinal patient record (Epic Storyboard & Chart Review)")
    public ResponseEntity<LongitudinalPatientRecord> getLongitudinalRecord(@PathVariable Long clientId) {
        return ResponseEntity.ok(ehrService.getLongitudinalRecord(clientId));
    }

    // 2. Allergies
    @GetMapping("/patients/{clientId}/allergies")
    @Operation(summary = "Get patient allergies and adverse reactions")
    public ResponseEntity<List<PatientAllergy>> getAllergies(@PathVariable Long clientId) {
        return ResponseEntity.ok(ehrService.getAllergies(clientId));
    }

    @PostMapping("/patients/{clientId}/allergies")
    @Operation(summary = "Record a new allergy / adverse reaction")
    public ResponseEntity<PatientAllergy> addAllergy(@PathVariable Long clientId, @RequestBody PatientAllergy allergy) {
        allergy.setClientId(clientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ehrService.addAllergy(allergy));
    }

    @DeleteMapping("/allergies/{id}")
    @Operation(summary = "Delete an allergy record")
    public ResponseEntity<Void> deleteAllergy(@PathVariable Long id) {
        ehrService.deleteAllergy(id);
        return ResponseEntity.noContent().build();
    }

    // 3. Problem List
    @GetMapping("/patients/{clientId}/problems")
    @Operation(summary = "Get longitudinal problem list & diagnoses")
    public ResponseEntity<List<PatientProblem>> getProblems(@PathVariable Long clientId) {
        return ResponseEntity.ok(ehrService.getProblems(clientId));
    }

    @PostMapping("/patients/{clientId}/problems")
    @Operation(summary = "Add a problem / ICD-10 diagnosis to patient problem list")
    public ResponseEntity<PatientProblem> addProblem(@PathVariable Long clientId, @RequestBody PatientProblem problem) {
        problem.setClientId(clientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ehrService.addProblem(problem));
    }

    @PutMapping("/problems/{id}")
    @Operation(summary = "Update problem status, priority, or resolution date")
    public ResponseEntity<PatientProblem> updateProblem(@PathVariable Long id, @RequestBody PatientProblem updated) {
        return ResponseEntity.ok(ehrService.updateProblem(id, updated));
    }

    @DeleteMapping("/problems/{id}")
    @Operation(summary = "Delete a problem from problem list")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        ehrService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }

    // 4. Medications & Med Rec
    @GetMapping("/patients/{clientId}/medications")
    @Operation(summary = "Get active and historical medications")
    public ResponseEntity<List<PatientMedication>> getMedications(@PathVariable Long clientId) {
        return ResponseEntity.ok(ehrService.getMedications(clientId));
    }

    @PostMapping("/patients/{clientId}/medications")
    @Operation(summary = "Record a medication for reconciliation")
    public ResponseEntity<PatientMedication> addMedication(@PathVariable Long clientId, @RequestBody PatientMedication med) {
        med.setClientId(clientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ehrService.addMedication(med));
    }

    @PutMapping("/medications/{id}")
    @Operation(summary = "Update medication reconciliation status or instructions")
    public ResponseEntity<PatientMedication> updateMedication(@PathVariable Long id, @RequestBody PatientMedication updated) {
        return ResponseEntity.ok(ehrService.updateMedication(id, updated));
    }

    // 5. Immunizations
    @GetMapping("/patients/{clientId}/immunizations")
    @Operation(summary = "Get immunization / vaccine registry")
    public ResponseEntity<List<PatientImmunization>> getImmunizations(@PathVariable Long clientId) {
        return ResponseEntity.ok(ehrService.getImmunizations(clientId));
    }

    @PostMapping("/patients/{clientId}/immunizations")
    @Operation(summary = "Log an administered or historical immunization")
    public ResponseEntity<PatientImmunization> addImmunization(@PathVariable Long clientId, @RequestBody PatientImmunization immunization) {
        immunization.setClientId(clientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ehrService.addImmunization(immunization));
    }

    // 6. Procedures
    @GetMapping("/patients/{clientId}/procedures")
    @Operation(summary = "Get surgical & bedside procedure history")
    public ResponseEntity<List<PatientProcedure>> getProcedures(@PathVariable Long clientId) {
        return ResponseEntity.ok(ehrService.getProcedures(clientId));
    }

    @PostMapping("/patients/{clientId}/procedures")
    @Operation(summary = "Document a surgical or bedside procedure")
    public ResponseEntity<PatientProcedure> addProcedure(@PathVariable Long clientId, @RequestBody PatientProcedure procedure) {
        procedure.setClientId(clientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ehrService.addProcedure(procedure));
    }

    // 7. Histories
    @GetMapping("/patients/{clientId}/histories")
    @Operation(summary = "Get past medical, family, and social histories")
    public ResponseEntity<Map<String, Object>> getHistories(@PathVariable Long clientId) {
        Map<String, Object> map = new HashMap<>();
        map.put("pastMedicalHistory", ehrService.getPastMedicalHistory(clientId));
        map.put("familyHistory", ehrService.getFamilyHistory(clientId));
        map.put("socialHistory", ehrService.getSocialHistory(clientId));
        return ResponseEntity.ok(map);
    }

    @PostMapping("/patients/{clientId}/pmh")
    @Operation(summary = "Add past medical history item")
    public ResponseEntity<PastMedicalHistory> addPmh(@PathVariable Long clientId, @RequestBody PastMedicalHistory pmh) {
        pmh.setClientId(clientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ehrService.addPastMedicalHistory(pmh));
    }

    @PostMapping("/patients/{clientId}/family-history")
    @Operation(summary = "Add family health history item")
    public ResponseEntity<FamilyHistory> addFamilyHistory(@PathVariable Long clientId, @RequestBody FamilyHistory fh) {
        fh.setClientId(clientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ehrService.addFamilyHistory(fh));
    }

    @PostMapping("/patients/{clientId}/social-history")
    @Operation(summary = "Save / update social history")
    public ResponseEntity<SocialHistory> saveSocialHistory(@PathVariable Long clientId, @RequestBody SocialHistory sh) {
        sh.setClientId(clientId);
        return ResponseEntity.ok(ehrService.saveSocialHistory(sh));
    }

    // 8. Clinical Notes (SOAP Documentation)
    @GetMapping("/patients/{clientId}/notes")
    @Operation(summary = "Get clinical SOAP notes & progress reports")
    public ResponseEntity<List<ClinicalNote>> getClinicalNotes(@PathVariable Long clientId) {
        return ResponseEntity.ok(ehrService.getClinicalNotes(clientId));
    }

    @PostMapping("/patients/{clientId}/notes")
    @Operation(summary = "Create and sign a clinical SOAP note")
    public ResponseEntity<ClinicalNote> createClinicalNote(@PathVariable Long clientId, @RequestBody ClinicalNote note) {
        note.setClientId(clientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ehrService.createClinicalNote(note));
    }

    // 9. Clinical Documents & Attachments
    @GetMapping("/patients/{clientId}/documents")
    @Operation(summary = "Get clinical document attachments")
    public ResponseEntity<List<ClinicalDocument>> getClinicalDocuments(@PathVariable Long clientId) {
        return ResponseEntity.ok(ehrService.getClinicalDocuments(clientId));
    }

    @PostMapping("/patients/{clientId}/documents")
    @Operation(summary = "Upload / index a clinical document")
    public ResponseEntity<ClinicalDocument> addClinicalDocument(@PathVariable Long clientId, @RequestBody ClinicalDocument doc) {
        doc.setClientId(clientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ehrService.addClinicalDocument(doc));
    }
}

