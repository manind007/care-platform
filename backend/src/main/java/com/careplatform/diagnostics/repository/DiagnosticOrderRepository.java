package com.careplatform.diagnostics.repository;

import com.careplatform.diagnostics.model.DiagnosticOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiagnosticOrderRepository extends JpaRepository<DiagnosticOrder, Long> {
    List<DiagnosticOrder> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    List<DiagnosticOrder> findByTenantIdAndStatus(String tenantId, DiagnosticOrder.OrderStatus status);
    List<DiagnosticOrder> findByTenantIdAndUhid(String tenantId, String uhid);
}

