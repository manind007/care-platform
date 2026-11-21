package com.careplatform.assessment.repository;

import com.careplatform.assessment.model.AssessmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentSubmissionRepository extends JpaRepository<AssessmentSubmission, Long> {
    List<AssessmentSubmission> findByTenantIdAndClientIdOrderByCreatedAtDesc(String tenantId, Long clientId);
}
