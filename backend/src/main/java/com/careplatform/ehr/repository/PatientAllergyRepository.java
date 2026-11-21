package com.careplatform.ehr.repository;

import com.careplatform.ehr.model.PatientAllergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientAllergyRepository extends JpaRepository<PatientAllergy, Long> {
    List<PatientAllergy> findByTenantIdAndClientId(String tenantId, Long clientId);
}

