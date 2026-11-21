package com.careplatform.ehr.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "ehr_patient_problems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProblem extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "icd_code", length = 30)
    private String icdCode; // e.g. E11.9, I50.9, I10, M19.9

    @Column(name = "snomed_code", length = 50)
    private String snomedCode;

    @Column(name = "problem_name", nullable = false, length = 200)
    private String problemName;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private ProblemStatus status = ProblemStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private Priority priority = Priority.PRIMARY;

    @Column(name = "onset_date")
    private LocalDate onsetDate;

    @Column(name = "resolved_date")
    private LocalDate resolvedDate;

    @Column(name = "diagnosing_clinician", length = 100)
    private String diagnosingClinician;

    @Column(columnDefinition = "TEXT")
    private String clinicalNotes;

    public enum ProblemStatus {
        ACTIVE, CHRONIC, ACUTE, RESOLVED, INACTIVE
    }

    public enum Priority {
        PRIMARY, SECONDARY, TERTIARY
    }
}

