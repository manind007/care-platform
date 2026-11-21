package com.careplatform.finance.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseTenantEntity {

    @Column(name = "invoice_id", nullable = false)
    private Long invoiceId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    @Builder.Default
    private LocalDate paymentDate = LocalDate.now();

    @Column(name = "payment_method", length = 50)
    @Builder.Default
    private String paymentMethod = "DIRECT_DEBIT"; // DIRECT_DEBIT, BACS, CREDIT_CARD, LOCAL_AUTH_TRANSFER

    @Column(name = "reference_code", length = 100)
    private String referenceCode;
}
