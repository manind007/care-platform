package com.careplatform.ehr.repository;

import com.careplatform.ehr.model.PastMedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PastMedicalHistoryRepository extends JpaRepository<PastMedicalHistory, Long> {
    List<PastMedicalHistory> findByTenantIdAndClientId(String tenantId, Long clientId);
}

