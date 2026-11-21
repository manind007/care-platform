package com.careplatform.risk.repository;

import com.careplatform.risk.model.Risk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskRepository extends JpaRepository<Risk, Long> {
    List<Risk> findByTenantId(String tenantId);
    List<Risk> findByTenantIdAndClientId(String tenantId, Long clientId);
    List<Risk> findByTenantIdAndRiskLevel(String tenantId, String riskLevel);
}
