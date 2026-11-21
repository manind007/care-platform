package com.careplatform.careplan.model;

import com.careplatform.common.model.BaseTenantEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "care_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareGoal extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "care_plan_id", nullable = false)
    @JsonIgnore
    private CarePlan carePlan;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(length = 50)
    @Builder.Default
    private String status = "IN_PROGRESS"; // IN_PROGRESS, ACHIEVED, DISCONTINUED

    @Column(length = 255)
    private String outcomeNotes;
}
