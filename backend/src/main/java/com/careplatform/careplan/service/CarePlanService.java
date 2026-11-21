package com.careplatform.careplan.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.careplan.model.*;
import com.careplatform.careplan.repository.CareGoalRepository;
import com.careplatform.careplan.repository.CarePlanRepository;
import com.careplatform.careplan.repository.CarePlanVersionRepository;
import com.careplatform.careplan.repository.CareTaskRepository;
import com.careplatform.client.service.ClientService;
import com.careplatform.common.exception.ResourceNotFoundException;
import com.careplatform.common.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarePlanService {

    private final CarePlanRepository carePlanRepository;
    private final CarePlanVersionRepository versionRepository;
    private final CareGoalRepository goalRepository;
    private final CareTaskRepository taskRepository;
    private final AuditService auditService;
    private final ClientService clientService;

    @Transactional(readOnly = true)
    public List<CarePlan> getAllPlans() {
        return carePlanRepository.findByTenantId(TenantContext.getTenantId());
    }

    @Transactional(readOnly = true)
    public List<CarePlan> getPlansByClient(Long clientId) {
        return carePlanRepository.findByTenantIdAndClientId(TenantContext.getTenantId(), clientId);
    }

    @Transactional(readOnly = true)
    public CarePlan getPlanById(Long id) {
        CarePlan plan = carePlanRepository.findByTenantIdAndId(TenantContext.getTenantId(), id)
                .orElseThrow(() -> new ResourceNotFoundException("Care plan not found with id: " + id));
        plan.getGoals().size(); // force load
        plan.getTasks().size();
        return plan;
    }

    @Transactional
    public CarePlan createPlan(CarePlan plan) {
        plan.setTenantId(TenantContext.getTenantId());
        plan.setStatus(CarePlanStatus.DRAFT);
        plan.setVersion(1);

        if (plan.getGoals() != null) {
            plan.getGoals().forEach(g -> {
                g.setCarePlan(plan);
                g.setTenantId(TenantContext.getTenantId());
            });
        }
        if (plan.getTasks() != null) {
            plan.getTasks().forEach(t -> {
                t.setCarePlan(plan);
                t.setTenantId(TenantContext.getTenantId());
            });
        }

        CarePlan saved = carePlanRepository.save(plan);
        auditService.record("CAREPLAN_CREATE", "CarePlan", saved.getId().toString(),
                "Care plan draft created: " + saved.getTitle(), null, "DRAFT");

        clientService.addTimelineEvent(saved.getClientId(), "CAREPLAN_CREATED", "Care Plan Created",
                "Care plan draft (" + saved.getTitle() + ") created.", "INFO", "System", true);

        return saved;
    }

    @Transactional
    public CarePlan updatePlan(Long id, CarePlan updated) {
        CarePlan existing = getPlanById(id);
        existing.setTitle(updated.getTitle());
        existing.setSummary(updated.getSummary());
        existing.setStartDate(updated.getStartDate());
        existing.setReviewDate(updated.getReviewDate());
        existing.setMedicationInstructions(updated.getMedicationInstructions());
        existing.setMobilitySupportNotes(updated.getMobilitySupportNotes());
        existing.setNutritionDietaryRequirements(updated.getNutritionDietaryRequirements());

        CarePlan saved = carePlanRepository.save(existing);
        auditService.record("CAREPLAN_UPDATE", "CarePlan", id.toString(),
                "Care plan updated: " + saved.getTitle(), null, saved.getStatus().name());
        return saved;
    }

    @Transactional
    public CarePlan updateStatus(Long id, CarePlanStatus newStatus, String reviewerName) {
        CarePlan plan = getPlanById(id);
        CarePlanStatus oldStatus = plan.getStatus();
        plan.setStatus(newStatus);

        if (newStatus == CarePlanStatus.ACTIVE || newStatus == CarePlanStatus.APPROVED) {
            plan.setApprovedBy(reviewerName != null ? reviewerName : "Manager");

            // Snapshot version
            CarePlanVersion version = CarePlanVersion.builder()
                    .carePlanId(plan.getId())
                    .versionNumber(plan.getVersion())
                    .changeSummary("Approved status transition: " + oldStatus + " -> " + newStatus)
                    .approvedBy(plan.getApprovedBy())
                    .snapshotJson("{\"version\":" + plan.getVersion() + ",\"title\":\"" + plan.getTitle() + "\"}")
                    .build();
            version.setTenantId(TenantContext.getTenantId());
            versionRepository.save(version);
        }

        CarePlan saved = carePlanRepository.save(plan);
        auditService.record("CAREPLAN_STATUS_CHANGE", "CarePlan", id.toString(),
                "Status transitioned from " + oldStatus + " to " + newStatus + " by " + reviewerName,
                oldStatus.name(), newStatus.name());

        clientService.addTimelineEvent(plan.getClientId(), "CAREPLAN_STATUS", "Care Plan Status: " + newStatus,
                "Care plan updated to " + newStatus + " by " + reviewerName, "INFO", reviewerName, true);

        return saved;
    }

    @Transactional
    public CarePlan createNewVersion(Long id) {
        CarePlan current = getPlanById(id);
        current.setStatus(CarePlanStatus.ARCHIVED);
        carePlanRepository.save(current);

        CarePlan newVersion = CarePlan.builder()
                .clientId(current.getClientId())
                .title(current.getTitle())
                .summary(current.getSummary())
                .status(CarePlanStatus.DRAFT)
                .version(current.getVersion() + 1)
                .startDate(current.getStartDate())
                .reviewDate(current.getReviewDate())
                .medicationInstructions(current.getMedicationInstructions())
                .mobilitySupportNotes(current.getMobilitySupportNotes())
                .nutritionDietaryRequirements(current.getNutritionDietaryRequirements())
                .build();
        newVersion.setTenantId(TenantContext.getTenantId());

        CarePlan saved = carePlanRepository.save(newVersion);
        auditService.record("CAREPLAN_VERSION_UPGRADE", "CarePlan", saved.getId().toString(),
                "New version created: v" + saved.getVersion() + " from original plan #" + id,
                "v" + current.getVersion(), "v" + saved.getVersion());

        return saved;
    }

    @Transactional(readOnly = true)
    public List<CarePlanVersion> getVersionHistory(Long planId) {
        return versionRepository.findByTenantIdAndCarePlanIdOrderByVersionNumberDesc(TenantContext.getTenantId(), planId);
    }
}
