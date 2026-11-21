package com.careplatform.emergency.repository;

import com.careplatform.emergency.model.EmergencyTriage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyTriageRepository extends JpaRepository<EmergencyTriage, Long> {

    List<EmergencyTriage> findByTenantIdOrderByArrivalDateTimeDesc(String tenantId);

    List<EmergencyTriage> findByTenantIdAndStatusInOrderByEsiLevelAscArrivalDateTimeAsc(String tenantId, List<String> statuses);

    Optional<EmergencyTriage> findByTenantIdAndTriageNumber(String tenantId, String triageNumber);
}

