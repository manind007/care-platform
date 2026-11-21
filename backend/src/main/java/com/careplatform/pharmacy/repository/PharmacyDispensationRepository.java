package com.careplatform.pharmacy.repository;

import com.careplatform.pharmacy.model.PharmacyDispensation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PharmacyDispensationRepository extends JpaRepository<PharmacyDispensation, Long> {
    List<PharmacyDispensation> findByTenantIdOrderByDispensedAtDesc(String tenantId);
    List<PharmacyDispensation> findByTenantIdAndUhid(String tenantId, String uhid);
}

