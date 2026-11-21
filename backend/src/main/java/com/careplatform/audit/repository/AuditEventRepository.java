package com.careplatform.audit.repository;

import com.careplatform.audit.model.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    List<AuditEvent> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    List<AuditEvent> findByTenantIdAndResourceTypeOrderByCreatedAtDesc(String tenantId, String resourceType);
    List<AuditEvent> findByTenantIdAndResourceIdOrderByCreatedAtDesc(String tenantId, String resourceId);
}
