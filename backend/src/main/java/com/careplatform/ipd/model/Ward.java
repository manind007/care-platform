package com.careplatform.ipd.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "ipd_wards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ward extends BaseTenantEntity {

    @Column(nullable = false)
    private String wardName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WardType wardType;

    private Integer floorNumber;

    private BigDecimal dailyRate;

    public enum WardType {
        ICU, GENERAL, PRIVATE, SEMI_PRIVATE, EMERGENCY, HDU
    }
}
