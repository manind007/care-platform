package com.careplatform.opd.repository;

import com.careplatform.opd.model.OpdAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpdAppointmentRepository extends JpaRepository<OpdAppointment, Long> {
    List<OpdAppointment> findByTenantIdOrderByTokenNumberAsc(String tenantId);
    List<OpdAppointment> findByTenantIdAndStatus(String tenantId, OpdAppointment.OpdStatus status);
    List<OpdAppointment> findByTenantIdAndUhid(String tenantId, String uhid);
}

