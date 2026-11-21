package com.careplatform.emergency.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "emergency_triage_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyTriage extends BaseTenantEntity {

    @Column(nullable = false, length = 30)
    private String triageNumber; // e.g. "ER-2026-0042"

    @Column(nullable = false, length = 150)
    private String patientName;

    @Column(length = 50)
    private String uhid;

    private Integer age;

    @Column(length = 20)
    private String gender; // MALE, FEMALE, OTHER

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime arrivalDateTime = LocalDateTime.now();

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String arrivalMode = "WALK_IN"; // WALK_IN, AMBULANCE_PRE_NOTIFIED, POLICE, AIR_AMBULANCE, HOSPITAL_TRANSFER

    @Column(length = 50)
    private String ambulanceVehicleNumber;

    @Column(columnDefinition = "TEXT")
    private String paramedicNotes;

    private Integer etaMinutes; // for incoming ambulances (e.g. 8 mins)

    @Column(nullable = false, columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(nullable = false)
    @Builder.Default
    private Integer esiLevel = 3; // 1 = Resuscitation, 2 = Emergent, 3 = Urgent, 4 = Less Urgent, 5 = Non-Urgent

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String triageColor = "YELLOW"; // RED, ORANGE, YELLOW, GREEN, BLUE

    private Integer heartRate; // bpm

    @Column(length = 30)
    private String bloodPressure; // mmHg e.g. "120/80"

    private Integer respiratoryRate; // breaths/min

    private Integer oxygenSaturation; // SpO2 %

    private Double temperature; // °C

    private Integer glasgowComaScale; // 3 to 15

    private Integer painScore; // 0 to 10

    @Column(length = 150)
    private String triageNurse;

    @Column(length = 150)
    private String attendingEmergencyPhysician;

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String status = "WAITING_IN_TRIAGE"; // PRE_ARRIVAL, WAITING_IN_TRIAGE, IN_RESUSCITATION, UNDER_OBSERVATION, ADMITTED_IPD, TRANSFERRED_OT, TRANSFERRED_ICU, DISCHARGED

    @Column(length = 80)
    private String assignedBay; // e.g. "Resuscitation Bay 1", "Trauma Bay A", "Acute Bay 3", "Fast Track Chair 1"

    @Column(columnDefinition = "TEXT")
    private String clinicalInterventions;

    @Column(columnDefinition = "TEXT")
    private String dispositionNotes;

    private Long destinationWardId;

    private Long destinationBedId;
}

