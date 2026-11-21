package com.careplatform.medication.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "medications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(nullable = false, length = 150)
    private String name; // e.g. "Paracetamol", "Amlodipine"

    @Column(name = "generic_name", length = 150)
    private String genericName;

    @Column(name = "dosage_form", length = 50)
    @Builder.Default
    private String dosageForm = "Tablet"; // Tablet, Capsule, Liquid, Patch, Cream, Inhaler, Injection

    @Column(length = 50)
    private String strength; // e.g. "500mg"

    @Column(length = 50)
    private String dose; // e.g. "2 tablets"

    @Column(length = 50)
    private String route; // e.g. "Oral", "Topical", "Subcutaneous"

    @Column(length = 50)
    private String frequency; // e.g. "Four times daily", "Once daily morning"

    @Column(name = "schedule_type", length = 50)
    @Builder.Default
    private String scheduleType = "REGULAR"; // REGULAR, PRN, WEEKLY, ALTERNATE_DAYS, SPECIFIC_TIME

    @Column(name = "scheduled_days", length = 100)
    private String scheduledDays; // e.g. "MONDAY,WEDNESDAY,FRIDAY"

    @Column(name = "scheduled_times", length = 100)
    @Builder.Default
    private String scheduledTimes = "08:00, 12:00, 18:00, 21:00";

    @Column(name = "is_time_critical")
    @Builder.Default
    private boolean timeCritical = false; // e.g. Parkinson's (Levodopa), Insulin

    @Column(name = "time_window_minutes")
    @Builder.Default
    private Integer timeWindowMinutes = 60; // +/- minutes allowed for round

    @Column(name = "is_controlled_drug")
    @Builder.Default
    private boolean controlledDrug = false; // UK Controlled Drug Schedule 2/3

    @Column(name = "requires_witness")
    @Builder.Default
    private boolean requiresWitness = false;

    @Column(name = "min_interval_hours")
    @Builder.Default
    private Integer minIntervalHours = 4; // for PRN

    @Column(name = "max_doses_per_day")
    @Builder.Default
    private Integer maxDosesPerDay = 4; // for PRN

    @Column(name = "prn_indication", length = 255)
    private String prnIndication; // e.g. "Pain score >= 5, fever > 38C"

    @Column(name = "topical_site", length = 100)
    private String topicalSite; // e.g. "Right shoulder", "Bilateral knees"

    @Column(columnDefinition = "TEXT")
    private String instructions; // e.g. "Take with food and full glass of water"

    @Column(name = "is_prn")
    @Builder.Default
    private boolean prn = false; // Pro re nata (as needed)

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;

    @Column(length = 50)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, SUSPENDED, DISCONTINUED

    @Column(name = "prescriber_details", length = 150)
    private String prescriberDetails;

    @Column(name = "pharmacy_name", length = 150)
    private String pharmacyName;

    @Column(name = "pharmacy_phone", length = 50)
    private String pharmacyPhone;

    @Column(name = "pharmacy_rx_number", length = 50)
    private String pharmacyRxNumber;

    @Column(name = "stock_quantity")
    @Builder.Default
    private Integer stockQuantity = 28;

    @Column(name = "reorder_level")
    @Builder.Default
    private Integer reorderLevel = 7;

    @Column(name = "repeat_status", length = 50)
    @Builder.Default
    private String repeatStatus = "NOT_DUE"; // NOT_DUE, DUE_FOR_REORDER, ORDERED_FROM_GP, DISPENSED, DELIVERED

    @Column(name = "last_review_date")
    private LocalDate lastReviewDate;

    @Column(name = "next_review_date")
    private LocalDate nextReviewDate;
}
