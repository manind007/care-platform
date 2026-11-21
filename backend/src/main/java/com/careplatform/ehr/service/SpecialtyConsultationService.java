package com.careplatform.ehr.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.ehr.model.SpecialtyConsultation;
import com.careplatform.ehr.repository.SpecialtyConsultationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpecialtyConsultationService {

    private final SpecialtyConsultationRepository specialtyRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<SpecialtyConsultation> getAllConsultations() {
        return specialtyRepository.findByTenantIdOrderByConsultationDateTimeDesc(TenantContext.getTenantId());
    }

    @Transactional(readOnly = true)
    public List<SpecialtyConsultation> getConsultationsByUhid(String uhid) {
        return specialtyRepository.findByTenantIdAndUhidOrderByConsultationDateTimeDesc(TenantContext.getTenantId(), uhid);
    }

    @Transactional(readOnly = true)
    public List<SpecialtyConsultation> getConsultationsBySpecialty(String specialtyCode) {
        return specialtyRepository.findByTenantIdAndSpecialtyCodeOrderByConsultationDateTimeDesc(TenantContext.getTenantId(), specialtyCode);
    }

    @Transactional
    public SpecialtyConsultation recordConsultation(SpecialtyConsultation consultation) {
        String tenantId = TenantContext.getTenantId();
        consultation.setTenantId(tenantId);
        if (consultation.getConsultationDateTime() == null) {
            consultation.setConsultationDateTime(LocalDateTime.now());
        }
        SpecialtyConsultation saved = specialtyRepository.save(consultation);
        auditService.record("SPECIALTY_CONSULTATION_RECORDED", "SpecialtyConsultation", saved.getId().toString(),
                "Recorded " + saved.getDepartment() + " consultation for " + saved.getPatientName() + " (Diagnosis: " + saved.getClinicalDiagnosis() + ") by " + saved.getConsultantName(),
                null, "COMPLETED");
        return saved;
    }

    public Map<String, Object> getSpecialtyTemplates() {
        Map<String, Object> templates = new HashMap<>();

        templates.put("CARDIOLOGY", Map.of(
                "department", "Cardiology",
                "fields", List.of(
                        Map.of("id", "nyhaClass", "label", "NYHA Functional Class", "type", "SELECT", "options", List.of("CLASS_I", "CLASS_II", "CLASS_III", "CLASS_IV")),
                        Map.of("id", "lvefPercentage", "label", "Left Ventricular Ejection Fraction (LVEF %)", "type", "NUMBER", "unit", "%"),
                        Map.of("id", "ecgRhythm", "label", "ECG Rhythm", "type", "TEXT", "placeholder", "e.g. Normal Sinus, Atrial Fibrillation, Left Bundle Branch Block"),
                        Map.of("id", "cathLabUrgency", "label", "Cath Lab / Angiography Urgency", "type", "SELECT", "options", List.of("NONE", "ELECTIVE", "URGENT_24H", "EMERGENCY_IMMEDIATE"))
                )
        ));

        templates.put("PEDIATRICS", Map.of(
                "department", "Pediatrics & Child Health",
                "fields", List.of(
                        Map.of("id", "weightKg", "label", "Weight (kg)", "type", "NUMBER", "unit", "kg"),
                        Map.of("id", "heightCm", "label", "Height / Length (cm)", "type", "NUMBER", "unit", "cm"),
                        Map.of("id", "headCircumferenceCm", "label", "Head Circumference (cm)", "type", "NUMBER", "unit", "cm"),
                        Map.of("id", "growthPercentile", "label", "WHO Growth Percentile", "type", "SELECT", "options", List.of("BELOW_3RD", "15TH_PERCENTILE", "50TH_MEDIAN", "85TH_PERCENTILE", "ABOVE_97TH")),
                        Map.of("id", "developmentalMilestones", "label", "Developmental Milestones", "type", "SELECT", "options", List.of("APPROPRIATE_FOR_AGE", "MILD_DELAY", "SIGNIFICANT_DELAY"))
                )
        ));

        templates.put("OBGYN", Map.of(
                "department", "Obstetrics & Gynecology (Antenatal)",
                "fields", List.of(
                        Map.of("id", "gravidaPara", "label", "Obstetric Formula (G P A L)", "type", "TEXT", "placeholder", "e.g. G2 P1 A0 L1"),
                        Map.of("id", "gestationalAgeWeeks", "label", "Gestational Age (weeks)", "type", "NUMBER", "unit", "weeks"),
                        Map.of("id", "fetalHeartRateBpm", "label", "Fetal Heart Rate (bpm)", "type", "NUMBER", "unit", "bpm"),
                        Map.of("id", "fetalPresentation", "label", "Fetal Presentation", "type", "SELECT", "options", List.of("CEPHALIC_VERTEX", "BREECH", "TRANSVERSE_LIE", "UNSTABLE"))
                )
        ));

        templates.put("ONCOLOGY", Map.of(
                "department", "Medical Oncology",
                "fields", List.of(
                        Map.of("id", "primaryTumorSite", "label", "Primary Malignancy Site", "type", "TEXT", "placeholder", "e.g. Left Breast Upper Outer Quadrant"),
                        Map.of("id", "tnmStaging", "label", "TNM Staging", "type", "TEXT", "placeholder", "e.g. T2 N1 M0"),
                        Map.of("id", "cancerStage", "label", "Clinical Stage", "type", "SELECT", "options", List.of("STAGE_0_IN_SITU", "STAGE_I", "STAGE_II", "STAGE_III", "STAGE_IV_METASTATIC")),
                        Map.of("id", "ecogPerformanceStatus", "label", "ECOG Performance Status", "type", "SELECT", "options", List.of("0_FULLY_ACTIVE", "1_RESTRICTED_STRENUOUS", "2_CAPABLE_SELFCARE", "3_LIMITED_SELFCARE", "4_COMPLETELY_DISABLED")),
                        Map.of("id", "chemotherapyCycle", "label", "Chemo Protocol & Cycle #", "type", "TEXT", "placeholder", "e.g. AC-T Regimen, Cycle 3 of 6")
                )
        ));

        return templates;
    }
}

