package com.careplatform.ehr.repository;

import com.careplatform.ehr.model.PatientImmunization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientImmunizationRepository extends JpaRepository<PatientImmunization, Long> {
    List<PatientImmunization> findByTenantIdAndClientIdOrderByAdministrationDateDesc(String tenantId, Long clientId);
}

