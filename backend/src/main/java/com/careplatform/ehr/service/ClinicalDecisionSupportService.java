package com.careplatform.ehr.service;

import com.careplatform.client.model.Client;
import com.careplatform.client.repository.ClientRepository;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.ehr.dto.CdsAlert;
import com.careplatform.ehr.dto.CdsEvaluationRequest;
import com.careplatform.ehr.model.PatientAllergy;
import com.careplatform.ehr.model.PatientImmunization;
import com.careplatform.ehr.model.PatientMedication;
import com.careplatform.ehr.model.PatientProblem;
import com.careplatform.ehr.repository.PatientAllergyRepository;
import com.careplatform.ehr.repository.PatientImmunizationRepository;
import com.careplatform.ehr.repository.PatientMedicationRepository;
import com.careplatform.ehr.repository.PatientProblemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClinicalDecisionSupportService {

    private final PatientAllergyRepository allergyRepository;
    private final PatientMedicationRepository medicationRepository;
    private final PatientProblemRepository problemRepository;
    private final PatientImmunizationRepository immunizationRepository;
    private final ClientRepository clientRepository;

    private static final Set<String> PENICILLIN_DRUGS = Set.of(
            "penicillin", "amoxicillin", "ampicillin", "augmentin", "piperacillin",
            "co-amoxiclav", "flucloxacillin", "piperacillin-tazobactam"
    );

    private static final Set<String> NSAID_DRUGS = Set.of(
            "aspirin", "ibuprofen", "naproxen", "diclofenac", "indomethacin",
            "celecoxib", "meloxicam", "ketorolac"
    );

    public List<CdsAlert> evaluatePatient(CdsEvaluationRequest request) {
        String tenantId = TenantContext.getTenantId();
        List<CdsAlert> alerts = new ArrayList<>();
        Long clientId = request.getClientId();

        if (clientId == null) {
            return alerts;
        }

        Client client = clientRepository.findById(clientId).orElse(null);
        List<PatientAllergy> allergies = allergyRepository.findByTenantIdAndClientId(tenantId, clientId);
        List<PatientMedication> activeMeds = medicationRepository.findByTenantIdAndClientId(tenantId, clientId);
        List<PatientProblem> problems = problemRepository.findByTenantIdAndClientId(tenantId, clientId);
        List<PatientImmunization> immunizations = immunizationRepository.findByTenantIdAndClientIdOrderByAdministrationDateDesc(tenantId, clientId);

        // 1. DRUG-ALLERGY INTERACTION CHECKING
        String proposedMed = request.getProposedMedicationName();
        if (proposedMed != null && !proposedMed.isBlank()) {
            String lowerProposed = proposedMed.toLowerCase().trim();
            for (PatientAllergy allergy : allergies) {
                if (allergy.getVerificationStatus() == PatientAllergy.VerificationStatus.REFUTED) {
                    continue;
                }
                String lowerAllergen = allergy.getAllergenName().toLowerCase().trim();

                boolean isDirectMatch = lowerProposed.contains(lowerAllergen) || lowerAllergen.contains(lowerProposed);
                boolean isPenicillinCross = (lowerAllergen.contains("penicillin") || lowerAllergen.contains("amoxicillin"))
                        && PENICILLIN_DRUGS.stream().anyMatch(lowerProposed::contains);
                boolean isNsaidCross = (lowerAllergen.contains("aspirin") || lowerAllergen.contains("nsaid"))
                        && NSAID_DRUGS.stream().anyMatch(lowerProposed::contains);

                if (isDirectMatch || isPenicillinCross || isNsaidCross) {
                    alerts.add(CdsAlert.builder()
                            .id("BPA-ALLERGY-" + System.currentTimeMillis() % 10000)
                            .severity("CRITICAL")
                            .title("CRITICAL: Drug-Allergy Contraindication Detected")
                            .description("Patient has documented allergy to '" + allergy.getAllergenName() +
                                    "' with reaction: " + (allergy.getReaction() != null ? allergy.getReaction() : "Hypersensitivity") +
                                    ". Prescribing '" + proposedMed + "' is strictly contraindicated.")
                            .recommendation("Select a non-cross-reactive pharmacological class or consult Clinical Pharmacology before overriding.")
                            .ruleCategory("DRUG_ALLERGY")
                            .canOverride(true)
                            .build());
                }
            }
        }

        // 2. DRUG-DRUG INTERACTION CHECKING
        boolean hasAnticoagulant = activeMeds.stream()
                .anyMatch(m -> m.getMedicationName().toLowerCase().contains("warfarin") ||
                        m.getMedicationName().toLowerCase().contains("apixaban") ||
                        m.getMedicationName().toLowerCase().contains("rivaroxaban") ||
                        m.getMedicationName().toLowerCase().contains("dabigatran"));

        boolean hasAntiplateletOrNsaid = activeMeds.stream()
                .anyMatch(m -> NSAID_DRUGS.stream().anyMatch(n -> m.getMedicationName().toLowerCase().contains(n)));

        if (proposedMed != null) {
            String lowerProposed = proposedMed.toLowerCase();
            if (hasAnticoagulant && NSAID_DRUGS.stream().anyMatch(lowerProposed::contains)) {
                alerts.add(CdsAlert.builder()
                        .id("BPA-DDI-BLEED")
                        .severity("WARNING")
                        .title("WARNING: Major Drug-Drug Interaction - Bleeding Risk")
                        .description("Combining '" + proposedMed + "' with existing Anticoagulant therapy significantly elevates major gastrointestinal and systemic bleeding risks.")
                        .recommendation("Co-prescribe gastroprotection (PPI e.g. Omeprazole) or switch to Paracetamol for analgesia.")
                        .ruleCategory("DRUG_DRUG")
                        .canOverride(true)
                        .build());
            }
        } else if (hasAnticoagulant && hasAntiplateletOrNsaid) {
            alerts.add(CdsAlert.builder()
                    .id("BPA-DDI-BLEED-EXISTING")
                    .severity("WARNING")
                    .title("WARNING: Concurrent Anticoagulant + NSAID / Antiplatelet")
                    .description("Patient is currently prescribed both an oral anticoagulant and an antiplatelet/NSAID agent.")
                    .recommendation("Ensure gastroprotection is co-prescribed and regularly monitor full blood count (Hb/Hct).")
                    .ruleCategory("DRUG_DRUG")
                    .canOverride(true)
                    .build());
        }

        // ACE-Inhibitor + Potassium-Sparing Diuretic Check
        boolean hasAcei = activeMeds.stream().anyMatch(m ->
                m.getMedicationName().toLowerCase().contains("ramipril") ||
                m.getMedicationName().toLowerCase().contains("lisinopril") ||
                m.getMedicationName().toLowerCase().contains("enalapril"));
        boolean hasKDiuretic = activeMeds.stream().anyMatch(m ->
                m.getMedicationName().toLowerCase().contains("spironolactone") ||
                m.getMedicationName().toLowerCase().contains("eplerenone") ||
                m.getMedicationName().toLowerCase().contains("amiloride"));

        if (hasAcei && hasKDiuretic) {
            alerts.add(CdsAlert.builder()
                    .id("BPA-DDI-HYPERK")
                    .severity("WARNING")
                    .title("WARNING: Risk of Severe Hyperkalemia")
                    .description("Concomitant ACE inhibitor and Potassium-sparing diuretic therapy can cause life-threatening hyperkalemia.")
                    .recommendation("Monitor serum potassium and renal function (eGFR/Creatinine) within 7-14 days of initiation.")
                    .ruleCategory("DRUG_DRUG")
                    .canOverride(true)
                    .build());
        }

        // 3. NATIONAL EARLY WARNING SCORE (NEWS2) EVALUATION
        if (request.getSystolicBp() != null && request.getHeartRate() != null) {
            int news2Score = calculateNews2(request);
            if (news2Score >= 5) {
                alerts.add(CdsAlert.builder()
                        .id("BPA-NEWS2-HIGH")
                        .severity("CRITICAL")
                        .title("CRITICAL: National Early Warning Score (NEWS2) = " + news2Score + " (High Clinical Deterioration Risk)")
                        .description("Patient vitals trigger a High Early Warning Score. Increased risk of acute deterioration or sepsis.")
                        .recommendation("Immediate bedside clinical review required by attending physician / medical registrar within 30 minutes. Consider continuous monitoring.")
                        .ruleCategory("EARLY_WARNING_SCORE")
                        .canOverride(false)
                        .build());
            } else if (news2Score >= 3) {
                alerts.add(CdsAlert.builder()
                        .id("BPA-NEWS2-MED")
                        .severity("WARNING")
                        .title("WARNING: NEWS2 Score = " + news2Score + " (Medium Deterioration Alert)")
                        .description("Vital sign deviation indicates clinical monitoring escalation.")
                        .recommendation("Escalate observation frequency to minimum 2-hourly. Inform charge nurse and duty medical team.")
                        .ruleCategory("EARLY_WARNING_SCORE")
                        .canOverride(true)
                        .build());
            }
        }

        // 4. PREVENTIVE CARE & IMMUNIZATION CARE GAPS
        if (client != null && client.getDateOfBirth() != null) {
            int age = Period.between(client.getDateOfBirth(), LocalDate.now()).getYears();
            if (age >= 65) {
                boolean hasPneumo = immunizations.stream()
                        .anyMatch(i -> i.getVaccineName().toLowerCase().contains("pneumo") ||
                                i.getVaccineName().toLowerCase().contains("pcv"));
                if (!hasPneumo) {
                    alerts.add(CdsAlert.builder()
                            .id("BPA-PREV-PNEUMO")
                            .severity("INFO")
                            .title("Preventive Care Gap: Pneumococcal Conjugate Vaccine (PCV20) Due")
                            .description("Patient is aged " + age + " (>= 65) with no recorded Pneumococcal vaccination.")
                            .recommendation("Offer Pneumococcal immunization during current encounter to protect against invasive pneumococcal disease.")
                            .ruleCategory("PREVENTIVE_GAP")
                            .canOverride(true)
                            .build());
                }
            }

            int currentYear = LocalDate.now().getYear();
            boolean hasFluThisYear = immunizations.stream()
                    .anyMatch(i -> i.getVaccineName().toLowerCase().contains("influenza") &&
                            i.getAdministrationDate().getYear() == currentYear);
            if (!hasFluThisYear) {
                alerts.add(CdsAlert.builder()
                        .id("BPA-PREV-FLU")
                        .severity("INFO")
                        .title("Preventive Care Gap: Annual Seasonal Influenza Vaccine Due")
                        .description("No record of Influenza vaccination for the " + currentYear + " seasonal cycle.")
                        .recommendation("Administer 1 dose of seasonal quadrivalent influenza vaccine.")
                        .ruleCategory("PREVENTIVE_GAP")
                        .canOverride(true)
                        .build());
            }
        }

        // Diabetes Screening Gap
        boolean hasDiabetes = problems.stream().anyMatch(p ->
                p.getProblemName().toLowerCase().contains("diabetes") ||
                (p.getIcdCode() != null && p.getIcdCode().toUpperCase().startsWith("E11")));
        if (hasDiabetes) {
            alerts.add(CdsAlert.builder()
                    .id("BPA-PREV-DIABETES")
                    .severity("INFO")
                    .title("Chronic Disease Management: HbA1c & Diabetic Screening Reminder")
                    .description("Active Type 2 Diabetes Mellitus diagnosis requires regular glycemic control monitoring.")
                    .recommendation("Ensure HbA1c, spot urine ACR (albumin-creatinine ratio), and diabetic foot examination are scheduled within 3 months.")
                    .ruleCategory("PREVENTIVE_GAP")
                    .canOverride(true)
                    .build());
        }

        return alerts;
    }

    private int calculateNews2(CdsEvaluationRequest r) {
        int score = 0;

        // Respiration Rate
        if (r.getRespiratoryRate() != null) {
            int rr = r.getRespiratoryRate();
            if (rr <= 8) score += 3;
            else if (rr <= 11) score += 1;
            else if (rr <= 20) score += 0;
            else if (rr <= 24) score += 2;
            else score += 3;
        }

        // SpO2
        if (r.getOxygenSaturation() != null) {
            int spo2 = r.getOxygenSaturation();
            if (spo2 <= 91) score += 3;
            else if (spo2 <= 93) score += 2;
            else if (spo2 <= 95) score += 1;
        }

        // Supplemental O2
        if (Boolean.TRUE.equals(r.getSupplementalOxygen())) {
            score += 2;
        }

        // Systolic BP
        if (r.getSystolicBp() != null) {
            int sbp = r.getSystolicBp();
            if (sbp <= 90) score += 3;
            else if (sbp <= 100) score += 2;
            else if (sbp <= 110) score += 1;
            else if (sbp >= 220) score += 3;
        }

        // Heart Rate
        if (r.getHeartRate() != null) {
            int hr = r.getHeartRate();
            if (hr <= 40) score += 3;
            else if (hr <= 50) score += 1;
            else if (hr <= 90) score += 0;
            else if (hr <= 110) score += 1;
            else if (hr <= 130) score += 2;
            else score += 3;
        }

        // Consciousness Alert
        if (Boolean.TRUE.equals(r.getConsciousnessAlert())) {
            score += 3; // Any alteration from Alert (Voice, Pain, Unresponsive)
        }

        // Temperature
        if (r.getTemperature() != null) {
            double temp = r.getTemperature();
            if (temp <= 35.0) score += 3;
            else if (temp <= 36.0) score += 1;
            else if (temp <= 38.0) score += 0;
            else if (temp <= 39.0) score += 1;
            else score += 2;
        }

        return score;
    }
}

