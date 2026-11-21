package com.careplatform.assessment.service;

import com.careplatform.assessment.model.AssessmentSubmission;
import com.careplatform.assessment.model.AssessmentTemplate;
import com.careplatform.assessment.repository.AssessmentSubmissionRepository;
import com.careplatform.assessment.repository.AssessmentTemplateRepository;
import com.careplatform.audit.service.AuditService;
import com.careplatform.client.service.ClientService;
import com.careplatform.common.exception.ResourceNotFoundException;
import com.careplatform.common.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final AssessmentTemplateRepository templateRepository;
    private final AssessmentSubmissionRepository submissionRepository;
    private final AuditService auditService;
    private final ClientService clientService;

    @Transactional(readOnly = true)
    public List<AssessmentTemplate> getTemplates() {
        return templateRepository.findByTenantId(TenantContext.getTenantId());
    }

    @Transactional(readOnly = true)
    public AssessmentTemplate getTemplateById(Long id) {
        AssessmentTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment template not found: " + id));
        template.getQuestions().size();
        return template;
    }

    @Transactional
    public AssessmentSubmission submitAssessment(AssessmentSubmission submission) {
        submission.setTenantId(TenantContext.getTenantId());

        // determine risk level based on score thresholds
        if (submission.getTotalScore() != null) {
            if (submission.getTotalScore() >= 15) {
                submission.setRiskLevel("HIGH");
            } else if (submission.getTotalScore() >= 8) {
                submission.setRiskLevel("MEDIUM");
            } else {
                submission.setRiskLevel("LOW");
            }
        }

        AssessmentSubmission saved = submissionRepository.save(submission);

        auditService.record("ASSESSMENT_SUBMIT", "AssessmentSubmission", saved.getId().toString(),
                "Assessment completed: " + saved.getTemplateTitle() + " (Score: " + saved.getTotalScore() + ", Risk: " + saved.getRiskLevel() + ")",
                null, saved.getRiskLevel());

        clientService.addTimelineEvent(saved.getClientId(), "ASSESSMENT_SUBMITTED",
                "Assessment Completed: " + saved.getTemplateTitle(),
                "Score: " + saved.getTotalScore() + " | Risk: " + saved.getRiskLevel(),
                "HIGH".equalsIgnoreCase(saved.getRiskLevel()) ? "WARNING" : "INFO",
                saved.getAssessorName(), true);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<AssessmentSubmission> getClientSubmissions(Long clientId) {
        return submissionRepository.findByTenantIdAndClientIdOrderByCreatedAtDesc(TenantContext.getTenantId(), clientId);
    }
}
