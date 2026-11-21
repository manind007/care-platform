package com.careplatform.diagnostics.controller;

import com.careplatform.diagnostics.model.DiagnosticOrder;
import com.careplatform.diagnostics.service.DiagnosticService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/diagnostics")
@RequiredArgsConstructor
@Tag(name = "Diagnostics & Laboratory", description = "Pathology & Radiology test orders, sample collection tracking, and result reporting")
public class DiagnosticController {

    private final DiagnosticService diagnosticService;

    @GetMapping("/orders")
    @Operation(summary = "List all diagnostic investigation orders")
    public ResponseEntity<List<DiagnosticOrder>> getAllOrders() {
        return ResponseEntity.ok(diagnosticService.getAllOrders());
    }

    @GetMapping("/orders/{id}")
    @Operation(summary = "Get single diagnostic order with results")
    public ResponseEntity<DiagnosticOrder> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(diagnosticService.getOrderById(id));
    }

    @PostMapping("/orders")
    @Operation(summary = "Create a new diagnostic test order")
    public ResponseEntity<DiagnosticOrder> createOrder(@RequestBody DiagnosticOrder order) {
        return ResponseEntity.status(HttpStatus.CREATED).body(diagnosticService.createOrder(order));
    }

    @PostMapping("/orders/{id}/collect-sample")
    @Operation(summary = "Mark sample / specimen as collected")
    public ResponseEntity<DiagnosticOrder> collectSample(@PathVariable Long id) {
        return ResponseEntity.ok(diagnosticService.collectSample(id));
    }

    @PostMapping("/orders/{id}/result")
    @Operation(summary = "Record diagnostic test result values, normal ranges and pathologist verification")
    public ResponseEntity<DiagnosticOrder> recordResult(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String resultValue = (String) payload.get("resultValue");
        String referenceRange = (String) payload.get("referenceRange");
        String unit = (String) payload.get("unit");
        Boolean isAbnormal = (Boolean) payload.get("isAbnormal");
        String verifiedBy = (String) payload.get("verifiedBy");
        return ResponseEntity.ok(diagnosticService.recordResult(id, resultValue, referenceRange, unit, isAbnormal, verifiedBy));
    }

    @DeleteMapping("/orders/{id}")
    @Operation(summary = "Cancel / Delete a diagnostic order")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        diagnosticService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}

