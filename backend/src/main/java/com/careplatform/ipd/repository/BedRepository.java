package com.careplatform.ipd.repository;

import com.careplatform.ipd.model.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    List<Bed> findByTenantIdOrderByBedNumberAsc(String tenantId);
    List<Bed> findByTenantIdAndWardId(String tenantId, Long wardId);
    List<Bed> findByTenantIdAndStatus(String tenantId, Bed.BedStatus status);
}

