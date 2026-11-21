package com.careplatform.hospital.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "hospital_blood_bank")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodBankUnit extends BaseTenantEntity {

    @Column(nullable = false)
    private String unitCode;

    @Column(nullable = false)
    private String bloodGroup; // A+, A-, B+, B-, AB+, AB-, O+, O-

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComponentType componentType;

    private Integer volumeMl;

    private LocalDate collectionDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private UnitStatus status = UnitStatus.AVAILABLE;

    private String reservedForUhid;

    private String reservedForName;

    public enum ComponentType {
        WHOLE_BLOOD, PRBC, FFP, PLATELETS, CRYOPRECIPITATE
    }

    public enum UnitStatus {
        AVAILABLE, RESERVED, TRANSFUSED, EXPIRED
    }
}

