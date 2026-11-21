package com.careplatform.visit.repository;

import com.careplatform.visit.model.Visit;
import com.careplatform.visit.model.VisitStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {
    List<Visit> findByTenantId(String tenantId);
    List<Visit> findByTenantIdAndClientId(String tenantId, Long clientId);
    List<Visit> findByTenantIdAndStaffId(String tenantId, Long staffId);
    List<Visit> findByTenantIdAndStatus(String tenantId, VisitStatus status);
    List<Visit> findByTenantIdAndScheduledStartBetween(String tenantId, LocalDateTime start, LocalDateTime end);
    List<Visit> findByTenantIdAndStaffIdAndScheduledStartBetween(String tenantId, Long staffId, LocalDateTime start, LocalDateTime end);
}
