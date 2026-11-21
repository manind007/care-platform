package com.careplatform.virtualward.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "virtual_ward_stays")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VirtualWardStay extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "client_name", nullable = false, length = 150)
    private String clientName;

    @Column(name = "hospital_admission_id")
    private Long hospitalAdmissionId;

    @Column(name = "virtual_ward_name", nullable = false, length = 100)
    private String virtualWardName; // e.g. "Frailty & Step-Down Virtual Ward", "Acute Respiratory / COPD Virtual Ward"

    @Column(name = "admitting_consultant", length = 150)
    private String admittingConsultant;

    @Column(name = "lead_community_nurse", length = 150)
    private String leadCommunityNurse;

    @Column(name = "admission_date", nullable = false)
    @Builder.Default
    private LocalDate admissionDate = LocalDate.now();

    @Column(name = "target_discharge_date")
    private LocalDate targetDischargeDate;

    @Column(name = "actual_discharge_date")
    private LocalDate actualDischargeDate;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ADMITTED"; // ADMITTED, STABLE, REVIEW_DUE, STEP_DOWN_PENDING, DISCHARGED, ESCALATED_TO_ED

    @Column(length = 20)
    @Builder.Default
    private String acuityLevel = "MEDIUM"; // HIGH, MEDIUM, LOW

    @Column(name = "telemetry_device_id", length = 100)
    private String telemetryDeviceId;

    @Column(name = "latest_spo2")
    private Integer latestSpo2;

    @Column(name = "latest_heart_rate")
    private Integer latestHeartRate;

    @Column(name = "latest_blood_pressure", length = 30)
    private String latestBloodPressure;

    @Column(name = "latest_temperature")
    private Double latestTemperature;

    @Column(name = "last_remote_round_time")
    private LocalDateTime lastRemoteRoundTime;

    @Column(columnDefinition = "TEXT")
    private String remoteRoundNotes;

    @Column(columnDefinition = "TEXT")
    private String clinicalPlan;
}

