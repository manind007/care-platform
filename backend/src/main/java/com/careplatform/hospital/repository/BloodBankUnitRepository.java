package com.careplatform.hospital.repository;

import com.careplatform.hospital.model.BloodBankUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BloodBankUnitRepository extends JpaRepository<BloodBankUnit, Long> {
    List<BloodBankUnit> findByTenantIdOrderByExpiryDateAsc(String tenantId);
    List<BloodBankUnit> findByTenantIdAndBloodGroup(String tenantId, String bloodGroup);
    List<BloodBankUnit> findByTenantIdAndStatus(String tenantId, BloodBankUnit.UnitStatus status);
}

