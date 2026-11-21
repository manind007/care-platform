package com.careplatform.hospital.controller;

import com.careplatform.hospital.model.BloodBankUnit;
import com.careplatform.hospital.model.OperationTheatreBooking;
import com.careplatform.hospital.service.HospitalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hospital")
@RequiredArgsConstructor
@Tag(name = "Hospital Specialities (OT & Blood Bank)", description = "Operation Theatre scheduling, surgical teams, and Blood Bank unit inventory")
public class HospitalController {

    private final HospitalService hospitalService;

    @GetMapping("/ot-bookings")
    @Operation(summary = "List all Operation Theatre bookings")
    public ResponseEntity<List<OperationTheatreBooking>> getAllOtBookings() {
        return ResponseEntity.ok(hospitalService.getAllOtBookings());
    }

    @PostMapping("/ot-bookings")
    @Operation(summary = "Schedule a surgical procedure in Operation Theatre")
    public ResponseEntity<OperationTheatreBooking> createOtBooking(@RequestBody OperationTheatreBooking booking) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hospitalService.createOtBooking(booking));
    }

    @PatchMapping("/ot-bookings/{id}/status")
    @Operation(summary = "Update surgery execution status and operative notes")
    public ResponseEntity<OperationTheatreBooking> updateOtStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        OperationTheatreBooking.SurgeryStatus status = OperationTheatreBooking.SurgeryStatus.valueOf(payload.get("status"));
        String operativeNotes = payload.get("operativeNotes");
        return ResponseEntity.ok(hospitalService.updateOtStatus(id, status, operativeNotes));
    }

    @GetMapping("/blood-units")
    @Operation(summary = "List all Blood Bank inventory units")
    public ResponseEntity<List<BloodBankUnit>> getAllBloodUnits() {
        return ResponseEntity.ok(hospitalService.getAllBloodUnits());
    }

    @PostMapping("/blood-units")
    @Operation(summary = "Log new collected blood unit into Blood Bank")
    public ResponseEntity<BloodBankUnit> addBloodUnit(@RequestBody BloodBankUnit unit) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hospitalService.addBloodUnit(unit));
    }

    @PostMapping("/blood-units/{id}/reserve")
    @Operation(summary = "Reserve blood unit for patient surgery or transfusion")
    public ResponseEntity<BloodBankUnit> reserveBloodUnit(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String uhid = payload.get("uhid");
        String patientName = payload.get("patientName");
        return ResponseEntity.ok(hospitalService.reserveBloodUnit(id, uhid, patientName));
    }
}

