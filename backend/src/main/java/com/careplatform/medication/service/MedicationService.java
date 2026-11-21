package com.careplatform.medication.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.client.service.ClientService;
import com.careplatform.medication.model.MedicationReconciliation;
import com.careplatform.medication.repository.MedicationReconciliationRepository;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.medication.dto.RecordAdministrationRequest;
import com.careplatform.medication.model.AdministrationOutcome;
import com.careplatform.medication.model.Medication;
import com.careplatform.medication.model.MedicationAdministration;
import com.careplatform.medication.repository.MedicationAdministrationRepository;
import com.careplatform.medication.repository.MedicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicationService {

        private final MedicationRepository medicationRepository;
        private final MedicationAdministrationRepository administrationRepository;
        private final MedicationReconciliationRepository reconciliationRepository;
        private final AuditService auditService;
        private final ClientService clientService;

        @Transactional(readOnly = true)
        public List<Medication> getClientMedications(Long clientId) {
                return medicationRepository.findByTenantIdAndClientIdAndActiveTrue(TenantContext.getTenantId(),
                                clientId);
        }

        @Transactional
        public Medication addMedication(Medication medication) {
                medication.setTenantId(TenantContext.getTenantId());
                medication.setActive(true);
                Medication saved = medicationRepository.save(medication);

                auditService.record("MEDICATION_PRESCRIBED", "Medication", saved.getId().toString(),
                                "New medication registered: " + saved.getName() + " (" + saved.getDose() + ", "
                                                + saved.getFrequency() + ")",
                                null, "ACTIVE");

                clientService.addTimelineEvent(saved.getClientId(), "MEDICATION_ADDED",
                                "New Medication Added: " + saved.getName(),
                                saved.getName() + " " + saved.getStrength() + " - " + saved.getDose() + " ("
                                                + saved.getFrequency() + ")",
                                "INFO", "Prescriber/Manager", true);

                return saved;
        }

        @Transactional
        public MedicationAdministration recordAdministration(RecordAdministrationRequest request, Long workerId,
                        String workerName) {
                String tenantId = TenantContext.getTenantId();
                Medication medication = medicationRepository.findById(request.getMedicationId())
                                .orElseThrow(() -> new CarePlatformException(
                                                "Medication not found: " + request.getMedicationId()));

                boolean isException = request.getOutcome() != AdministrationOutcome.ADMINISTERED;

                // PRN interval safety check
                if (!isException && (medication.isPrn() || "PRN".equalsIgnoreCase(medication.getScheduleType()))) {
                        int interval = medication.getMinIntervalHours() != null ? medication.getMinIntervalHours() : 4;
                        LocalDateTime cutoff = LocalDateTime.now().minusHours(interval);
                        List<MedicationAdministration> recentAdmins = administrationRepository
                                        .findByTenantIdAndClientIdOrderByAdministrationTimeDesc(tenantId,
                                                        request.getClientId());
                        boolean administeredTooRecently = recentAdmins.stream()
                                        .anyMatch(a -> a.getMedicationId().equals(medication.getId())
                                                        && a.getOutcome() == AdministrationOutcome.ADMINISTERED
                                                        && a.getAdministrationTime().isAfter(cutoff));
                        if (administeredTooRecently) {
                                log.warn("PRN interval safety alert: {} administered within last {} hours",
                                                medication.getName(), interval);
                        }
                }

                // Auto-decrement stock if administered
                if (!isException && medication.getStockQuantity() != null && medication.getStockQuantity() > 0) {
                        int newStock = medication.getStockQuantity() - 1;
                        medication.setStockQuantity(newStock);
                        if (medication.getReorderLevel() != null && newStock <= medication.getReorderLevel()) {
                                medication.setRepeatStatus("DUE_FOR_REORDER");
                        }
                        medicationRepository.save(medication);
                }

                String escalationStatus = "NONE";
                if (isException) {
                        escalationStatus = medication.isTimeCritical() ? "URGENT_ESCALATED" : "FLAGGED_TO_OFFICE";
                }

                MedicationAdministration administration = MedicationAdministration.builder()
                                .clientId(request.getClientId())
                                .medicationId(medication.getId())
                                .medicationName(medication.getName() + " "
                                                + (medication.getStrength() != null ? medication.getStrength() : ""))
                                .doseGiven(request.getDoseGiven() != null ? request.getDoseGiven()
                                                : medication.getDose())
                                .visitId(request.getVisitId())
                                .workerId(workerId)
                                .workerName(workerName)
                                .outcome(request.getOutcome())
                                .scheduledSlot(request.getScheduledSlot() != null ? request.getScheduledSlot()
                                                : "SCHEDULED")
                                .administrationTime(LocalDateTime.now())
                                .outcomeReason(request.getOutcomeReason())
                                .exception(isException)
                                .witnessName(request.getWitnessName())
                                .witnessRole(request.getWitnessRole())
                                .witnessSignedAt(request.getWitnessName() != null ? LocalDateTime.now() : null)
                                .digitalSignature(request.getDigitalSignature() != null ? request.getDigitalSignature()
                                                : "Signed by " + workerName)
                                .topicalSiteApplied(request.getTopicalSiteApplied())
                                .prnReason(request.getPrnReason())
                                .prnEffectiveness(request.getPrnEffectiveness())
                                .escalationStatus(escalationStatus)
                                .escalationNotes(request.getEscalationNotes())
                                .build();
                administration.setTenantId(tenantId);

                MedicationAdministration saved = administrationRepository.save(administration);

                // Audit Trail
                auditService.record("MEDICATION_ADMINISTER", "MedicationAdministration", saved.getId().toString(),
                                "eMAR recorded for " + saved.getMedicationName() + ": outcome=" + saved.getOutcome() +
                                                (isException ? " (EXCEPTION REASON: " + saved.getOutcomeReason()
                                                                + ", ESCALATION: " + escalationStatus + ")" : "")
                                                +
                                                (request.getWitnessName() != null
                                                                ? " [Witnessed by " + request.getWitnessName() + "]"
                                                                : ""),
                                null, saved.getOutcome().name());

                // Timeline Event
                String severity = isException ? (medication.isTimeCritical() ? "CRITICAL" : "WARNING") : "INFO";
                clientService.addTimelineEvent(saved.getClientId(), "MEDICATION_LOGGED",
                                "eMAR: " + saved.getMedicationName() + " - " + saved.getOutcome(),
                                "Dose: " + saved.getDoseGiven()
                                                + (isException ? " | Reason: " + saved.getOutcomeReason()
                                                                : " | Administered successfully"),
                                severity, workerName, true);

                return saved;
        }

        @Transactional
        public MedicationAdministration recordPrnEffectiveness(Long adminId, String effectiveness) {
                MedicationAdministration admin = administrationRepository.findById(adminId)
                                .filter(a -> a.getTenantId().equals(TenantContext.getTenantId()))
                                .orElseThrow(() -> new CarePlatformException(
                                                "Administration record not found: " + adminId));

                admin.setPrnEffectiveness(effectiveness);
                admin.setPrnFollowUpTime(LocalDateTime.now());
                MedicationAdministration saved = administrationRepository.save(admin);

                auditService.record("PRN_EFFECTIVENESS_RECORDED", "MedicationAdministration", adminId.toString(),
                                "Documented PRN outcome for " + saved.getMedicationName() + ": " + effectiveness, null,
                                "FOLLOW_UP_COMPLETE");

                return saved;
        }

        @Transactional
        public MedicationAdministration resolveException(Long adminId, String resolutionNotes) {
                MedicationAdministration admin = administrationRepository.findById(adminId)
                                .filter(a -> a.getTenantId().equals(TenantContext.getTenantId()))
                                .orElseThrow(() -> new CarePlatformException(
                                                "Administration record not found: " + adminId));

                admin.setEscalationStatus("RESOLVED");
                admin.setEscalationNotes(resolutionNotes);
                MedicationAdministration saved = administrationRepository.save(admin);

                auditService.record("MEDICATION_EXCEPTION_RESOLVED", "MedicationAdministration", adminId.toString(),
                                "Office resolved exception for " + saved.getMedicationName() + ": " + resolutionNotes,
                                null, "RESOLVED");

                return saved;
        }

        @Transactional
        public Medication updateMedicationStatus(Long medId, String status) {
                Medication med = medicationRepository.findById(medId)
                                .filter(m -> m.getTenantId().equals(TenantContext.getTenantId()))
                                .orElseThrow(() -> new CarePlatformException("Medication not found: " + medId));

                med.setStatus(status);
                med.setActive("ACTIVE".equalsIgnoreCase(status));
                Medication saved = medicationRepository.save(med);

                auditService.record("MEDICATION_STATUS_CHANGED", "Medication", medId.toString(),
                                "Medication " + saved.getName() + " status updated to " + status, null, status);

                return saved;
        }

        @Transactional
        public Medication reorderRepeatPrescription(Long medId) {
                Medication med = medicationRepository.findById(medId)
                                .filter(m -> m.getTenantId().equals(TenantContext.getTenantId()))
                                .orElseThrow(() -> new CarePlatformException("Medication not found: " + medId));

                med.setRepeatStatus("ORDERED_FROM_GP");
                Medication saved = medicationRepository.save(med);

                auditService.record("REPEAT_PRESCRIPTION_ORDERED", "Medication", medId.toString(),
                                "Repeat prescription reorder submitted for " + saved.getName(), null,
                                "ORDERED_FROM_GP");

                return saved;
        }

        @Transactional
        public Medication receiveMedicationStock(Long medId, Integer quantity) {
                Medication med = medicationRepository.findById(medId)
                                .filter(m -> m.getTenantId().equals(TenantContext.getTenantId()))
                                .orElseThrow(() -> new CarePlatformException("Medication not found: " + medId));

                int current = med.getStockQuantity() != null ? med.getStockQuantity() : 0;
                med.setStockQuantity(current + (quantity != null ? quantity : 28));
                med.setRepeatStatus("DELIVERED");
                Medication saved = medicationRepository.save(med);

                auditService.record("MEDICATION_STOCK_RECEIVED", "Medication", medId.toString(),
                                "Received " + quantity + " units of " + saved.getName() + ". New balance: "
                                                + saved.getStockQuantity(),
                                null, "DELIVERED");

                return saved;
        }

        // ==========================================
        // MEDICATION RECONCILIATION
        // ==========================================
        @Transactional
        public MedicationReconciliation createReconciliation(MedicationReconciliation rec) {
                rec.setTenantId(TenantContext.getTenantId());
                MedicationReconciliation saved = reconciliationRepository.save(rec);

                auditService.record("MEDICATION_RECONCILIATION_COMPLETED", "MedicationReconciliation",
                                saved.getId().toString(),
                                "Completed medication reconciliation from: " + saved.getSource() + " by "
                                                + saved.getReconciledBy(),
                                null, saved.getStatus());

                return saved;
        }

        @Transactional(readOnly = true)
        public List<MedicationReconciliation> getReconciliations(Long clientId) {
                return reconciliationRepository.findByTenantIdAndClientIdOrderByReconciliationDateDesc(
                                TenantContext.getTenantId(), clientId);
        }

        @Transactional(readOnly = true)
        public List<MedicationAdministration> getAdministrationHistory(Long clientId) {
                return administrationRepository.findByTenantIdAndClientIdOrderByAdministrationTimeDesc(
                                TenantContext.getTenantId(), clientId);
        }

        @Transactional(readOnly = true)
        public List<MedicationAdministration> getTodayExceptions() {
                return administrationRepository.findByTenantIdAndExceptionTrueOrderByAdministrationTimeDesc(
                                TenantContext.getTenantId());
        }

        @Transactional(readOnly = true)
        public List<MedicationAdministration> getTodayAdministrations() {
                LocalDateTime start = LocalDate.now().atStartOfDay();
                LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
                return administrationRepository.findByTenantIdAndAdministrationTimeBetweenOrderByAdministrationTimeDesc(
                                TenantContext.getTenantId(), start, end);
        }

        @Transactional(readOnly = true)
        public java.util.Map<String, Object> getMonthlyMarGrid(Long clientId, Integer year, Integer month) {
                String tenantId = TenantContext.getTenantId();
                LocalDate now = LocalDate.now();
                int targetYear = year != null ? year : now.getYear();
                int targetMonth = month != null ? month : now.getMonthValue();
                LocalDate monthStart = LocalDate.of(targetYear, targetMonth, 1);
                int daysInMonth = monthStart.lengthOfMonth();
                LocalDateTime rangeStart = monthStart.atStartOfDay();
                LocalDateTime rangeEnd = monthStart.withDayOfMonth(daysInMonth).atTime(LocalTime.MAX);

                List<Medication> clientMeds = medicationRepository.findByTenantIdAndClientIdAndActiveTrue(tenantId, clientId);
                List<MedicationAdministration> monthAdmins = administrationRepository
                                .findByTenantIdAndClientIdOrderByAdministrationTimeDesc(tenantId, clientId)
                                .stream()
                                .filter(a -> a.getAdministrationTime().isAfter(rangeStart) && a.getAdministrationTime().isBefore(rangeEnd))
                                .toList();

                java.util.List<java.util.Map<String, Object>> medRows = new java.util.ArrayList<>();
                for (Medication med : clientMeds) {
                        java.util.Map<String, Object> row = new java.util.HashMap<>();
                        row.put("medicationId", med.getId());
                        row.put("name", med.getName());
                        row.put("dose", med.getDose());
                        row.put("strength", med.getStrength());
                        row.put("route", med.getRoute());
                        row.put("frequency", med.getFrequency());
                        row.put("scheduleType", med.getScheduleType());
                        row.put("controlledDrug", med.isControlledDrug());

                        java.util.Map<Integer, java.util.List<java.util.Map<String, Object>>> dayCells = new java.util.HashMap<>();
                        for (int day = 1; day <= daysInMonth; day++) {
                                int finalDay = day;
                                java.util.List<MedicationAdministration> dayAdmins = monthAdmins.stream()
                                                .filter(a -> a.getMedicationId().equals(med.getId()) && a.getAdministrationTime().getDayOfMonth() == finalDay)
                                                .toList();

                                java.util.List<java.util.Map<String, Object>> cells = new java.util.ArrayList<>();
                                for (MedicationAdministration a : dayAdmins) {
                                        java.util.Map<String, Object> c = new java.util.HashMap<>();
                                        c.put("outcome", a.getOutcome().name());
                                        c.put("code", "ADMINISTERED".equals(a.getOutcome().name()) ? "A" :
                                                        "REFUSED".equals(a.getOutcome().name()) ? "R" :
                                                        "MISSED".equals(a.getOutcome().name()) ? "M" : "W");
                                        c.put("slot", a.getScheduledSlot());
                                        c.put("time", a.getAdministrationTime().toLocalTime().toString().substring(0, 5));
                                        c.put("worker", a.getWorkerName());
                                        c.put("reason", a.getOutcomeReason());
                                        cells.add(c);
                                }
                                dayCells.put(day, cells);
                        }
                        row.put("days", dayCells);
                        medRows.add(row);
                }

                java.util.Map<String, Object> result = new java.util.HashMap<>();
                result.put("clientId", clientId);
                result.put("year", targetYear);
                result.put("month", targetMonth);
                result.put("daysInMonth", daysInMonth);
                result.put("legend", java.util.Map.of(
                                "A", "Administered per prescription",
                                "R", "Refused by client",
                                "M", "Missed dose",
                                "W", "Withheld for clinical reasons",
                                "H", "Hospitalized"
                ));
                result.put("medications", medRows);
                return result;
        }
}
