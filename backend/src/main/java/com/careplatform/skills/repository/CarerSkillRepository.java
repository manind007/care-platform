package com.careplatform.skills.repository;

import com.careplatform.skills.model.CarerSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarerSkillRepository extends JpaRepository<CarerSkill, Long> {
    List<CarerSkill> findByTenantIdAndUserId(String tenantId, Long userId);
    List<CarerSkill> findByTenantIdAndSkillName(String tenantId, String skillName);
    List<CarerSkill> findByTenantIdOrderByCarerNameAsc(String tenantId);
}

