package com.careplatform.careplan.repository;

import com.careplatform.careplan.model.CarePlan;
import com.careplatform.careplan.model.CarePlanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarePlanRepository extends JpaRepository<CarePlan, Long> {
    List<CarePlan> findByTenantId(String tenantId);
    List<CarePlan> findByTenantIdAndClientId(String tenantId, Long clientId);
    List<CarePlan> findByTenantIdAndStatus(String tenantId, CarePlanStatus status);
    Optional<CarePlan> findByTenantIdAndId(String tenantId, Long id);
}
