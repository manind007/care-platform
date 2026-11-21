package com.careplatform.medication.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "medication_reconciliations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationReconciliation extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(nullable = false, length = 150)
    private String source; // e.g. "St Mary's Hospital Discharge TTO", "Annual GP Medication Review"

    @Column(name = "reconciled_by", length = 150)
    private String reconciledBy; // e.g. "Dr. Sarah Jenkins (Care Manager)"

    @Column(name = "reconciliation_date", nullable = false)
    @Builder.Default
    private LocalDate reconciliationDate = LocalDate.now();

    @Column(length = 50)
    @Builder.Default
    private String status = "APPROVED_AND_APPLIED"; // PENDING_REVIEW, APPROVED_AND_APPLIED, REJECTED

    @Column(columnDefinition = "TEXT")
    private String discrepanciesJson; // JSON array of additions, dose adjustments, discontinued medicines

    @Column(columnDefinition = "TEXT")
    private String clinicalNotes;
}

