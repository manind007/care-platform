package com.careplatform.pharmacy.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.pharmacy.model.MedicineBatch;
import com.careplatform.pharmacy.model.MedicineMaster;
import com.careplatform.pharmacy.model.PharmacyDispensation;
import com.careplatform.pharmacy.repository.MedicineBatchRepository;
import com.careplatform.pharmacy.repository.MedicineMasterRepository;
import com.careplatform.pharmacy.repository.PharmacyDispensationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PharmacyService {

    private final MedicineMasterRepository medicineRepository;
    private final MedicineBatchRepository batchRepository;
    private final PharmacyDispensationRepository dispensationRepository;
    private final AuditService auditService;

    public List<MedicineMaster> getAllMedicines() {
        return medicineRepository.findByTenantIdOrderByBrandNameAsc(TenantContext.getTenantId());
    }

    public List<MedicineBatch> getAllBatches() {
        return batchRepository.findByTenantIdOrderByExpiryDateAsc(TenantContext.getTenantId());
    }

    public List<PharmacyDispensation> getAllDispensations() {
        return dispensationRepository.findByTenantIdOrderByDispensedAtDesc(TenantContext.getTenantId());
    }

    @Transactional
    public MedicineMaster createMedicine(MedicineMaster medicine) {
        medicine.setTenantId(TenantContext.getTenantId());
        return medicineRepository.save(medicine);
    }

    @Transactional
    public MedicineBatch addBatch(MedicineBatch batch) {
        String tenantId = TenantContext.getTenantId();
        batch.setTenantId(tenantId);
        MedicineBatch saved = batchRepository.save(batch);

        // Update total stock on medicine master
        if (batch.getMedicineId() != null) {
            medicineRepository.findById(batch.getMedicineId()).ifPresent(med -> {
                int current = med.getTotalStock() != null ? med.getTotalStock() : 0;
                med.setTotalStock(current + batch.getQuantity());
                medicineRepository.save(med);
            });
        }

        auditService.record("PHARMACY_BATCH_ADDED", "MedicineBatch", saved.getId().toString(),
                "Added batch " + saved.getBatchNumber() + " for " + saved.getMedicineName() + " (Qty: " + saved.getQuantity() + ")",
                null, "ADDED");
        return saved;
    }

    @Transactional
    public PharmacyDispensation dispenseMedicine(PharmacyDispensation dispensation) {
        String tenantId = TenantContext.getTenantId();
        dispensation.setTenantId(tenantId);
        dispensation.setDispensedAt(LocalDateTime.now());
        if (dispensation.getDispensationCode() == null || dispensation.getDispensationCode().isBlank()) {
            dispensation.setDispensationCode("DISP-" + System.currentTimeMillis() % 1000000);
        }

        // Calculate total amount if not set
        if (dispensation.getTotalAmount() == null && dispensation.getUnitPrice() != null) {
            dispensation.setTotalAmount(dispensation.getUnitPrice().multiply(BigDecimal.valueOf(dispensation.getQuantityDispensed())));
        }

        // Auto-decrement batch quantity and medicine stock
        if (dispensation.getBatchNumber() != null) {
            List<MedicineBatch> batches = batchRepository.findByTenantIdOrderByExpiryDateAsc(tenantId);
            batches.stream()
                    .filter(b -> b.getBatchNumber().equalsIgnoreCase(dispensation.getBatchNumber()))
                    .findFirst()
                    .ifPresent(b -> {
                        int remaining = Math.max(0, b.getQuantity() - dispensation.getQuantityDispensed());
                        b.setQuantity(remaining);
                        batchRepository.save(b);

                        if (b.getMedicineId() != null) {
                            medicineRepository.findById(b.getMedicineId()).ifPresent(med -> {
                                int current = med.getTotalStock() != null ? med.getTotalStock() : 0;
                                med.setTotalStock(Math.max(0, current - dispensation.getQuantityDispensed()));
                                medicineRepository.save(med);
                            });
                        }
                    });
        }

        PharmacyDispensation saved = dispensationRepository.save(dispensation);
        auditService.record("PHARMACY_DISPENSATION_RECORDED", "PharmacyDispensation", saved.getId().toString(),
                "Dispensed " + saved.getQuantityDispensed() + "x " + saved.getMedicineName() + " to " + saved.getPatientName(),
                null, "DISPENSED");
        return saved;
    }

    public List<MedicineBatch> getExpiringBatches(int withinDays) {
        LocalDate cutoff = LocalDate.now().plusDays(withinDays);
        return batchRepository.findByTenantIdAndExpiryDateBefore(TenantContext.getTenantId(), cutoff);
    }
}

