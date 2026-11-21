package com.careplatform.client.repository;

import com.careplatform.client.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByTenantId(String tenantId);
    List<Client> findByTenantIdAndStatus(String tenantId, String status);
    Optional<Client> findByTenantIdAndId(String tenantId, Long id);
    Optional<Client> findByTenantIdAndClientIdentifier(String tenantId, String clientIdentifier);
}
