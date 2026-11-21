package com.careplatform.careplan.repository;

import com.careplatform.careplan.model.CarePlanVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarePlanVersionRepository extends JpaRepository<CarePlanVersion, Long> {
    List<CarePlanVersion> findByTenantIdAndCarePlanIdOrderByVersionNumberDesc(String tenantId, Long carePlanId);
}
