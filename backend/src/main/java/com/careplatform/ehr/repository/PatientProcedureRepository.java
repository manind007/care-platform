package com.careplatform.ehr.repository;

import com.careplatform.ehr.model.PatientProcedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientProcedureRepository extends JpaRepository<PatientProcedure, Long> {
    List<PatientProcedure> findByTenantIdAndClientIdOrderByProcedureDateDesc(String tenantId, Long clientId);
}

