package com.careplatform.incident.repository;

import com.careplatform.incident.model.Incident;
import com.careplatform.incident.model.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByTenantId(String tenantId);
    List<Incident> findByTenantIdAndClientId(String tenantId, Long clientId);
    List<Incident> findByTenantIdAndStatus(String tenantId, IncidentStatus status);
    List<Incident> findByTenantIdAndStatusNot(String tenantId, IncidentStatus status);
}
