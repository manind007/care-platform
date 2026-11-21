package com.careplatform.skills.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.skills.model.CarerSkill;
import com.careplatform.skills.repository.CarerSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CarerSkillService {

    private final CarerSkillRepository skillRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<CarerSkill> getSkillsForUser(Long userId) {
        return skillRepository.findByTenantIdAndUserId(TenantContext.getTenantId(), userId);
    }

    @Transactional(readOnly = true)
    public List<CarerSkill> getAllSkills() {
        return skillRepository.findByTenantIdOrderByCarerNameAsc(TenantContext.getTenantId());
    }

    @Transactional
    public CarerSkill addSkill(CarerSkill skill) {
        String tenantId = TenantContext.getTenantId();
        skill.setTenantId(tenantId);
        skill.setActive(true);
        if (skill.getCertifiedAt() == null) {
            skill.setCertifiedAt(LocalDate.now());
        }
        if (skill.getExpiresAt() == null) {
            skill.setExpiresAt(LocalDate.now().plusYears(1));
        }
        CarerSkill saved = skillRepository.save(skill);

        auditService.record("CARER_SKILL_VERIFIED", "CarerSkill", saved.getId().toString(),
                "Verified competency: " + saved.getSkillName() + " for " + saved.getCarerName() + " (Cert: " + saved.getCertificationNumber() + ")",
                null, "ACTIVE");

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> matchCarers(List<String> requiredSkills) {
        String tenantId = TenantContext.getTenantId();
        List<CarerSkill> allActive = skillRepository.findByTenantIdOrderByCarerNameAsc(tenantId).stream()
                .filter(CarerSkill::isActive)
                .filter(s -> s.getExpiresAt() == null || s.getExpiresAt().isAfter(LocalDate.now()))
                .toList();

        Map<Long, List<CarerSkill>> byUser = allActive.stream().collect(Collectors.groupingBy(CarerSkill::getUserId));

        List<Map<String, Object>> result = new ArrayList<>();
        int totalRequired = requiredSkills != null ? requiredSkills.size() : 0;

        for (Map.Entry<Long, List<CarerSkill>> entry : byUser.entrySet()) {
            List<CarerSkill> staffSkills = entry.getValue();
            String name = staffSkills.get(0).getCarerName();
            Set<String> staffSkillNames = staffSkills.stream().map(CarerSkill::getSkillName).collect(Collectors.toSet());

            int matchedCount = 0;
            List<String> matched = new ArrayList<>();
            List<String> missing = new ArrayList<>();

            if (requiredSkills != null) {
                for (String req : requiredSkills) {
                    if (staffSkillNames.contains(req)) {
                        matchedCount++;
                        matched.add(req);
                    } else {
                        missing.add(req);
                    }
                }
            }

            double matchPercent = totalRequired > 0 ? ((double) matchedCount / totalRequired) * 100 : 100.0;

            Map<String, Object> map = new HashMap<>();
            map.put("userId", entry.getKey());
            map.put("carerName", name);
            map.put("totalCompetencies", staffSkills.size());
            map.put("matchPercentage", Math.round(matchPercent * 10.0) / 10.0);
            map.put("isFullyQualified", missing.isEmpty());
            map.put("matchedSkills", matched);
            map.put("missingSkills", missing);
            map.put("allSkills", staffSkills);

            result.add(map);
        }

        result.sort((a, b) -> Double.compare((Double) b.get("matchPercentage"), (Double) a.get("matchPercentage")));
        return result;
    }
}

