package com.careplatform.ipd.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ipd_beds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bed extends BaseTenantEntity {

    private Long wardId;

    private String wardName;

    @Column(nullable = false)
    private String bedNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BedStatus status = BedStatus.AVAILABLE;

    private String occupiedByUhid;

    private String occupiedByName;

    private LocalDateTime admissionDate;

    private LocalDateTime lastCleanedAt;

    private String cleanedBy;

    private String maintenanceReason;

    public enum BedStatus {
        AVAILABLE, OCCUPIED, MAINTENANCE, CLEANING
    }
}
