package com.careplatform.ehr.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "ehr_patient_allergies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientAllergy extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "allergen_name", nullable = false, length = 100)
    private String allergenName;

    @Enumerated(EnumType.STRING)
    @Column(name = "allergen_type", length = 30)
    @Builder.Default
    private AllergenType allergenType = AllergenType.DRUG;

    @Column(length = 255)
    private String reaction; // e.g. Anaphylaxis, Angioedema, Urticaria, Bronchospasm, Nausea

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private Severity severity = Severity.MODERATE;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 30)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.CONFIRMED;

    @Column(name = "onset_date")
    private LocalDate onsetDate;

    @Column(name = "recorded_by", length = 100)
    private String recordedBy;

    @Column(columnDefinition = "TEXT")
    private String clinicalNotes;

    public enum AllergenType {
        DRUG, FOOD, ENVIRONMENTAL, BIOLOGIC, LATEX, OTHER
    }

    public enum Severity {
        MILD, MODERATE, SEVERE_LIFE_THREATENING
    }

    public enum VerificationStatus {
        CONFIRMED, SUSPECTED, REFUTED, RESOLVED
    }
}

