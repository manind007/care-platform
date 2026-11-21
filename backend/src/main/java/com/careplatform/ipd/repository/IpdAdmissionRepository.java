package com.careplatform.ipd.repository;

import com.careplatform.ipd.model.IpdAdmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IpdAdmissionRepository extends JpaRepository<IpdAdmission, Long> {
    List<IpdAdmission> findByTenantIdOrderByAdmissionDateTimeDesc(String tenantId);
    List<IpdAdmission> findByTenantIdAndStatus(String tenantId, IpdAdmission.AdmissionStatus status);
    List<IpdAdmission> findByTenantIdAndUhid(String tenantId, String uhid);
}

