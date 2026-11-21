package com.careplatform.assessment.model;

import com.careplatform.common.model.BaseTenantEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "assessment_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentQuestion extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    @JsonIgnore
    private AssessmentTemplate template;

    @Column(nullable = false, length = 255)
    private String questionText;

    @Column(name = "section_name", length = 100)
    private String sectionName;

    @Column(name = "answer_type", length = 50)
    @Builder.Default
    private String answerType = "SINGLE_CHOICE"; // SINGLE_CHOICE, NUMBER, BOOLEAN, TEXT

    @Column(columnDefinition = "TEXT")
    private String optionsJson; // JSON array of options with score points, e.g. [{"label":"No history", "points":0},{"label":"Fallen in last 6 months", "points":5}]

    @Column(name = "order_index")
    private Integer orderIndex;
}
