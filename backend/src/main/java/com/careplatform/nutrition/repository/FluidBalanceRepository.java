package com.careplatform.nutrition.repository;

import com.careplatform.nutrition.model.FluidBalanceEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FluidBalanceRepository extends JpaRepository<FluidBalanceEntry, Long> {
    List<FluidBalanceEntry> findByTenantIdAndClientIdOrderByRecordedAtDesc(String tenantId, Long clientId);
    List<FluidBalanceEntry> findByTenantIdAndClientIdAndRecordedAtBetweenOrderByRecordedAtAsc(
            String tenantId, Long clientId, LocalDateTime start, LocalDateTime end);
}

