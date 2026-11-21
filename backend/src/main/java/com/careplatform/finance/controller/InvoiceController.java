package com.careplatform.finance.controller;

import com.careplatform.finance.model.Invoice;
import com.careplatform.finance.model.InvoiceStatus;
import com.careplatform.finance.model.Payment;
import com.careplatform.finance.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
@Tag(name = "Finance & Invoicing", description = "Automated billable activity invoice generation and payment records")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    @Operation(summary = "List all invoices for tenant")
    public List<Invoice> getInvoices() {
        return invoiceService.getAllInvoices();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get invoice breakdown by ID")
    public Invoice getInvoiceById(@PathVariable Long id) {
        return invoiceService.getInvoiceById(id);
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('FINANCE_MANAGE') or hasRole('FINANCE_ADMIN') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Generate invoice from completed visits for client over period")
    public Invoice generateInvoice(
            @RequestParam Long clientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        LocalDate start = periodStart != null ? periodStart : LocalDate.now().minusDays(14);
        LocalDate end = periodEnd != null ? periodEnd : LocalDate.now();
        return invoiceService.generateInvoiceForClient(clientId, start, end);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('FINANCE_MANAGE') or hasRole('FINANCE_ADMIN') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Update invoice status (ISSUED, VOID, etc.)")
    public Invoice updateStatus(
            @PathVariable Long id,
            @RequestParam InvoiceStatus status) {
        return invoiceService.updateInvoiceStatus(id, status);
    }

    @PostMapping("/{id}/payments")
    @PreAuthorize("hasAuthority('FINANCE_MANAGE') or hasRole('FINANCE_ADMIN') or hasRole('ORG_ADMIN')")
    @Operation(summary = "Record a payment received for an invoice")
    public Payment recordPayment(
            @PathVariable Long id,
            @RequestParam BigDecimal amount,
            @RequestParam(defaultValue = "DIRECT_DEBIT") String method,
            @RequestParam(required = false) String reference) {
        return invoiceService.recordPayment(id, amount, method, reference);
    }
}
