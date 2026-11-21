package com.careplatform.pharmacy.repository;

import com.careplatform.pharmacy.model.MedicineMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineMasterRepository extends JpaRepository<MedicineMaster, Long> {
    List<MedicineMaster> findByTenantIdOrderByBrandNameAsc(String tenantId);
    List<MedicineMaster> findByTenantIdAndBrandNameContainingIgnoreCase(String tenantId, String query);
}

