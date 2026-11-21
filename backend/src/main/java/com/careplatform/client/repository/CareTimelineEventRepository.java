package com.careplatform.client.repository;

import com.careplatform.client.model.CareTimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareTimelineEventRepository extends JpaRepository<CareTimelineEvent, Long> {
    List<CareTimelineEvent> findByTenantIdAndClientIdOrderByEventTimestampDesc(String tenantId, Long clientId);
    List<CareTimelineEvent> findByTenantIdAndClientIdAndVisibleToFamilyTrueOrderByEventTimestampDesc(String tenantId, Long clientId);
}
