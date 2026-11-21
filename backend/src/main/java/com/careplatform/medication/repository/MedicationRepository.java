package com.careplatform.medication.repository;

import com.careplatform.medication.model.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
    List<Medication> findByTenantId(String tenantId);
    List<Medication> findByTenantIdAndClientIdAndActiveTrue(String tenantId, Long clientId);
    List<Medication> findByTenantIdAndClientId(String tenantId, Long clientId);
}
