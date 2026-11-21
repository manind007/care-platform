package com.careplatform.risk.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.client.service.ClientService;
import com.careplatform.common.exception.ResourceNotFoundException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.risk.model.Risk;
import com.careplatform.risk.repository.RiskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RiskService {

    private final RiskRepository riskRepository;
    private final AuditService auditService;
    private final ClientService clientService;

    @Transactional(readOnly = true)
    public List<Risk> getAllRisks() {
        return riskRepository.findByTenantId(TenantContext.getTenantId());
    }

    @Transactional(readOnly = true)
    public List<Risk> getRisksByClient(Long clientId) {
        return riskRepository.findByTenantIdAndClientId(TenantContext.getTenantId(), clientId);
    }

    @Transactional(readOnly = true)
    public Risk getRiskById(Long id) {
        return riskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk not found: " + id));
    }

    @Transactional
    public Risk createRisk(Risk risk) {
        risk.setTenantId(TenantContext.getTenantId());
        risk.calculateRisk();
        Risk saved = riskRepository.save(risk);

        auditService.record("RISK_CREATE", "Risk", saved.getId().toString(),
                "Risk logged: " + saved.getCategory() + " (" + saved.getRiskLevel() + ")",
                null, saved.getRiskLevel());

        clientService.addTimelineEvent(saved.getClientId(), "RISK_IDENTIFIED",
                "Risk Identified: " + saved.getCategory(),
                saved.getDescription() + " (Score: " + saved.getRiskScore() + ")",
                "HIGH".equalsIgnoreCase(saved.getRiskLevel()) || "CRITICAL".equalsIgnoreCase(saved.getRiskLevel()) ? "CRITICAL" : "WARNING",
                saved.getOwnerName(), true);

        return saved;
    }

    @Transactional
    public Risk updateStatus(Long id, String status) {
        Risk risk = getRiskById(id);
        String oldStatus = risk.getStatus();
        risk.setStatus(status);
        Risk saved = riskRepository.save(risk);

        auditService.record("RISK_STATUS_CHANGE", "Risk", id.toString(),
                "Risk status changed: " + oldStatus + " -> " + status, oldStatus, status);

        return saved;
    }
}
