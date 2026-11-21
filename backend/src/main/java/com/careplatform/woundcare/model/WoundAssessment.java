package com.careplatform.woundcare.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "wound_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WoundAssessment extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "wound_number", length = 30)
    @Builder.Default
    private String woundNumber = "WOUND-01";

    @Column(name = "anatomical_location", nullable = false, length = 100)
    private String anatomicalLocation; // e.g. "Sacrum", "Left Heel", "Right Lateral Malleolus", "Abdominal Surgical Site"

    @Column(name = "wound_type", length = 50)
    @Builder.Default
    private String woundType = "PRESSURE_ULCER"; // PRESSURE_ULCER, SURGICAL_WOUND, VENOUS_LEG_ULCER, DIABETIC_FOOT_ULCER, TEAR

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String stage = "STAGE_2"; // STAGE_1, STAGE_2, STAGE_3, STAGE_4, UNSTAGEABLE, DTI (Deep Tissue Injury)

    @Column(name = "length_cm")
    private Double lengthCm; // e.g. 2.5

    @Column(name = "width_cm")
    private Double widthCm; // e.g. 1.8

    @Column(name = "depth_cm")
    private Double depthCm; // e.g. 0.4

    @Column(name = "exudate_type", length = 50)
    @Builder.Default
    private String exudateType = "SEROUS"; // SEROUS, SANGUINEOUS, SEROSANGUINEOUS, PURULENT

    @Column(name = "exudate_amount", length = 30)
    @Builder.Default
    private String exudateAmount = "LOW"; // NONE, LOW, MODERATE, HEAVY

    @Column(name = "tissue_type", length = 50)
    @Builder.Default
    private String tissueType = "GRANULATION"; // GRANULATION, SLOUGH, NECROTIC_ESCHAR, EPITHELIALIZING

    @Column(name = "dressing_type", length = 150)
    private String dressingType; // e.g. "Aquacel Ag Silver Hydrofiber & Mepilex Border"

    @Column(name = "dressing_frequency", length = 50)
    @Builder.Default
    private String dressingFrequency = "EVERY_3_DAYS"; // DAILY, ALTERNATE_DAYS, EVERY_3_DAYS, WEEKLY

    @Column(name = "healing_status", length = 30)
    @Builder.Default
    private String healingStatus = "IMPROVING"; // IMPROVING, STATIC, DETERIORATING

    @Column(name = "assessed_by", length = 150)
    private String assessedBy;

    @Column(name = "assessment_date", nullable = false)
    @Builder.Default
    private LocalDate assessmentDate = LocalDate.now();

    @Column(columnDefinition = "TEXT")
    private String clinicalNotes;
}

