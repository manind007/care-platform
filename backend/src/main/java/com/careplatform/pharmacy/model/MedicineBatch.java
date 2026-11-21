package com.careplatform.pharmacy.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "pharmacy_batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineBatch extends BaseTenantEntity {

    private Long medicineId;

    @Column(nullable = false)
    private String medicineName;

    @Column(nullable = false)
    private String batchNumber;

    private LocalDate manufactureDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false)
    private Integer quantity;

    private BigDecimal purchasePrice;

    private String supplier;
}

