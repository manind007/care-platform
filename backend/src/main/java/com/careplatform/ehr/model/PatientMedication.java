package com.careplatform.ehr.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "ehr_patient_medications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientMedication extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "medication_name", nullable = false, length = 150)
    private String medicationName;

    @Column(name = "generic_name", length = 150)
    private String genericName;

    @Column(length = 50)
    private String dose; // e.g. 40 mg, 500 mg, 2 puffs

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private Route route = Route.ORAL;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private Frequency frequency = Frequency.ONCE_DAILY;

    @Column(length = 200)
    private String indication; // e.g. Congestive Heart Failure, Hypertension

    @Enumerated(EnumType.STRING)
    @Column(name = "reconciliation_status", length = 30)
    @Builder.Default
    private ReconciliationStatus reconciliationStatus = ReconciliationStatus.INPATIENT_ACTIVE;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "prescribed_by", length = 100)
    private String prescribedBy;

    @Column(columnDefinition = "TEXT")
    private String instructions; // e.g. Take with morning meal with full glass of water

    public enum Route {
        ORAL, INTRAVENOUS, INTRAMUSCULAR, SUBCUTANEOUS, INHALATION, TOPICAL, OPHTHALMIC, RECTAL
    }

    public enum Frequency {
        ONCE_DAILY, TWICE_DAILY, THREE_TIMES_DAILY, FOUR_TIMES_DAILY, AS_NEEDED_PRN, EVERY_OTHER_DAY, WEEKLY
    }

    public enum ReconciliationStatus {
        HOME_MED, INPATIENT_ACTIVE, DISCONTINUED, DISCHARGE_MED, SUSPENDED
    }
}

