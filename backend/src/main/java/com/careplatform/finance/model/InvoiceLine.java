package com.careplatform.finance.model;

import com.careplatform.common.model.BaseTenantEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "invoice_lines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceLine extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    @JsonIgnore
    private Invoice invoice;

    @Column(name = "visit_id")
    private Long visitId;

    @Column(nullable = false, length = 200)
    private String description;

    @Column(precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal quantityHours = BigDecimal.ONE;

    @Column(name = "unit_rate", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal unitRate = BigDecimal.valueOf(25.00);

    @Column(name = "line_total", precision = 10, scale = 2)
    private BigDecimal lineTotal;
}
