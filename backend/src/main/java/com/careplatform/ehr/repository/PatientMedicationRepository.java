package com.careplatform.ehr.repository;

import com.careplatform.ehr.model.PatientMedication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientMedicationRepository extends JpaRepository<PatientMedication, Long> {
    List<PatientMedication> findByTenantIdAndClientId(String tenantId, Long clientId);
}

