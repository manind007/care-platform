package com.careplatform.assessment.repository;

import com.careplatform.assessment.model.AssessmentSubmission;
import com.careplatform.assessment.model.AssessmentTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentTemplateRepository extends JpaRepository<AssessmentTemplate, Long> {
    List<AssessmentTemplate> findByTenantId(String tenantId);
}
