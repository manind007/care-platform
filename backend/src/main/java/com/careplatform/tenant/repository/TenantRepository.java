package com.careplatform.tenant.repository;

import com.careplatform.tenant.model.Branch;
import com.careplatform.tenant.model.Organisation;
import com.careplatform.tenant.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    Optional<Tenant> findByTenantId(String tenantId);
}
