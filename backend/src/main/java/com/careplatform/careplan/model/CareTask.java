package com.careplatform.careplan.model;

import com.careplatform.common.model.BaseTenantEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "care_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareTask extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "care_plan_id", nullable = false)
    @JsonIgnore
    private CarePlan carePlan;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(length = 50)
    @Builder.Default
    private String category = "PERSONAL_CARE"; // PERSONAL_CARE, NUTRITION, MOBILITY, MEDICATION, DOMESTIC

    @Column(name = "time_of_day", length = 50)
    @Builder.Default
    private String timeOfDay = "MORNING"; // MORNING, LUNCH, TEA, BED, ANYTIME

    @Column(name = "is_mandatory")
    @Builder.Default
    private boolean mandatory = true;
}
