package com.careplatform.crm.repository;

import com.careplatform.crm.model.ClientLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientLeadRepository extends JpaRepository<ClientLead, Long> {

    List<ClientLead> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    List<ClientLead> findByTenantIdAndPipelineStageOrderByCreatedAtDesc(String tenantId, String pipelineStage);
}

