package com.careplatform.medication.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "medication_administrations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationAdministration extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "medication_id", nullable = false)
    private Long medicationId;

    @Column(name = "medication_name", nullable = false, length = 150)
    private String medicationName;

    @Column(name = "dose_given", length = 50)
    private String doseGiven;

    @Column(name = "visit_id")
    private Long visitId;

    @Column(name = "worker_id")
    private Long workerId;

    @Column(name = "worker_name", length = 150)
    private String workerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AdministrationOutcome outcome; // ADMINISTERED, REFUSED, MISSED, WITHHELD, NOT_AVAILABLE, ERROR

    @Column(name = "scheduled_slot", length = 50)
    private String scheduledSlot; // MORNING, LUNCH, TEA, NIGHT, PRN

    @Column(name = "administration_time", nullable = false)
    @Builder.Default
    private LocalDateTime administrationTime = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String outcomeReason; // e.g. "Client felt nauseous", "Pack was empty"

    @Column(name = "is_exception")
    @Builder.Default
    private boolean exception = false;

    @Column(name = "witness_name", length = 150)
    private String witnessName;

    @Column(name = "witness_role", length = 100)
    private String witnessRole; // Second Carer, Registered Nurse, Family Proxy

    @Column(name = "witness_signed_at")
    private LocalDateTime witnessSignedAt;

    @Column(name = "digital_signature", length = 200)
    private String digitalSignature;

    @Column(name = "topical_site_applied", length = 100)
    private String topicalSiteApplied;

    @Column(name = "prn_reason", length = 255)
    private String prnReason; // e.g. "Severe knee pain rated 8/10"

    @Column(columnDefinition = "TEXT")
    private String prnEffectiveness; // e.g. "Pain reduced to 2/10 at 45 min follow-up"

    @Column(name = "prn_follow_up_time")
    private LocalDateTime prnFollowUpTime;

    @Column(name = "escalation_status", length = 50)
    @Builder.Default
    private String escalationStatus = "NONE"; // NONE, FLAGGED_TO_OFFICE, INVESTIGATED, RESOLVED

    @Column(columnDefinition = "TEXT")
    private String escalationNotes;
}
