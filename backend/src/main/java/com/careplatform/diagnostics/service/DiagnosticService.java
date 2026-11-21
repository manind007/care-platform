package com.careplatform.diagnostics.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.diagnostics.model.DiagnosticOrder;
import com.careplatform.diagnostics.repository.DiagnosticOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiagnosticService {

    private final DiagnosticOrderRepository orderRepository;
    private final AuditService auditService;

    public List<DiagnosticOrder> getAllOrders() {
        return orderRepository.findByTenantIdOrderByCreatedAtDesc(TenantContext.getTenantId());
    }

    public DiagnosticOrder getOrderById(Long id) {
        return orderRepository.findById(id)
                .filter(o -> o.getTenantId().equals(TenantContext.getTenantId()))
                .orElseThrow(() -> new CarePlatformException("Diagnostic Order not found with id: " + id));
    }

    @Transactional
    public DiagnosticOrder createOrder(DiagnosticOrder order) {
        order.setTenantId(TenantContext.getTenantId());
        if (order.getOrderNumber() == null || order.getOrderNumber().isBlank()) {
            order.setOrderNumber("LAB-" + System.currentTimeMillis() % 1000000);
        }
        DiagnosticOrder saved = orderRepository.save(order);
        auditService.record("DIAGNOSTIC_ORDER_CREATED", "DiagnosticOrder", saved.getId().toString(),
                "Ordered " + saved.getTestName() + " for " + saved.getPatientName() + " (" + saved.getOrderNumber() + ")",
                null, "ORDERED");
        return saved;
    }

    @Transactional
    public DiagnosticOrder collectSample(Long id) {
        DiagnosticOrder order = getOrderById(id);
        order.setStatus(DiagnosticOrder.OrderStatus.SAMPLE_COLLECTED);
        order.setSampleCollectedAt(LocalDateTime.now());
        DiagnosticOrder saved = orderRepository.save(order);
        auditService.record("DIAGNOSTIC_SAMPLE_COLLECTED", "DiagnosticOrder", id.toString(),
                "Sample collected for order " + saved.getOrderNumber(), null, "SAMPLE_COLLECTED");
        return saved;
    }

    @Transactional
    public DiagnosticOrder recordResult(Long id, String resultValue, String referenceRange, String unit, Boolean isAbnormal, String verifiedBy) {
        DiagnosticOrder order = getOrderById(id);
        order.setResultValue(resultValue);
        order.setReferenceRange(referenceRange);
        order.setUnit(unit);
        order.setIsAbnormal(isAbnormal != null ? isAbnormal : false);
        order.setVerifiedBy(verifiedBy);
        order.setStatus(DiagnosticOrder.OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());

        DiagnosticOrder saved = orderRepository.save(order);
        auditService.record("DIAGNOSTIC_RESULT_ENTERED", "DiagnosticOrder", id.toString(),
                "Result recorded for order " + saved.getOrderNumber() + " by " + verifiedBy,
                null, "COMPLETED");
        return saved;
    }

    @Transactional
    public void deleteOrder(Long id) {
        DiagnosticOrder order = getOrderById(id);
        orderRepository.delete(order);
        auditService.record("DIAGNOSTIC_ORDER_DELETED", "DiagnosticOrder", id.toString(),
                "Deleted order " + id, null, "DELETED");
    }
}

