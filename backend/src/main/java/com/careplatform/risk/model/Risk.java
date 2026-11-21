package com.careplatform.risk.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "risks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Risk extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(nullable = false, length = 100)
    private String category; // FALLS, MEDICATION, MOBILITY, ENVIRONMENTAL, SKIN_BREAKDOWN, CHOKING

    @Column(nullable = false, length = 200)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Integer severity = 3; // 1 to 5

    @Column(nullable = false)
    @Builder.Default
    private Integer likelihood = 3; // 1 to 5

    @Column(name = "risk_score")
    private Integer riskScore; // severity * likelihood (1 to 25)

    @Column(name = "risk_level", length = 50)
    private String riskLevel; // LOW (1-5), MEDIUM (6-12), HIGH (13-19), CRITICAL (20-25)

    @Column(columnDefinition = "TEXT")
    private String controlsAndMitigations;

    @Column(columnDefinition = "TEXT")
    private String actionPlan;

    @Column(name = "owner_name", length = 100)
    private String ownerName;

    @Column(name = "review_date")
    private LocalDate reviewDate;

    @Column(length = 50)
    @Builder.Default
    private String status = "OPEN"; // OPEN, MITIGATED, UNDER_REVIEW, CLOSED

    @PrePersist
    @PreUpdate
    public void calculateRisk() {
        if (severity != null && likelihood != null) {
            this.riskScore = severity * likelihood;
            if (this.riskScore >= 20) this.riskLevel = "CRITICAL";
            else if (this.riskScore >= 13) this.riskLevel = "HIGH";
            else if (this.riskScore >= 6) this.riskLevel = "MEDIUM";
            else this.riskLevel = "LOW";
        }
    }
}
