package com.careplatform.insurance.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.insurance.model.InsuranceClaim;
import com.careplatform.insurance.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InsuranceClaimService {

    private final InsuranceClaimRepository claimRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<InsuranceClaim> getAllClaims() {
        return claimRepository.findByTenantIdOrderByCreatedAtDesc(TenantContext.getTenantId());
    }

    @Transactional(readOnly = true)
    public List<InsuranceClaim> getClaimsByUhid(String uhid) {
        return claimRepository.findByTenantIdAndUhidOrderByCreatedAtDesc(TenantContext.getTenantId(), uhid);
    }

    @Transactional(readOnly = true)
    public InsuranceClaim getClaimById(Long id) {
        return claimRepository.findById(id)
                .filter(c -> c.getTenantId().equals(TenantContext.getTenantId()))
                .orElseThrow(() -> new CarePlatformException("Insurance claim not found: " + id));
    }

    @Transactional
    public InsuranceClaim createClaim(InsuranceClaim claim) {
        String tenantId = TenantContext.getTenantId();
        claim.setTenantId(tenantId);
        if (claim.getClaimNumber() == null || claim.getClaimNumber().isBlank()) {
            claim.setClaimNumber("TPA-" + System.currentTimeMillis() % 1000000);
        }
        if (claim.getClaimStatus() == null || claim.getClaimStatus().isBlank()) {
            claim.setClaimStatus("SUBMITTED");
        }
        InsuranceClaim saved = claimRepository.save(claim);
        auditService.record("INSURANCE_CLAIM_SUBMITTED", "InsuranceClaim", saved.getId().toString(),
                "Submitted TPA claim " + saved.getClaimNumber() + " for " + saved.getPatientName() + " (" + saved.getInsuranceCompany() + " £" + saved.getRequestedAmount() + ")",
                null, saved.getClaimStatus());
        return saved;
    }

    @Transactional
    public InsuranceClaim updateClaimStatus(Long id, String newStatus, BigDecimal approvedAmt, String preAuthCode, String remarks) {
        InsuranceClaim claim = getClaimById(id);
        claim.setClaimStatus(newStatus);
        if (approvedAmt != null) {
            claim.setApprovedAmount(approvedAmt);
        }
        if (preAuthCode != null && !preAuthCode.isBlank()) {
            claim.setPreAuthApprovalCode(preAuthCode);
            claim.setApprovalDate(LocalDate.now());
        }
        if ("QUERY_RAISED".equalsIgnoreCase(newStatus)) {
            claim.setQueryRemarks(remarks);
        } else if ("FINAL_SETTLED".equalsIgnoreCase(newStatus)) {
            claim.setSettlementRemarks(remarks);
        } else if ("REJECTED".equalsIgnoreCase(newStatus)) {
            claim.setSettlementRemarks(remarks);
        }
        InsuranceClaim saved = claimRepository.save(claim);
        auditService.record("INSURANCE_CLAIM_UPDATED", "InsuranceClaim", saved.getId().toString(),
                "Claim " + saved.getClaimNumber() + " status updated to " + newStatus + (approvedAmt != null ? " with approved £" + approvedAmt : ""),
                null, newStatus);
        return saved;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTpaSummary() {
        String tenantId = TenantContext.getTenantId();
        List<InsuranceClaim> all = claimRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);

        BigDecimal totalRequested = all.stream()
                .map(InsuranceClaim::getRequestedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalApproved = all.stream()
                .map(InsuranceClaim::getApprovedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingPreAuth = all.stream()
                .filter(c -> "SUBMITTED".equalsIgnoreCase(c.getClaimStatus()) || "QUERY_RAISED".equalsIgnoreCase(c.getClaimStatus()))
                .count();

        long approvedCount = all.stream()
                .filter(c -> "INITIAL_PREAUTH_APPROVED".equalsIgnoreCase(c.getClaimStatus()) || "FINAL_SETTLED".equalsIgnoreCase(c.getClaimStatus()))
                .count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalClaimsCount", all.size());
        summary.put("totalRequestedAmount", totalRequested);
        summary.put("totalApprovedCashlessAmount", totalApproved);
        summary.put("pendingPreAuthCount", pendingPreAuth);
        summary.put("approvedCount", approvedCount);
        summary.put("settlementRatePercentage", all.isEmpty() ? 0.0 : Math.round(((double) approvedCount / all.size()) * 1000.0) / 10.0);

        return summary;
    }
}

