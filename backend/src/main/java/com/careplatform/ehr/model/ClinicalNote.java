package com.careplatform.ehr.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "ehr_clinical_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClinicalNote extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "encounter_id")
    private Long encounterId;

    @Enumerated(EnumType.STRING)
    @Column(name = "note_type", length = 40)
    @Builder.Default
    private NoteType noteType = NoteType.SOAP_NOTE;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String subjective; // Chief complaint, HPI, ROS

    @Column(columnDefinition = "TEXT")
    private String objective; // Physical examination, Vitals, Labs

    @Column(columnDefinition = "TEXT")
    private String assessment; // Diagnosis, clinical reasoning, differential

    @Column(columnDefinition = "TEXT")
    private String plan; // Orders, interventions, medication changes, follow-up

    @Column(name = "author_name", nullable = false, length = 100)
    private String authorName;

    @Column(name = "author_role", length = 100)
    private String authorRole; // Attending Physician, Registered Nurse, Clinical Specialist

    @Column(name = "signed_at")
    private Instant signedAt;

    @Column(name = "cosigned_by", length = 100)
    private String cosignedBy;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private NoteStatus status = NoteStatus.FINAL_SIGNED;

    public enum NoteType {
        SOAP_NOTE, PROGRESS_NOTE, ADMISSION_H_AND_P, CONSULT_NOTE, DISCHARGE_SUMMARY, PROCEDURE_NOTE, NURSING_NOTE
    }

    public enum NoteStatus {
        DRAFT, FINAL_SIGNED, ADDENDUM, AMENDED
    }
}

