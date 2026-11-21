package com.careplatform.ehr.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ehr_specialty_consultations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecialtyConsultation extends BaseTenantEntity {

    @Column(nullable = false, length = 50)
    private String uhid;

    @Column(nullable = false, length = 150)
    private String patientName;

    private Long clientId;

    @Column(nullable = false, length = 150)
    private String consultantName;

    @Column(nullable = false, length = 80)
    private String department; // e.g. "Cardiology", "Pediatrics", "Obstetrics & Gynecology", "Oncology", "Orthopedics"

    @Column(nullable = false, length = 40)
    private String specialtyCode; // CARDIOLOGY, PEDIATRICS, OBGYN, ONCOLOGY, ORTHOPEDICS

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime consultationDateTime = LocalDateTime.now();

    @Column(nullable = false, columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(nullable = false, length = 250)
    private String clinicalDiagnosis;

    @Column(columnDefinition = "TEXT")
    private String structuredFindingsJson; // Specialty-specific JSON (e.g. NYHA class, EF%, TNM stage, Gestational weeks, Growth percentiles)

    @Column(columnDefinition = "TEXT")
    private String treatmentPlan;

    @Column(length = 250)
    private String prescribedMedications;

    @Column(length = 250)
    private String diagnosticOrders;

    private LocalDate nextFollowUpDate;
}

