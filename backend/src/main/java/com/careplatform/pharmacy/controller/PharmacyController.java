package com.careplatform.pharmacy.controller;

import com.careplatform.pharmacy.model.MedicineBatch;
import com.careplatform.pharmacy.model.MedicineMaster;
import com.careplatform.pharmacy.model.PharmacyDispensation;
import com.careplatform.pharmacy.service.PharmacyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pharmacy")
@RequiredArgsConstructor
@Tag(name = "Pharmacy & Inventory Management", description = "Medicine master catalog, batch tracking, expiry alerts and automated dispensing")
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping("/medicines")
    @Operation(summary = "List all registered medicine products and inventory levels")
    public ResponseEntity<List<MedicineMaster>> getAllMedicines() {
        return ResponseEntity.ok(pharmacyService.getAllMedicines());
    }

    @PostMapping("/medicines")
    @Operation(summary = "Add a new medicine to master catalog")
    public ResponseEntity<MedicineMaster> createMedicine(@RequestBody MedicineMaster medicine) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacyService.createMedicine(medicine));
    }

    @GetMapping("/batches")
    @Operation(summary = "List all medicine batches with expiry dates and current stock")
    public ResponseEntity<List<MedicineBatch>> getAllBatches() {
        return ResponseEntity.ok(pharmacyService.getAllBatches());
    }

    @PostMapping("/batches")
    @Operation(summary = "Receive / Add new medicine batch stock")
    public ResponseEntity<MedicineBatch> addBatch(@RequestBody MedicineBatch batch) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacyService.addBatch(batch));
    }

    @GetMapping("/dispensations")
    @Operation(summary = "List all pharmacy prescription dispensations")
    public ResponseEntity<List<PharmacyDispensation>> getAllDispensations() {
        return ResponseEntity.ok(pharmacyService.getAllDispensations());
    }

    @PostMapping("/dispense")
    @Operation(summary = "Dispense prescribed medication and decrement inventory stock")
    public ResponseEntity<PharmacyDispensation> dispenseMedicine(@RequestBody PharmacyDispensation dispensation) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacyService.dispenseMedicine(dispensation));
    }

    @GetMapping("/alerts/expiring")
    @Operation(summary = "Get batches expiring within specified days (default 30)")
    public ResponseEntity<List<MedicineBatch>> getExpiringBatches(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(pharmacyService.getExpiringBatches(days));
    }
}

