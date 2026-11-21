package com.careplatform.careplan.repository;

import com.careplatform.careplan.model.CareTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareTaskRepository extends JpaRepository<CareTask, Long> {
    List<CareTask> findByCarePlanId(Long carePlanId);
}
