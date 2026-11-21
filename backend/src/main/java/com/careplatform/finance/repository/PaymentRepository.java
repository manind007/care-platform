package com.careplatform.finance.repository;

import com.careplatform.finance.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByTenantIdAndInvoiceId(String tenantId, Long invoiceId);
}
