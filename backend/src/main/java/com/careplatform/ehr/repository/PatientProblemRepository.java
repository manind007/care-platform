package com.careplatform.ehr.repository;

import com.careplatform.ehr.model.PatientProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientProblemRepository extends JpaRepository<PatientProblem, Long> {
    List<PatientProblem> findByTenantIdAndClientId(String tenantId, Long clientId);
}

