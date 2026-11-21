package com.careplatform.virtualward.repository;

import com.careplatform.virtualward.model.VirtualWardStay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VirtualWardRepository extends JpaRepository<VirtualWardStay, Long> {
    List<VirtualWardStay> findByTenantIdOrderByAdmissionDateDesc(String tenantId);
    List<VirtualWardStay> findByTenantIdAndStatusNot(String tenantId, String status);
    List<VirtualWardStay> findByTenantIdAndClientId(String tenantId, Long clientId);
}

