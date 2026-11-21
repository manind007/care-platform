package com.careplatform.shiftbroadcast.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "open_shift_broadcasts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpenShiftBroadcast extends BaseTenantEntity {

    private Long visitId;

    @Column(nullable = false, length = 150)
    private String clientName;

    @Column(nullable = false, length = 250)
    private String clientAddress;

    @Column(nullable = false)
    private LocalDate shiftDate;

    @Column(nullable = false, length = 10)
    private String startTime; // e.g. "08:00"

    @Column(nullable = false, length = 10)
    private String endTime; // e.g. "12:00"

    @Column(length = 200)
    private String requiredSkills; // e.g. "PEG_FEEDING, HOISTING_COMPLEX"

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal hourlyRate = BigDecimal.valueOf(18.50);

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String urgency = "STANDARD"; // STANDARD, HIGH_PRIORITY, CRITICAL_SAME_DAY

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String broadcastStatus = "OPEN"; // OPEN, CLAIMED, EXPIRED, CANCELLED

    private Long claimedByUserId;

    @Column(length = 150)
    private String claimedByName;

    private LocalDateTime claimedAt;

    @Column(columnDefinition = "TEXT")
    private String broadcastNotes;
}

