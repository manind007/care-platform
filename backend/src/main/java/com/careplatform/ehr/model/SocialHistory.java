package com.careplatform.ehr.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ehr_social_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialHistory extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "tobacco_status", length = 50)
    private String tobaccoStatus; // NEVER_SMOKER, FORMER_SMOKER, CURRENT_SMOKER

    @Column(name = "packs_per_day")
    private Double packsPerDay;

    @Column(name = "smoking_years")
    private Integer smokingYears;

    @Column(name = "alcohol_use", length = 50)
    private String alcoholUse; // NONE, OCCASIONAL, MODERATE, HEAVY

    @Column(name = "alcohol_units_per_week")
    private Integer alcoholUnitsPerWeek;

    @Column(name = "physical_activity", length = 100)
    private String physicalActivity; // SEDENTARY, LIGHT_WALKING, MODERATE

    @Column(length = 100)
    private String occupation; // e.g. Retired Headteacher, Accountant

    @Column(name = "living_situation", length = 100)
    private String livingSituation; // LIVES_ALONE, WITH_SPOUSE, ASSISTED_LIVING

    @Column(columnDefinition = "TEXT")
    private String notes;
}

