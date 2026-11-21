package com.careplatform.ehr.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.client.model.CareTimelineEvent;
import com.careplatform.client.model.Client;
import com.careplatform.client.repository.CareTimelineEventRepository;
import com.careplatform.client.repository.ClientRepository;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.ehr.dto.CdsAlert;
import com.careplatform.ehr.dto.CdsEvaluationRequest;
import com.careplatform.ehr.dto.LongitudinalPatientRecord;
import com.careplatform.ehr.model.*;
import com.careplatform.ehr.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EhrService {

    private final PatientAllergyRepository allergyRepository;
    private final PatientProblemRepository problemRepository;
    private final PatientMedicationRepository medicationRepository;
    private final PatientImmunizationRepository immunizationRepository;
    private final PatientProcedureRepository procedureRepository;
    private final PastMedicalHistoryRepository pmhRepository;
    private final FamilyHistoryRepository familyHistoryRepository;
    private final SocialHistoryRepository socialHistoryRepository;
    private final ClinicalNoteRepository clinicalNoteRepository;
    private final ClinicalDocumentRepository clinicalDocumentRepository;
    private final ClientRepository clientRepository;
    private final CareTimelineEventRepository timelineRepository;
    private final ClinicalDecisionSupportService cdsService;
    private final AuditService auditService;

    // ==========================================
    // 1. LONGITUDINAL PATIENT RECORD (360° EHR)
    // ==========================================
    @Transactional(readOnly = true)
    public LongitudinalPatientRecord getLongitudinalRecord(Long clientId) {
        String tenantId = TenantContext.getTenantId();
        Client client = clientRepository.findById(clientId)
                .filter(c -> c.getTenantId().equals(tenantId))
                .orElseThrow(() -> new CarePlatformException("Patient record not found: " + clientId));

        List<PatientAllergy> allergies = allergyRepository.findByTenantIdAndClientId(tenantId, clientId);
        List<PatientProblem> problems = problemRepository.findByTenantIdAndClientId(tenantId, clientId);
        List<PatientMedication> medications = medicationRepository.findByTenantIdAndClientId(tenantId, clientId);
        List<PatientImmunization> immunizations = immunizationRepository.findByTenantIdAndClientIdOrderByAdministrationDateDesc(tenantId, clientId);
        List<PatientProcedure> procedures = procedureRepository.findByTenantIdAndClientIdOrderByProcedureDateDesc(tenantId, clientId);
        List<PastMedicalHistory> pmh = pmhRepository.findByTenantIdAndClientId(tenantId, clientId);
        List<FamilyHistory> familyHistory = familyHistoryRepository.findByTenantIdAndClientId(tenantId, clientId);
        SocialHistory socialHistory = socialHistoryRepository.findByTenantIdAndClientId(tenantId, clientId).orElse(null);
        List<ClinicalNote> clinicalNotes = clinicalNoteRepository.findByTenantIdAndClientIdOrderBySignedAtDesc(tenantId, clientId);
        List<ClinicalDocument> clinicalDocuments = clinicalDocumentRepository.findByTenantIdAndClientIdOrderByDocumentDateDesc(tenantId, clientId);
        List<CareTimelineEvent> timelineEvents = timelineRepository.findByTenantIdAndClientIdOrderByEventTimestampDesc(tenantId, clientId);

        // Run CDS active rule evaluation
        List<CdsAlert> activeBpas = cdsService.evaluatePatient(CdsEvaluationRequest.builder()
                .clientId(clientId)
                .build());

        return LongitudinalPatientRecord.builder()
                .client(client)
                .allergies(allergies)
                .problems(problems)
                .medications(medications)
                .immunizations(immunizations)
                .procedures(procedures)
                .pastMedicalHistory(pmh)
                .familyHistory(familyHistory)
                .socialHistory(socialHistory)
                .clinicalNotes(clinicalNotes)
                .clinicalDocuments(clinicalDocuments)
                .activeBpaAlerts(activeBpas)
                .timelineEvents(timelineEvents)
                .build();
    }

    // ==========================================
    // 2. ALLERGIES
    // ==========================================
    public List<PatientAllergy> getAllergies(Long clientId) {
        return allergyRepository.findByTenantIdAndClientId(TenantContext.getTenantId(), clientId);
    }

    @Transactional
    public PatientAllergy addAllergy(PatientAllergy allergy) {
        allergy.setTenantId(TenantContext.getTenantId());
        PatientAllergy saved = allergyRepository.save(allergy);
        auditService.record("EHR_ALLERGY_RECORDED", "PatientAllergy", saved.getId().toString(),
                "Documented allergy: " + saved.getAllergenName() + " (" + saved.getSeverity() + ")",
                null, saved.getSeverity().name());
        return saved;
    }

    @Transactional
    public void deleteAllergy(Long id) {
        allergyRepository.deleteById(id);
    }

    // ==========================================
    // 3. PROBLEMS / DIAGNOSES
    // ==========================================
    public List<PatientProblem> getProblems(Long clientId) {
        return problemRepository.findByTenantIdAndClientId(TenantContext.getTenantId(), clientId);
    }

    @Transactional
    public PatientProblem addProblem(PatientProblem problem) {
        problem.setTenantId(TenantContext.getTenantId());
        PatientProblem saved = problemRepository.save(problem);
        auditService.record("EHR_PROBLEM_RECORDED", "PatientProblem", saved.getId().toString(),
                "Added problem: " + saved.getProblemName() + " [" + saved.getIcdCode() + "]",
                null, saved.getStatus().name());
        return saved;
    }

    @Transactional
    public PatientProblem updateProblem(Long id, PatientProblem updated) {
        PatientProblem existing = problemRepository.findById(id)
                .filter(p -> p.getTenantId().equals(TenantContext.getTenantId()))
                .orElseThrow(() -> new CarePlatformException("Problem not found: " + id));

        existing.setStatus(updated.getStatus());
        existing.setPriority(updated.getPriority());
        existing.setResolvedDate(updated.getResolvedDate());
        existing.setClinicalNotes(updated.getClinicalNotes());

        return problemRepository.save(existing);
    }

    @Transactional
    public void deleteProblem(Long id) {
        problemRepository.deleteById(id);
    }

    // ==========================================
    // 4. MEDICATIONS & MED REC
    // ==========================================
    public List<PatientMedication> getMedications(Long clientId) {
        return medicationRepository.findByTenantIdAndClientId(TenantContext.getTenantId(), clientId);
    }

    @Transactional
    public PatientMedication addMedication(PatientMedication medication) {
        medication.setTenantId(TenantContext.getTenantId());
        PatientMedication saved = medicationRepository.save(medication);
        auditService.record("EHR_MEDICATION_RECORDED", "PatientMedication", saved.getId().toString(),
                "Added medication: " + saved.getMedicationName() + " " + saved.getDose() + " (" + saved.getFrequency() + ")",
                null, saved.getReconciliationStatus().name());
        return saved;
    }

    @Transactional
    public PatientMedication updateMedication(Long id, PatientMedication updated) {
        PatientMedication existing = medicationRepository.findById(id)
                .filter(m -> m.getTenantId().equals(TenantContext.getTenantId()))
                .orElseThrow(() -> new CarePlatformException("Medication not found: " + id));

        existing.setReconciliationStatus(updated.getReconciliationStatus());
        existing.setEndDate(updated.getEndDate());
        existing.setInstructions(updated.getInstructions());

        return medicationRepository.save(existing);
    }

    // ==========================================
    // 5. IMMUNIZATIONS
    // ==========================================
    public List<PatientImmunization> getImmunizations(Long clientId) {
        return immunizationRepository.findByTenantIdAndClientIdOrderByAdministrationDateDesc(TenantContext.getTenantId(), clientId);
    }

    @Transactional
    public PatientImmunization addImmunization(PatientImmunization immunization) {
        immunization.setTenantId(TenantContext.getTenantId());
        PatientImmunization saved = immunizationRepository.save(immunization);
        auditService.record("EHR_IMMUNIZATION_RECORDED", "PatientImmunization", saved.getId().toString(),
                "Administered vaccine: " + saved.getVaccineName() + " Lot: " + saved.getLotNumber(),
                null, saved.getStatus().name());
        return saved;
    }

    // ==========================================
    // 6. PROCEDURES
    // ==========================================
    public List<PatientProcedure> getProcedures(Long clientId) {
        return procedureRepository.findByTenantIdAndClientIdOrderByProcedureDateDesc(TenantContext.getTenantId(), clientId);
    }

    @Transactional
    public PatientProcedure addProcedure(PatientProcedure procedure) {
        procedure.setTenantId(TenantContext.getTenantId());
        PatientProcedure saved = procedureRepository.save(procedure);
        auditService.record("EHR_PROCEDURE_RECORDED", "PatientProcedure", saved.getId().toString(),
                "Recorded procedure: " + saved.getProcedureName() + " by " + saved.getLeadSurgeon(),
                null, saved.getCategory().name());
        return saved;
    }

    // ==========================================
    // 7. MEDICAL / FAMILY / SOCIAL HISTORIES
    // ==========================================
    public List<PastMedicalHistory> getPastMedicalHistory(Long clientId) {
        return pmhRepository.findByTenantIdAndClientId(TenantContext.getTenantId(), clientId);
    }

    @Transactional
    public PastMedicalHistory addPastMedicalHistory(PastMedicalHistory pmh) {
        pmh.setTenantId(TenantContext.getTenantId());
        return pmhRepository.save(pmh);
    }

    public List<FamilyHistory> getFamilyHistory(Long clientId) {
        return familyHistoryRepository.findByTenantIdAndClientId(TenantContext.getTenantId(), clientId);
    }

    @Transactional
    public FamilyHistory addFamilyHistory(FamilyHistory fh) {
        fh.setTenantId(TenantContext.getTenantId());
        return familyHistoryRepository.save(fh);
    }

    public SocialHistory getSocialHistory(Long clientId) {
        return socialHistoryRepository.findByTenantIdAndClientId(TenantContext.getTenantId(), clientId).orElse(null);
    }

    @Transactional
    public SocialHistory saveSocialHistory(SocialHistory sh) {
        String tenantId = TenantContext.getTenantId();
        sh.setTenantId(tenantId);
        return socialHistoryRepository.findByTenantIdAndClientId(tenantId, sh.getClientId())
                .map(existing -> {
                    existing.setTobaccoStatus(sh.getTobaccoStatus());
                    existing.setPacksPerDay(sh.getPacksPerDay());
                    existing.setSmokingYears(sh.getSmokingYears());
                    existing.setAlcoholUse(sh.getAlcoholUse());
                    existing.setAlcoholUnitsPerWeek(sh.getAlcoholUnitsPerWeek());
                    existing.setPhysicalActivity(sh.getPhysicalActivity());
                    existing.setOccupation(sh.getOccupation());
                    existing.setLivingSituation(sh.getLivingSituation());
                    existing.setNotes(sh.getNotes());
                    return socialHistoryRepository.save(existing);
                })
                .orElseGet(() -> socialHistoryRepository.save(sh));
    }

    // ==========================================
    // 8. CLINICAL NOTES (SOAP DOCUMENTATION)
    // ==========================================
    public List<ClinicalNote> getClinicalNotes(Long clientId) {
        return clinicalNoteRepository.findByTenantIdAndClientIdOrderBySignedAtDesc(TenantContext.getTenantId(), clientId);
    }

    @Transactional
    public ClinicalNote createClinicalNote(ClinicalNote note) {
        note.setTenantId(TenantContext.getTenantId());
        if (note.getSignedAt() == null && note.getStatus() == ClinicalNote.NoteStatus.FINAL_SIGNED) {
            note.setSignedAt(Instant.now());
        }
        ClinicalNote saved = clinicalNoteRepository.save(note);
        auditService.record("EHR_CLINICAL_NOTE_SIGNED", "ClinicalNote", saved.getId().toString(),
                "Signed " + saved.getNoteType() + ": '" + saved.getTitle() + "' by " + saved.getAuthorName(),
                null, saved.getStatus().name());
        return saved;
    }

    // ==========================================
    // 9. CLINICAL DOCUMENTS & ATTACHMENTS
    // ==========================================
    public List<ClinicalDocument> getClinicalDocuments(Long clientId) {
        return clinicalDocumentRepository.findByTenantIdAndClientIdOrderByDocumentDateDesc(TenantContext.getTenantId(), clientId);
    }

    @Transactional
    public ClinicalDocument addClinicalDocument(ClinicalDocument doc) {
        doc.setTenantId(TenantContext.getTenantId());
        ClinicalDocument saved = clinicalDocumentRepository.save(doc);
        auditService.record("EHR_DOCUMENT_UPLOADED", "ClinicalDocument", saved.getId().toString(),
                "Attached " + saved.getDocumentCategory() + ": '" + saved.getTitle() + "'",
                null, saved.getDocumentCategory().name());
        return saved;
    }
}

