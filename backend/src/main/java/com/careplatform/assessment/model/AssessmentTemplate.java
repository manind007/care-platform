package com.careplatform.assessment.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assessment_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentTemplate extends BaseTenantEntity {

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 50)
    private String category; // FALLS_RISK, WATERLOW_SKIN, NUTRITION_MUST, MOBILITY, MENTAL_WELLBEING

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "max_score")
    private Integer maxScore;

    @Column(name = "risk_threshold_high")
    private Integer riskThresholdHigh;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AssessmentQuestion> questions = new ArrayList<>();
}
