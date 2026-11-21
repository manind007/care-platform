package com.careplatform.ehr.controller;

import com.careplatform.ehr.model.SpecialtyConsultation;
import com.careplatform.ehr.service.SpecialtyConsultationService;
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
@RequestMapping("/api/v1/ehr/specialty")
@RequiredArgsConstructor
@Tag(name = "Specialty EMR Consultation Templates", description = "Specialty-specific clinical charting for Cardiology, Pediatrics, OB/GYN, and Oncology (KareXpert & Medinous Benchmark)")
public class SpecialtyConsultationController {

    private final SpecialtyConsultationService specialtyService;

    @GetMapping("/consultations")
    @Operation(summary = "List all multi-speciality consultations")
    public ResponseEntity<List<SpecialtyConsultation>> getAllConsultations() {
        return ResponseEntity.ok(specialtyService.getAllConsultations());
    }

    @GetMapping("/consultations/patient/{uhid}")
    @Operation(summary = "Get specialty consultations for a patient by UHID")
    public ResponseEntity<List<SpecialtyConsultation>> getConsultationsByUhid(@PathVariable String uhid) {
        return ResponseEntity.ok(specialtyService.getConsultationsByUhid(uhid));
    }

    @GetMapping("/consultations/specialty/{code}")
    @Operation(summary = "Get consultations filtered by specialty code (CARDIOLOGY, PEDIATRICS, OBGYN, ONCOLOGY)")
    public ResponseEntity<List<SpecialtyConsultation>> getConsultationsBySpecialty(@PathVariable String code) {
        return ResponseEntity.ok(specialtyService.getConsultationsBySpecialty(code));
    }

    @GetMapping("/templates")
    @Operation(summary = "Get structured specialty clinical template schemas (Cardiology, Pediatrics, OB/GYN, Oncology)")
    public ResponseEntity<Map<String, Object>> getSpecialtyTemplates() {
        return ResponseEntity.ok(specialtyService.getSpecialtyTemplates());
    }

    @PostMapping("/consultations")
    @PreAuthorize("hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR') or hasAuthority('CLIENT_WRITE')")
    @Operation(summary = "Record a new specialty clinical consultation note")
    public ResponseEntity<SpecialtyConsultation> recordConsultation(@RequestBody SpecialtyConsultation consultation) {
        return ResponseEntity.status(HttpStatus.CREATED).body(specialtyService.recordConsultation(consultation));
    }
}

