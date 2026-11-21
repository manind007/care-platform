package com.careplatform.ehr.repository;

import com.careplatform.ehr.model.SocialHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SocialHistoryRepository extends JpaRepository<SocialHistory, Long> {
    Optional<SocialHistory> findByTenantIdAndClientId(String tenantId, Long clientId);
}

