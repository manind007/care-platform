package com.careplatform.finance.repository;

import com.careplatform.finance.model.Invoice;
import com.careplatform.finance.model.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByTenantId(String tenantId);
    List<Invoice> findByTenantIdAndClientId(String tenantId, Long clientId);
    List<Invoice> findByTenantIdAndStatus(String tenantId, InvoiceStatus status);
}
