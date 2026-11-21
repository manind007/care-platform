package com.careplatform.pharmacy.repository;

import com.careplatform.pharmacy.model.MedicineBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicineBatchRepository extends JpaRepository<MedicineBatch, Long> {
    List<MedicineBatch> findByTenantIdOrderByExpiryDateAsc(String tenantId);
    List<MedicineBatch> findByTenantIdAndMedicineId(String tenantId, Long medicineId);
    List<MedicineBatch> findByTenantIdAndExpiryDateBefore(String tenantId, LocalDate date);
}

