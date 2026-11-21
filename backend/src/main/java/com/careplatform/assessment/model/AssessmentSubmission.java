package com.careplatform.assessment.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "assessment_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentSubmission extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "template_id", nullable = false)
    private Long templateId;

    @Column(name = "template_title", nullable = false, length = 150)
    private String templateTitle;

    @Column(name = "total_score")
    private Integer totalScore;

    @Column(name = "risk_level", length = 50)
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(columnDefinition = "TEXT")
    private String answersJson;

    @Column(columnDefinition = "TEXT")
    private String clinicalNotes;

    @Column(name = "assessor_name", length = 100)
    private String assessorName;

    @Column(name = "assessment_date")
    @Builder.Default
    private LocalDate assessmentDate = LocalDate.now();

    @Column(name = "next_review_date")
    private LocalDate nextReviewDate;
}
