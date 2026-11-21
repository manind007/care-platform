package com.careplatform.opd.controller;

import com.careplatform.opd.model.OpdAppointment;
import com.careplatform.opd.service.OpdService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/opd")
@RequiredArgsConstructor
@Tag(name = "Outpatient Department (OPD)", description = "OPD scheduling, token queues, clinical consultation & e-prescriptions")
public class OpdController {

    private final OpdService opdService;

    @GetMapping("/appointments")
    @Operation(summary = "List all OPD appointments and queue for current tenant")
    public ResponseEntity<List<OpdAppointment>> getAllAppointments() {
        return ResponseEntity.ok(opdService.getAllAppointments());
    }

    @GetMapping("/appointments/{id}")
    @Operation(summary = "Get single OPD appointment consultation details")
    public ResponseEntity<OpdAppointment> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(opdService.getAppointmentById(id));
    }

    @PostMapping("/appointments")
    @Operation(summary = "Book / Register a new OPD appointment with auto token")
    public ResponseEntity<OpdAppointment> createAppointment(@RequestBody OpdAppointment appointment) {
        return ResponseEntity.status(HttpStatus.CREATED).body(opdService.createAppointment(appointment));
    }

    @PutMapping("/appointments/{id}")
    @Operation(summary = "Update OPD consultation notes, diagnosis, vitals & e-prescriptions")
    public ResponseEntity<OpdAppointment> updateConsultation(@PathVariable Long id, @RequestBody OpdAppointment updated) {
        return ResponseEntity.ok(opdService.updateConsultation(id, updated));
    }

    @DeleteMapping("/appointments/{id}")
    @Operation(summary = "Cancel or delete an OPD appointment")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        opdService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
}

