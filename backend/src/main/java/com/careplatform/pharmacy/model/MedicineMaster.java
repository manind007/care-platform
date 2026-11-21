package com.careplatform.pharmacy.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "pharmacy_medicines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineMaster extends BaseTenantEntity {

    @Column(nullable = false, unique = false)
    private String itemCode;

    @Column(nullable = false)
    private String brandName;

    @Column(nullable = false)
    private String genericName;

    private String category; // Antibiotic, Analgesic, Antihypertensive, etc.

    private String dosageForm; // Tablet, Capsule, Syrup, Injection, IV Fluid

    private String strength; // 500mg, 10mg, 100ml

    private BigDecimal unitPrice;

    @Builder.Default
    private Integer reorderLevel = 20;

    @Builder.Default
    private Integer totalStock = 0;
}

