package com.careplatform.shiftbroadcast.repository;

import com.careplatform.shiftbroadcast.model.OpenShiftBroadcast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpenShiftBroadcastRepository extends JpaRepository<OpenShiftBroadcast, Long> {

    List<OpenShiftBroadcast> findByTenantIdOrderByShiftDateAscStartTimeAsc(String tenantId);

    List<OpenShiftBroadcast> findByTenantIdAndBroadcastStatusOrderByShiftDateAscStartTimeAsc(String tenantId, String status);
}

