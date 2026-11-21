package com.careplatform.ehr.repository;

import com.careplatform.ehr.model.FamilyHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FamilyHistoryRepository extends JpaRepository<FamilyHistory, Long> {
    List<FamilyHistory> findByTenantIdAndClientId(String tenantId, Long clientId);
}

