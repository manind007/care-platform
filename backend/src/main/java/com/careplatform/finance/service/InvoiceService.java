package com.careplatform.finance.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.client.model.Client;
import com.careplatform.client.service.ClientService;
import com.careplatform.common.exception.ResourceNotFoundException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.finance.model.Invoice;
import com.careplatform.finance.model.InvoiceLine;
import com.careplatform.finance.model.InvoiceStatus;
import com.careplatform.finance.model.Payment;
import com.careplatform.finance.repository.InvoiceRepository;
import com.careplatform.finance.repository.PaymentRepository;
import com.careplatform.visit.model.Visit;
import com.careplatform.visit.model.VisitStatus;
import com.careplatform.visit.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final VisitRepository visitRepository;
    private final ClientService clientService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findByTenantId(TenantContext.getTenantId());
    }

    @Transactional(readOnly = true)
    public Invoice getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + id));
        invoice.getLines().size();
        return invoice;
    }

    @Transactional
    public Invoice generateInvoiceForClient(Long clientId, LocalDate periodStart, LocalDate periodEnd) {
        Client client = clientService.getClientById(clientId);
        List<Visit> visits = visitRepository.findByTenantIdAndClientId(TenantContext.getTenantId(), clientId);

        Invoice invoice = Invoice.builder()
                .invoiceNumber("INV-" + System.currentTimeMillis() % 1000000)
                .clientId(clientId)
                .clientName(client.getFirstName() + " " + client.getLastName())
                .billingTo(client.getFundingType() != null ? client.getFundingType() : "Private Client")
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .dueDate(LocalDate.now().plusDays(30))
                .status(InvoiceStatus.ISSUED)
                .lines(new ArrayList<>())
                .build();
        invoice.setTenantId(TenantContext.getTenantId());

        BigDecimal subtotal = BigDecimal.ZERO;

        for (Visit v : visits) {
            if (v.getStatus() == VisitStatus.COMPLETED && v.isBillable()) {
                BigDecimal rate = BigDecimal.valueOf(v.getBillingRate() != null ? v.getBillingRate() : 25.0);
                BigDecimal hours = BigDecimal.ONE; // 1 visit unit
                BigDecimal lineTotal = rate.multiply(hours);

                InvoiceLine line = InvoiceLine.builder()
                        .invoice(invoice)
                        .visitId(v.getId())
                        .description("Care Visit (" + v.getVisitType() + ") - " + v.getVisitReference())
                        .quantityHours(hours)
                        .unitRate(rate)
                        .lineTotal(lineTotal)
                        .build();
                line.setTenantId(TenantContext.getTenantId());
                invoice.getLines().add(line);
                subtotal = subtotal.add(lineTotal);
            }
        }

        if (invoice.getLines().isEmpty()) {
            // Add minimum care package line if no individual visits logged
            BigDecimal rate = BigDecimal.valueOf(150.00);
            InvoiceLine line = InvoiceLine.builder()
                    .invoice(invoice)
                    .description("Weekly Domiciliary Care Support Package")
                    .quantityHours(BigDecimal.ONE)
                    .unitRate(rate)
                    .lineTotal(rate)
                    .build();
            line.setTenantId(TenantContext.getTenantId());
            invoice.getLines().add(line);
            subtotal = rate;
        }

        invoice.setSubtotalAmount(subtotal);
        invoice.setTaxAmount(BigDecimal.ZERO); // Care services zero-rated VAT
        invoice.setTotalAmount(subtotal);

        Invoice saved = invoiceRepository.save(invoice);

        auditService.record("INVOICE_GENERATE", "Invoice", saved.getId().toString(),
                "Invoice generated for " + saved.getClientName() + " (Total: £" + saved.getTotalAmount() + ")",
                null, "ISSUED");

        return saved;
    }

    @Transactional
    public Payment recordPayment(Long invoiceId, BigDecimal amount, String method, String ref) {
        Invoice invoice = getInvoiceById(invoiceId);
        Payment payment = Payment.builder()
                .invoiceId(invoiceId)
                .amount(amount)
                .paymentDate(LocalDate.now())
                .paymentMethod(method != null ? method : "DIRECT_DEBIT")
                .referenceCode(ref)
                .build();
        payment.setTenantId(TenantContext.getTenantId());
        Payment savedPayment = paymentRepository.save(payment);

        invoice.setPaidAmount(invoice.getPaidAmount().add(amount));
        if (invoice.getPaidAmount().compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }
        invoiceRepository.save(invoice);

        auditService.record("PAYMENT_RECEIVE", "Payment", savedPayment.getId().toString(),
                "Payment received for invoice #" + invoice.getInvoiceNumber() + ": £" + amount + " via " + method,
                null, invoice.getStatus().name());

        return savedPayment;
    }

    @Transactional
    public Invoice updateInvoiceStatus(Long invoiceId, InvoiceStatus newStatus) {
        Invoice invoice = getInvoiceById(invoiceId);
        InvoiceStatus oldStatus = invoice.getStatus();
        invoice.setStatus(newStatus);
        Invoice saved = invoiceRepository.save(invoice);
        auditService.record("INVOICE_STATUS_UPDATE", "Invoice", invoiceId.toString(),
                "Invoice #" + invoice.getInvoiceNumber() + " status updated: " + oldStatus + " -> " + newStatus,
                oldStatus.name(), newStatus.name());
        return saved;
    }
}
