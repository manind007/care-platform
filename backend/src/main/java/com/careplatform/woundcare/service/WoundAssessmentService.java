package com.careplatform.woundcare.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.client.service.ClientService;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.woundcare.model.WoundAssessment;
import com.careplatform.woundcare.repository.WoundAssessmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WoundAssessmentService {

    private final WoundAssessmentRepository woundRepository;
    private final AuditService auditService;
    private final ClientService clientService;

    @Transactional(readOnly = true)
    public List<WoundAssessment> getClientWounds(Long clientId) {
        return woundRepository.findByTenantIdAndClientIdOrderByAssessmentDateDesc(TenantContext.getTenantId(), clientId);
    }

    @Transactional(readOnly = true)
    public List<WoundAssessment> getAllWounds() {
        return woundRepository.findByTenantIdOrderByAssessmentDateDesc(TenantContext.getTenantId());
    }

    @Transactional
    public WoundAssessment recordWoundAssessment(WoundAssessment wound) {
        String tenantId = TenantContext.getTenantId();
        wound.setTenantId(tenantId);
        if (wound.getAssessmentDate() == null) {
            wound.setAssessmentDate(LocalDate.now());
        }
        WoundAssessment saved = woundRepository.save(wound);

        auditService.record("WOUND_ASSESSMENT_RECORDED", "WoundAssessment", saved.getId().toString(),
                "Documented " + saved.getStage() + " at " + saved.getAnatomicalLocation() + " (Dressing: " + saved.getDressingType() + ")",
                null, saved.getHealingStatus());

        String severity = "STAGE_3".equals(saved.getStage()) || "STAGE_4".equals(saved.getStage()) ? "WARNING" : "INFO";
        clientService.addTimelineEvent(saved.getClientId(), "WOUND_DOCUMENTED",
                "Tissue Viability: " + saved.getAnatomicalLocation() + " (" + saved.getStage() + ")",
                "Size: " + saved.getLengthCm() + "x" + saved.getWidthCm() + "cm | Exudate: " + saved.getExudateAmount() + " " + saved.getExudateType() + " | Dressing: " + saved.getDressingType(),
                severity, saved.getAssessedBy(), true);

        return saved;
    }
}

