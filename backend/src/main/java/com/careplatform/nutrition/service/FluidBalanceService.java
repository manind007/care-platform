package com.careplatform.nutrition.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.nutrition.model.FluidBalanceEntry;
import com.careplatform.nutrition.repository.FluidBalanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FluidBalanceService {

    private final FluidBalanceRepository fluidRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<FluidBalanceEntry> getClientHistory(Long clientId) {
        return fluidRepository.findByTenantIdAndClientIdOrderByRecordedAtDesc(TenantContext.getTenantId(), clientId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTodaySummary(Long clientId) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        List<FluidBalanceEntry> todayEntries = fluidRepository
                .findByTenantIdAndClientIdAndRecordedAtBetweenOrderByRecordedAtAsc(TenantContext.getTenantId(), clientId, start, end);

        int totalIntake = todayEntries.stream()
                .filter(e -> "INTAKE".equalsIgnoreCase(e.getEntryType()))
                .mapToInt(FluidBalanceEntry::getVolumeMl)
                .sum();

        int totalOutput = todayEntries.stream()
                .filter(e -> "OUTPUT".equalsIgnoreCase(e.getEntryType()))
                .mapToInt(FluidBalanceEntry::getVolumeMl)
                .sum();

        int netBalance = totalIntake - totalOutput;
        int target = 1800;
        if (!todayEntries.isEmpty() && todayEntries.get(0).getTargetDailyVolumeMl() != null) {
            target = todayEntries.get(0).getTargetDailyVolumeMl();
        }

        double percentAchieved = target > 0 ? ((double) totalIntake / target) * 100 : 0.0;
        boolean dehydrationAlert = percentAchieved < 50.0 && LocalTime.now().isAfter(LocalTime.of(15, 0));

        Map<String, Object> summary = new HashMap<>();
        summary.put("clientId", clientId);
        summary.put("date", LocalDate.now().toString());
        summary.put("totalIntakeMl", totalIntake);
        summary.put("totalOutputMl", totalOutput);
        summary.put("netBalanceMl", netBalance);
        summary.put("targetMl", target);
        summary.put("percentAchieved", Math.round(percentAchieved * 10.0) / 10.0);
        summary.put("dehydrationRiskAlert", dehydrationAlert);
        summary.put("entries", todayEntries);

        return summary;
    }

    @Transactional
    public FluidBalanceEntry recordEntry(FluidBalanceEntry entry) {
        String tenantId = TenantContext.getTenantId();
        entry.setTenantId(tenantId);
        if (entry.getRecordedAt() == null) {
            entry.setRecordedAt(LocalDateTime.now());
        }
        FluidBalanceEntry saved = fluidRepository.save(entry);

        auditService.record("FLUID_BALANCE_LOGGED", "FluidBalanceEntry", saved.getId().toString(),
                saved.getEntryType() + " of " + saved.getVolumeMl() + "ml (" + saved.getFluidDescription() + ")",
                null, saved.getEntryType());

        return saved;
    }
}

