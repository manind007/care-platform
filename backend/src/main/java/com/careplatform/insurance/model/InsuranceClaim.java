package com.careplatform.insurance.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "insurance_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsuranceClaim extends BaseTenantEntity {

    @Column(nullable = false, length = 40)
    private String claimNumber; // e.g. "TPA-CLM-8831"

    @Column(nullable = false, length = 50)
    private String uhid;

    @Column(nullable = false, length = 150)
    private String patientName;

    @Column(length = 30)
    private String patientPhone;

    private Long ipdAdmissionId;

    private Long opdAppointmentId;

    @Column(nullable = false, length = 100)
    private String insuranceCompany; // e.g. "Bupa Global", "AXA Health", "Aviva", "Star Health", "Medi Assist TPA"

    @Column(length = 100)
    private String tpaName; // Third Party Administrator

    @Column(nullable = false, length = 80)
    private String policyNumber;

    @Column(length = 80)
    private String memberId;

    @Column(length = 150)
    private String corporateName; // e.g. "Barclays Corporate Panel", "Standard Chartered Group", "Retail Individual"

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal requestedAmount = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal approvedAmount = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal coPayPercentage = BigDecimal.ZERO; // e.g. 10.00 (%)

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal deductibleAmount = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal disallowedAmount = BigDecimal.ZERO;

    @Column(length = 80)
    private String preAuthApprovalCode;

    private LocalDate approvalDate;

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String claimStatus = "SUBMITTED"; // SUBMITTED, QUERY_RAISED, INITIAL_PREAUTH_APPROVED, ENHANCEMENT_REQUESTED, FINAL_SETTLED, REJECTED

    private Integer estimatedStayDays;

    @Column(columnDefinition = "TEXT")
    private String provisionalDiagnosis;

    @Column(length = 200)
    private String plannedProcedure;

    @Column(columnDefinition = "TEXT")
    private String queryRemarks;

    @Column(columnDefinition = "TEXT")
    private String settlementRemarks;

    @Column(length = 250)
    private String approvalLetterReference;
}

