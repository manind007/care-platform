package com.careplatform.insurance.repository;

import com.careplatform.insurance.model.InsuranceClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, Long> {

    List<InsuranceClaim> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    List<InsuranceClaim> findByTenantIdAndUhidOrderByCreatedAtDesc(String tenantId, String uhid);

    List<InsuranceClaim> findByTenantIdAndClaimStatus(String tenantId, String claimStatus);

    Optional<InsuranceClaim> findByTenantIdAndClaimNumber(String tenantId, String claimNumber);
}

