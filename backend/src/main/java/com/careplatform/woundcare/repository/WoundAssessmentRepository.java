package com.careplatform.woundcare.repository;

import com.careplatform.woundcare.model.WoundAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WoundAssessmentRepository extends JpaRepository<WoundAssessment, Long> {
    List<WoundAssessment> findByTenantIdAndClientIdOrderByAssessmentDateDesc(String tenantId, Long clientId);
    List<WoundAssessment> findByTenantIdOrderByAssessmentDateDesc(String tenantId);
}

