package com.careplatform.medication.repository;

import com.careplatform.medication.model.MedicationAdministration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicationAdministrationRepository extends JpaRepository<MedicationAdministration, Long> {
    List<MedicationAdministration> findByTenantIdAndClientIdOrderByAdministrationTimeDesc(String tenantId, Long clientId);
    List<MedicationAdministration> findByTenantIdAndAdministrationTimeBetweenOrderByAdministrationTimeDesc(String tenantId, LocalDateTime start, LocalDateTime end);
    List<MedicationAdministration> findByTenantIdAndExceptionTrueOrderByAdministrationTimeDesc(String tenantId);
}
