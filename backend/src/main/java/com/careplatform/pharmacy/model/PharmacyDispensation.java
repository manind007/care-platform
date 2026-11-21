package com.careplatform.pharmacy.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pharmacy_dispensations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyDispensation extends BaseTenantEntity {

    @Column(nullable = false)
    private String dispensationCode;

    @Column(nullable = false)
    private String uhid;

    @Column(nullable = false)
    private String patientName;

    private String prescriptionRef;

    @Column(nullable = false)
    private String medicineName;

    private String batchNumber;

    @Column(nullable = false)
    private Integer quantityDispensed;

    private BigDecimal unitPrice;

    private BigDecimal totalAmount;

    private String dispensedBy;

    private LocalDateTime dispensedAt;
}

