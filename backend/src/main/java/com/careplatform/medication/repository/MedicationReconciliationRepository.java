package com.careplatform.medication.repository;

import com.careplatform.medication.model.MedicationReconciliation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationReconciliationRepository extends JpaRepository<MedicationReconciliation, Long> {
    List<MedicationReconciliation> findByTenantIdAndClientIdOrderByReconciliationDateDesc(String tenantId, Long clientId);
}

