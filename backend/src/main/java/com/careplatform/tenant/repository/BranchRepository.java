package com.careplatform.tenant.repository;

import com.careplatform.tenant.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByTenantId(String tenantId);
    List<Branch> findByTenantIdAndOrganisationId(String tenantId, Long organisationId);
}
