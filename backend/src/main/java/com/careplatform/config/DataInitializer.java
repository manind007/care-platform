package com.careplatform.config;

import com.careplatform.assessment.model.AssessmentQuestion;
import com.careplatform.assessment.model.AssessmentSubmission;
import com.careplatform.assessment.model.AssessmentTemplate;
import com.careplatform.assessment.repository.AssessmentSubmissionRepository;
import com.careplatform.assessment.repository.AssessmentTemplateRepository;
import com.careplatform.audit.service.AuditService;
import com.careplatform.careplan.model.CareGoal;
import com.careplatform.careplan.model.CarePlan;
import com.careplatform.careplan.model.CarePlanStatus;
import com.careplatform.careplan.model.CareTask;
import com.careplatform.careplan.repository.CarePlanRepository;
import com.careplatform.client.model.CareTimelineEvent;
import com.careplatform.client.model.Client;
import com.careplatform.client.model.EmergencyContact;
import com.careplatform.client.repository.CareTimelineEventRepository;
import com.careplatform.client.repository.ClientRepository;
import com.careplatform.common.security.Role;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.finance.model.Invoice;
import com.careplatform.finance.model.InvoiceLine;
import com.careplatform.finance.model.InvoiceStatus;
import com.careplatform.finance.model.Payment;
import com.careplatform.finance.repository.InvoiceRepository;
import com.careplatform.finance.repository.PaymentRepository;
import com.careplatform.incident.model.Incident;
import com.careplatform.incident.model.IncidentSeverity;
import com.careplatform.incident.model.IncidentStatus;
import com.careplatform.incident.repository.IncidentRepository;
import com.careplatform.medication.model.AdministrationOutcome;
import com.careplatform.medication.model.Medication;
import com.careplatform.medication.model.MedicationAdministration;
import com.careplatform.medication.model.MedicationReconciliation;
import com.careplatform.medication.repository.MedicationAdministrationRepository;
import com.careplatform.medication.repository.MedicationReconciliationRepository;
import com.careplatform.medication.repository.MedicationRepository;
import com.careplatform.messaging.model.Message;
import com.careplatform.messaging.repository.MessageRepository;
import com.careplatform.risk.model.Risk;
import com.careplatform.risk.repository.RiskRepository;
import com.careplatform.tenant.model.Branch;
import com.careplatform.tenant.model.Organisation;
import com.careplatform.tenant.model.Tenant;
import com.careplatform.tenant.repository.BranchRepository;
import com.careplatform.tenant.repository.OrganisationRepository;
import com.careplatform.tenant.repository.TenantRepository;
import com.careplatform.user.model.User;
import com.careplatform.user.repository.UserRepository;
import com.careplatform.visit.model.Visit;
import com.careplatform.visit.model.VisitStatus;
import com.careplatform.visit.repository.VisitRepository;
import com.careplatform.opd.model.OpdAppointment;
import com.careplatform.opd.repository.OpdAppointmentRepository;
import com.careplatform.ipd.model.Ward;
import com.careplatform.ipd.model.Bed;
import com.careplatform.ipd.model.IpdAdmission;
import com.careplatform.ipd.repository.WardRepository;
import com.careplatform.ipd.repository.BedRepository;
import com.careplatform.ipd.repository.IpdAdmissionRepository;
import com.careplatform.diagnostics.model.DiagnosticOrder;
import com.careplatform.diagnostics.repository.DiagnosticOrderRepository;
import com.careplatform.pharmacy.model.MedicineMaster;
import com.careplatform.pharmacy.model.MedicineBatch;
import com.careplatform.pharmacy.model.PharmacyDispensation;
import com.careplatform.pharmacy.repository.MedicineMasterRepository;
import com.careplatform.pharmacy.repository.MedicineBatchRepository;
import com.careplatform.pharmacy.repository.PharmacyDispensationRepository;
import com.careplatform.hospital.model.OperationTheatreBooking;
import com.careplatform.hospital.model.BloodBankUnit;
import com.careplatform.hospital.repository.OperationTheatreBookingRepository;
import com.careplatform.hospital.repository.BloodBankUnitRepository;
import com.careplatform.ehr.model.*;
import com.careplatform.ehr.repository.*;
import com.careplatform.virtualward.model.VirtualWardStay;
import com.careplatform.virtualward.repository.VirtualWardRepository;
import com.careplatform.woundcare.model.WoundAssessment;
import com.careplatform.woundcare.repository.WoundAssessmentRepository;
import com.careplatform.nutrition.model.FluidBalanceEntry;
import com.careplatform.nutrition.repository.FluidBalanceRepository;
import com.careplatform.skills.model.CarerSkill;
import com.careplatform.skills.repository.CarerSkillRepository;
import com.careplatform.emergency.model.EmergencyTriage;
import com.careplatform.emergency.repository.EmergencyTriageRepository;
import com.careplatform.insurance.model.InsuranceClaim;
import com.careplatform.insurance.repository.InsuranceClaimRepository;
import com.careplatform.shiftbroadcast.model.OpenShiftBroadcast;
import com.careplatform.shiftbroadcast.repository.OpenShiftBroadcastRepository;
import com.careplatform.crm.model.ClientLead;
import com.careplatform.crm.repository.ClientLeadRepository;
import com.careplatform.ehr.model.SpecialtyConsultation;
import com.careplatform.ehr.repository.SpecialtyConsultationRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final TenantRepository tenantRepository;
    private final OrganisationRepository organisationRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final CareTimelineEventRepository timelineRepository;
    private final CarePlanRepository carePlanRepository;
    private final AssessmentTemplateRepository assessmentTemplateRepository;
    private final AssessmentSubmissionRepository assessmentSubmissionRepository;
    private final RiskRepository riskRepository;
    private final VisitRepository visitRepository;
    private final MedicationRepository medicationRepository;
    private final MedicationAdministrationRepository emarRepository;
    private final MedicationReconciliationRepository reconciliationRepository;
    private final IncidentRepository incidentRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final MessageRepository messageRepository;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;
    private final OpdAppointmentRepository opdAppointmentRepository;
    private final WardRepository wardRepository;
    private final BedRepository bedRepository;
    private final IpdAdmissionRepository ipdAdmissionRepository;
    private final DiagnosticOrderRepository diagnosticOrderRepository;
    private final MedicineMasterRepository medicineMasterRepository;
    private final MedicineBatchRepository medicineBatchRepository;
    private final PharmacyDispensationRepository pharmacyDispensationRepository;
    private final OperationTheatreBookingRepository otBookingRepository;
    private final BloodBankUnitRepository bloodBankUnitRepository;
    private final PatientAllergyRepository patientAllergyRepository;
    private final PatientProblemRepository patientProblemRepository;
    private final PatientMedicationRepository patientMedicationRepository;
    private final PatientImmunizationRepository patientImmunizationRepository;
    private final PatientProcedureRepository patientProcedureRepository;
    private final PastMedicalHistoryRepository pastMedicalHistoryRepository;
    private final FamilyHistoryRepository familyHistoryRepository;
    private final SocialHistoryRepository socialHistoryRepository;
    private final ClinicalNoteRepository clinicalNoteRepository;
    private final ClinicalDocumentRepository clinicalDocumentRepository;
    private final VirtualWardRepository virtualWardRepository;
    private final WoundAssessmentRepository woundAssessmentRepository;
    private final FluidBalanceRepository fluidBalanceRepository;
    private final CarerSkillRepository carerSkillRepository;
    private final EmergencyTriageRepository emergencyTriageRepository;
    private final InsuranceClaimRepository insuranceClaimRepository;
    private final OpenShiftBroadcastRepository openShiftBroadcastRepository;
    private final ClientLeadRepository clientLeadRepository;
    private final SpecialtyConsultationRepository specialtyConsultationRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initialisation.");
            return;
        }

        log.info("Bootstrapping Care Platform reference and demonstration data...");
        TenantContext.setTenantId("TENANT-001");

        // 1. Tenants
        Tenant tenant1 = tenantRepository.save(Tenant.builder()
                .tenantId("TENANT-001")
                .name("Apex Care Services Group")
                .subscriptionTier("ENTERPRISE")
                .active(true)
                .build());

        Tenant tenant2 = tenantRepository.save(Tenant.builder()
                .tenantId("TENANT-002")
                .name("Sunrise Community Living")
                .subscriptionTier("PROFESSIONAL")
                .active(true)
                .build());

        // 2. Organisation & Branch
        Organisation org = Organisation.builder()
                .name("Apex Domiciliary Care Ltd")
                .registrationNumber("CQC-1-987654321")
                .email("operations@apexcare.example")
                .phone("+44 20 7946 0912")
                .address("104 Harley Street, London, W1G 7JE")
                .timezone("Europe/London")
                .workingHoursStart("07:00")
                .workingHoursEnd("22:00")
                .ecmToleranceMinutes(15)
                .build();
        org.setTenantId("TENANT-001");
        Organisation savedOrg = organisationRepository.save(org);

        Branch branch = Branch.builder()
                .organisationId(savedOrg.getId())
                .name("Central London & Westminster Branch")
                .code("LON-W1")
                .address("45 Victoria Street, London, SW1H 0EU")
                .phone("+44 20 7946 0915")
                .build();
        branch.setTenantId("TENANT-001");
        Branch savedBranch = branchRepository.save(branch);

        // 3. Users for all Personas (password: password123)
        String hashedPass = passwordEncoder.encode("password123");

        User admin = createUser("admin", hashedPass, "admin@apexcare.example", "Alex Rivera (Platform Admin)", Role.PLATFORM_ADMIN, savedBranch.getId());
        User orgAdmin = createUser("org_admin", hashedPass, "lead@apexcare.example", "Marcus Vance (Org Administrator)", Role.ORG_ADMIN, savedBranch.getId());
        User manager = createUser("manager_sarah", hashedPass, "sarah.jenkins@apexcare.example", "Sarah Jenkins (Care Manager)", Role.CARE_MANAGER, savedBranch.getId());
        User coordinator = createUser("coord_david", hashedPass, "david.okafor@apexcare.example", "David Okafor (Care Coordinator)", Role.CARE_COORDINATOR, savedBranch.getId());
        User carer1 = createUser("carer_emily", hashedPass, "emily.watson@apexcare.example", "Emily Watson (Senior Carer)", Role.CARE_WORKER, savedBranch.getId());
        User carer2 = createUser("carer_james", hashedPass, "james.carter@apexcare.example", "James Carter (Care Worker)", Role.CARE_WORKER, savedBranch.getId());
        User family = createUser("family_robert", hashedPass, "robert.higgins@family.example", "Robert Higgins (Family Member)", Role.FAMILY_MEMBER, savedBranch.getId());
        User finance = createUser("finance_clara", hashedPass, "clara.baker@apexcare.example", "Clara Baker (Finance Admin)", Role.FINANCE_ADMIN, savedBranch.getId());
        User audit = createUser("audit_elena", hashedPass, "elena.rostova@apexcare.example", "Elena Rostova (Compliance Inspector)", Role.AUDIT_TEAM, savedBranch.getId());

        // 4. Clients
        Client margaret = Client.builder()
                .clientIdentifier("CLI-1001")
                .uhid("UHID-2026-0001")
                .firstName("Margaret")
                .lastName("Higgins")
                .preferredName("Peggy")
                .dateOfBirth(LocalDate.of(1948, 4, 12))
                .gender("Female")
                .maritalStatus("Widowed")
                .primaryLanguage("English")
                .interpreterNeeded(false)
                .ethnicity("British / English")
                .primaryCarePhysician("Dr. Alistair Campbell (Kensington Practice)")
                .payerName("NHS Westminster CCG & Adult Social Care")
                .payerPolicyNumber("NHS-CCG-88219")
                .resuscitationStatus("CPR_FULL_CODE")
                .nhsNumber("943 281 7421")
                .phone("+44 20 7946 0182")
                .email("margaret.higgins@client.example")
                .address("14 Kensington Gardens Square, London")
                .postcode("W2 4DJ")
                .keySafeCode("C-4921")
                .medicalHistory("Osteoarthritis in both knees, Mild Cognitive Impairment, Hypertension.")
                .allergies("Penicillin (Severe Rash)")
                .carePreferences("Prefers female care workers in morning. Likes morning tea with oat milk and two sweeteners.")
                .status("ACTIVE")
                .fundingType("LOCAL_AUTHORITY")
                .branchId(savedBranch.getId())
                .assignedManagerId(manager.getId())
                .build();
        margaret.setTenantId("TENANT-001");
        Client savedMargaret = clientRepository.save(margaret);

        // Add Emergency Contacts
        EmergencyContact contact1 = EmergencyContact.builder()
                .client(savedMargaret)
                .name("Robert Higgins")
                .relationship("Son (Lasting Power of Attorney - Health & Welfare)")
                .phone("+44 7700 900451")
                .email("robert.higgins@family.example")
                .primary(true)
                .hasPortalAccess(true)
                .build();
        contact1.setTenantId("TENANT-001");
        savedMargaret.getEmergencyContacts().add(contact1);
        clientRepository.save(savedMargaret);

        Client arthur = Client.builder()
                .clientIdentifier("CLI-1002")
                .uhid("UHID-2026-0002")
                .firstName("Arthur")
                .lastName("Pendelton")
                .preferredName("Artie")
                .dateOfBirth(LocalDate.of(1942, 9, 28))
                .gender("Male")
                .maritalStatus("Married")
                .primaryLanguage("English")
                .interpreterNeeded(false)
                .ethnicity("British / English")
                .primaryCarePhysician("Dr. Fiona Gallagher (St James Medical)")
                .payerName("NHS Continuing Healthcare (CHC)")
                .payerPolicyNumber("CHC-77120-LON")
                .resuscitationStatus("DNACPR")
                .nhsNumber("821 954 1120")
                .phone("+44 20 7946 0339")
                .address("22 St James Court, London")
                .postcode("SW1A 1BS")
                .keySafeCode("K-8812")
                .medicalHistory("Type 2 Diabetes Mellitus, Post-stroke left side hemiparesis.")
                .allergies("None Known")
                .carePreferences("Needs wheelchair transfer support with rotunda aid. Enjoys listening to classical radio.")
                .status("ACTIVE")
                .fundingType("NHS_CHC")
                .branchId(savedBranch.getId())
                .assignedManagerId(manager.getId())
                .build();
        arthur.setTenantId("TENANT-001");
        clientRepository.save(arthur);

        // 5. Timeline Events
        createTimelineEvent(savedMargaret.getId(), "CLIENT_REGISTERED", "Client Registered", "Longitudinal care record initialized.", "INFO", "System");
        createTimelineEvent(savedMargaret.getId(), "CAREPLAN_APPROVED", "Person-Centred Care Plan Active", "Annual care plan approved by Sarah Jenkins.", "INFO", "Sarah Jenkins");

        // 6. Care Plan
        CarePlan plan = CarePlan.builder()
                .clientId(savedMargaret.getId())
                .title("Margaret Higgins - Comprehensive Independence & Support Plan")
                .summary("Daily domiciliary care focusing on personal hygiene, nutritional assistance, medication prompts, and fall prevention.")
                .status(CarePlanStatus.ACTIVE)
                .version(1)
                .startDate(LocalDate.now().minusMonths(1))
                .reviewDate(LocalDate.now().plusMonths(5))
                .approvedBy("Sarah Jenkins (Care Manager)")
                .medicationInstructions("Prompt Paracetamol and Amlodipine with breakfast. Record directly in eMAR.")
                .mobilitySupportNotes("Assistance of 1 carer required for shower transfers. Frame with wheels inside home.")
                .nutritionDietaryRequirements("Soft textures preferred. Ensure hydration drink available beside favorite armchair.")
                .goals(new ArrayList<>())
                .tasks(new ArrayList<>())
                .build();
        plan.setTenantId("TENANT-001");

        CareGoal g1 = CareGoal.builder()
                .carePlan(plan)
                .description("Maintain safe transfer independence with walking frame without unassisted trips")
                .targetDate(LocalDate.now().plusMonths(3))
                .status("IN_PROGRESS")
                .build();
        g1.setTenantId("TENANT-001");
        plan.getGoals().add(g1);

        CareGoal g2 = CareGoal.builder()
                .carePlan(plan)
                .description("Achieve 100% daily medication adherence verified via digital eMAR")
                .targetDate(LocalDate.now().plusMonths(2))
                .status("IN_PROGRESS")
                .build();
        g2.setTenantId("TENANT-001");
        plan.getGoals().add(g2);

        CareTask t1 = CareTask.builder()
                .carePlan(plan)
                .title("Assisted Morning Wash, Dressing & Hair Care")
                .instructions("Standby assistance with shower. Assist with lower body dressing and compression stockings.")
                .category("PERSONAL_CARE")
                .timeOfDay("MORNING")
                .mandatory(true)
                .build();
        t1.setTenantId("TENANT-001");
        plan.getTasks().add(t1);

        CareTask t2 = CareTask.builder()
                .carePlan(plan)
                .title("Breakfast & Warm Beverage Preparation")
                .instructions("Prepare porridge or scrambled egg with tea. Ensure 300ml fresh water provided.")
                .category("NUTRITION")
                .timeOfDay("MORNING")
                .mandatory(true)
                .build();
        t2.setTenantId("TENANT-001");
        plan.getTasks().add(t2);

        CareTask t3 = CareTask.builder()
                .carePlan(plan)
                .title("Morning Medication Administration & eMAR Check")
                .instructions("Administer Amlodipine 5mg and Paracetamol 500mg. Verify 6 Rights of Medication.")
                .category("MEDICATION")
                .timeOfDay("MORNING")
                .mandatory(true)
                .build();
        t3.setTenantId("TENANT-001");
        plan.getTasks().add(t3);

        carePlanRepository.save(plan);

        // 7. Assessment Templates & Submissions
        AssessmentTemplate fallsTemplate = AssessmentTemplate.builder()
                .title("Falls Risk Assessment Tool (FRAT)")
                .category("FALLS_RISK")
                .description("Standardised clinical assessment to evaluate individual fall risk and identify control mitigations.")
                .maxScore(20)
                .riskThresholdHigh(12)
                .questions(new ArrayList<>())
                .build();
        fallsTemplate.setTenantId("TENANT-001");

        AssessmentQuestion q1 = AssessmentQuestion.builder()
                .template(fallsTemplate)
                .questionText("History of falling within the previous 12 months?")
                .sectionName("Clinical History")
                .answerType("SINGLE_CHOICE")
                .optionsJson("[{\"label\":\"None\", \"points\":0},{\"label\":\"1 fall without injury\", \"points\":3},{\"label\":\"2 or more falls\", \"points\":6}]")
                .orderIndex(1)
                .build();
        q1.setTenantId("TENANT-001");
        fallsTemplate.getQuestions().add(q1);

        AssessmentQuestion q2 = AssessmentQuestion.builder()
                .template(fallsTemplate)
                .questionText("Mobility status and equipment requirement?")
                .sectionName("Functional Mobility")
                .answerType("SINGLE_CHOICE")
                .optionsJson("[{\"label\":\"Independent\", \"points\":0},{\"label\":\"Uses walking stick/frame\", \"points\":4},{\"label\":\"Requires carer assistance\", \"points\":7}]")
                .orderIndex(2)
                .build();
        q2.setTenantId("TENANT-001");
        fallsTemplate.getQuestions().add(q2);

        AssessmentQuestion q3 = AssessmentQuestion.builder()
                .template(fallsTemplate)
                .questionText("Does the client take 4 or more regular prescribed medications (Polypharmacy)?")
                .sectionName("Medication Risk")
                .answerType("SINGLE_CHOICE")
                .optionsJson("[{\"label\":\"No\", \"points\":0},{\"label\":\"Yes\", \"points\":4}]")
                .orderIndex(3)
                .build();
        q3.setTenantId("TENANT-001");
        fallsTemplate.getQuestions().add(q3);

        AssessmentTemplate savedTemplate = assessmentTemplateRepository.save(fallsTemplate);

        AssessmentSubmission submission = AssessmentSubmission.builder()
                .clientId(savedMargaret.getId())
                .templateId(savedTemplate.getId())
                .templateTitle(savedTemplate.getTitle())
                .totalScore(14)
                .riskLevel("HIGH")
                .answersJson("{\"history\":\"2 or more falls (6 pts)\",\"mobility\":\"Uses walking frame (4 pts)\",\"medication\":\"Yes (4 pts)\"}")
                .clinicalNotes("Margaret experienced a slip in kitchen last month. Walking frame and non-slip rugs recommended.")
                .assessorName("Sarah Jenkins (Care Manager)")
                .assessmentDate(LocalDate.now().minusWeeks(2))
                .nextReviewDate(LocalDate.now().plusMonths(3))
                .build();
        submission.setTenantId("TENANT-001");
        assessmentSubmissionRepository.save(submission);

        // 8. Risk Record
        Risk fallRisk = Risk.builder()
                .clientId(savedMargaret.getId())
                .category("FALLS")
                .description("Risk of falls during nighttime transfers from bedroom to en-suite.")
                .severity(4)
                .likelihood(4)
                .controlsAndMitigations("Motion-sensor night light installed. Walking frame kept strictly within arm's reach. Non-slip socks supplied.")
                .actionPlan("Monitor nighttime gait stability. Carer prompts before bedtime.")
                .ownerName("Sarah Jenkins")
                .reviewDate(LocalDate.now().plusMonths(2))
                .status("OPEN")
                .build();
        fallRisk.setTenantId("TENANT-001");
        fallRisk.calculateRisk();
        riskRepository.save(fallRisk);

        // 9. Prescriptions & Medications (UK eMAR Lifecycle)
        Medication med1 = Medication.builder()
                .clientId(savedMargaret.getId())
                .name("Amlodipine")
                .genericName("Amlodipine Besylate")
                .dosageForm("Tablet")
                .strength("5mg")
                .dose("1 tablet (5mg)")
                .route("Oral")
                .frequency("Once daily (Morning)")
                .scheduleType("REGULAR")
                .scheduledTimes("08:00")
                .instructions("Take with morning water. Check for ankle edema.")
                .prn(false)
                .timeCritical(false)
                .stockQuantity(24)
                .reorderLevel(7)
                .repeatStatus("NOT_DUE")
                .pharmacyName("Boots Pharmacy Central")
                .pharmacyPhone("020 7946 0912")
                .pharmacyRxNumber("RX-BP-8812")
                .prescriberDetails("Dr. P. Thornton (GP)")
                .startDate(LocalDate.now().minusMonths(6))
                .lastReviewDate(LocalDate.now().minusMonths(2))
                .nextReviewDate(LocalDate.now().plusMonths(4))
                .active(true)
                .status("ACTIVE")
                .build();
        med1.setTenantId("TENANT-001");
        Medication savedMed1 = medicationRepository.save(med1);

        Medication med2 = Medication.builder()
                .clientId(savedMargaret.getId())
                .name("Sinemet Plus")
                .genericName("Levodopa / Carbidopa 100mg/25mg")
                .dosageForm("Tablet")
                .strength("100/25mg")
                .dose("1 tablet")
                .route("Oral")
                .frequency("Three times daily")
                .scheduleType("REGULAR")
                .scheduledTimes("08:00, 13:00, 18:00")
                .timeCritical(true)
                .timeWindowMinutes(30)
                .instructions("CRITICAL TIMING: Strict schedule vital for Parkinson's motor symptom control. Administer 30 mins before meals.")
                .prn(false)
                .stockQuantity(42)
                .reorderLevel(14)
                .repeatStatus("NOT_DUE")
                .pharmacyName("Boots Pharmacy Central")
                .pharmacyRxNumber("RX-BP-8813")
                .prescriberDetails("Dr. Alistair Campbell (Consultant Neurologist)")
                .startDate(LocalDate.now().minusMonths(4))
                .lastReviewDate(LocalDate.now().minusMonths(1))
                .nextReviewDate(LocalDate.now().plusMonths(5))
                .active(true)
                .status("ACTIVE")
                .build();
        med2.setTenantId("TENANT-001");
        Medication savedMed2 = medicationRepository.save(med2);

        Medication med3 = Medication.builder()
                .clientId(savedMargaret.getId())
                .name("Paracetamol")
                .genericName("Paracetamol (Acetaminophen)")
                .dosageForm("Tablet")
                .strength("500mg")
                .dose("1-2 tablets (500-1000mg)")
                .route("Oral")
                .frequency("As required (PRN) for joint pain")
                .scheduleType("PRN")
                .scheduledTimes("PRN")
                .prn(true)
                .minIntervalHours(4)
                .maxDosesPerDay(4)
                .prnIndication("Mild to moderate osteoarthritic joint pain rated >= 4/10 or pyrexia > 37.8C")
                .instructions("For pain relief. Minimum 4 hours between doses. Max 8 tablets (4000mg) in 24 hours. Record effectiveness at 45 min.")
                .stockQuantity(32)
                .reorderLevel(8)
                .repeatStatus("NOT_DUE")
                .pharmacyName("Boots Pharmacy Central")
                .prescriberDetails("Dr. P. Thornton (GP)")
                .startDate(LocalDate.now().minusMonths(3))
                .active(true)
                .status("ACTIVE")
                .build();
        med3.setTenantId("TENANT-001");
        Medication savedMed3 = medicationRepository.save(med3);

        Medication med4 = Medication.builder()
                .clientId(savedMargaret.getId())
                .name("Oramorph (Morphine Sulfate)")
                .genericName("Morphine Sulfate Oral Solution")
                .dosageForm("Liquid")
                .strength("10mg/5ml")
                .dose("5ml (10mg)")
                .route("Oral")
                .frequency("PRN for acute breakthrough pain")
                .scheduleType("PRN")
                .scheduledTimes("PRN")
                .prn(true)
                .controlledDrug(true)
                .requiresWitness(true)
                .minIntervalHours(4)
                .maxDosesPerDay(4)
                .prnIndication("Severe acute breakthrough pain rated >= 7/10 or sudden dyspnoea")
                .instructions("UK Controlled Drug (Schedule 2). Mandatory 2nd staff or RN witness double-signature. Lock in home CD register box.")
                .stockQuantity(95)
                .reorderLevel(30)
                .repeatStatus("NOT_DUE")
                .pharmacyName("Boots Pharmacy Central")
                .pharmacyRxNumber("RX-CD-0092")
                .prescriberDetails("Dr. Sarah Jenkins (Palliative Care)")
                .startDate(LocalDate.now().minusMonths(1))
                .active(true)
                .status("ACTIVE")
                .build();
        med4.setTenantId("TENANT-001");
        Medication savedMed4 = medicationRepository.save(med4);

        Medication med5 = Medication.builder()
                .clientId(savedMargaret.getId())
                .name("Alendronic Acid")
                .genericName("Alendronate Sodium")
                .dosageForm("Tablet")
                .strength("70mg")
                .dose("1 tablet (70mg)")
                .route("Oral")
                .frequency("Once weekly on Wednesdays")
                .scheduleType("WEEKLY")
                .scheduledDays("WEDNESDAY")
                .scheduledTimes("08:00")
                .instructions("Take with a full glass of tap water upon waking. Must remain upright (sitting or standing) for at least 30 minutes before any food.")
                .stockQuantity(3)
                .reorderLevel(2)
                .repeatStatus("NOT_DUE")
                .pharmacyName("Boots Pharmacy Central")
                .prescriberDetails("Dr. P. Thornton (GP)")
                .startDate(LocalDate.now().minusMonths(8))
                .active(true)
                .status("ACTIVE")
                .build();
        med5.setTenantId("TENANT-001");
        Medication savedMed5 = medicationRepository.save(med5);

        Medication med6 = Medication.builder()
                .clientId(savedMargaret.getId())
                .name("Voltarol Emulgel (Diclofenac)")
                .genericName("Diclofenac Diethylamine 1.16%")
                .dosageForm("Cream")
                .strength("1.16% w/w")
                .dose("2-4g ribbon")
                .route("Topical")
                .frequency("Twice daily (Morning & Evening)")
                .scheduleType("REGULAR")
                .scheduledTimes("08:00, 20:00")
                .topicalSite("Bilateral Knees")
                .instructions("Apply to intact skin over painful knee joint. Rotate sites (Left Knee AM, Right Knee PM). Wash hands thoroughly post-application.")
                .stockQuantity(2)
                .reorderLevel(1)
                .repeatStatus("NOT_DUE")
                .pharmacyName("Boots Pharmacy Central")
                .prescriberDetails("Dr. P. Thornton (GP)")
                .startDate(LocalDate.now().minusMonths(2))
                .active(true)
                .status("ACTIVE")
                .build();
        med6.setTenantId("TENANT-001");
        Medication savedMed6 = medicationRepository.save(med6);

        Medication med7 = Medication.builder()
                .clientId(savedMargaret.getId())
                .name("Furosemide")
                .genericName("Furosemide Loop Diuretic")
                .dosageForm("Tablet")
                .strength("40mg")
                .dose("1 tablet (40mg)")
                .route("Oral")
                .frequency("Once daily (Morning)")
                .scheduleType("REGULAR")
                .scheduledTimes("08:00")
                .instructions("Diuretic for fluid management and peripheral edema. Take in morning to minimize nocturia. Monitor hydration.")
                .stockQuantity(3)
                .reorderLevel(7)
                .repeatStatus("DUE_FOR_REORDER")
                .pharmacyName("Well Pharmacy High St")
                .pharmacyPhone("020 7946 0199")
                .pharmacyRxNumber("RX-WP-4421")
                .prescriberDetails("Dr. Sarah Jenkins (Cardiology)")
                .startDate(LocalDate.now().minusMonths(1))
                .active(true)
                .status("ACTIVE")
                .build();
        med7.setTenantId("TENANT-001");
        Medication savedMed7 = medicationRepository.save(med7);

        // eMAR Administration entries
        MedicationAdministration emar1 = MedicationAdministration.builder()
                .clientId(savedMargaret.getId())
                .medicationId(savedMed1.getId())
                .medicationName("Amlodipine 5mg")
                .doseGiven("1 tablet")
                .workerId(carer1.getId())
                .workerName(carer1.getFullName())
                .outcome(AdministrationOutcome.ADMINISTERED)
                .scheduledSlot("MORNING")
                .administrationTime(LocalDateTime.now().withHour(8).withMinute(22))
                .outcomeReason("Administered smoothly with fresh water. No dysphagia noted.")
                .digitalSignature("Signed by Sarah Walker, Senior Carer (SCW-9041)")
                .exception(false)
                .build();
        emar1.setTenantId("TENANT-001");
        emarRepository.save(emar1);

        MedicationAdministration emar2 = MedicationAdministration.builder()
                .clientId(savedMargaret.getId())
                .medicationId(savedMed2.getId())
                .medicationName("Sinemet Plus 100/25mg")
                .doseGiven("1 tablet")
                .workerId(carer1.getId())
                .workerName(carer1.getFullName())
                .outcome(AdministrationOutcome.ADMINISTERED)
                .scheduledSlot("MORNING")
                .administrationTime(LocalDateTime.now().withHour(8).withMinute(5))
                .outcomeReason("Time-critical dose administered on schedule (30m prior to breakfast).")
                .digitalSignature("Signed by Sarah Walker, Senior Carer (SCW-9041)")
                .exception(false)
                .build();
        emar2.setTenantId("TENANT-001");
        emarRepository.save(emar2);

        MedicationAdministration emar3 = MedicationAdministration.builder()
                .clientId(savedMargaret.getId())
                .medicationId(savedMed6.getId())
                .medicationName("Voltarol Emulgel (Diclofenac)")
                .doseGiven("2g ribbon")
                .topicalSiteApplied("Left Knee (Site Rotated)")
                .workerId(carer1.getId())
                .workerName(carer1.getFullName())
                .outcome(AdministrationOutcome.ADMINISTERED)
                .scheduledSlot("MORNING")
                .administrationTime(LocalDateTime.now().withHour(8).withMinute(28))
                .outcomeReason("Topical gel applied to left knee; skin intact, no erythema.")
                .digitalSignature("Signed by Sarah Walker, Senior Carer (SCW-9041)")
                .exception(false)
                .build();
        emar3.setTenantId("TENANT-001");
        emarRepository.save(emar3);

        MedicationAdministration emar4 = MedicationAdministration.builder()
                .clientId(savedMargaret.getId())
                .medicationId(savedMed3.getId())
                .medicationName("Paracetamol 500mg")
                .doseGiven("2 tablets (1000mg)")
                .workerId(carer1.getId())
                .workerName(carer1.getFullName())
                .outcome(AdministrationOutcome.ADMINISTERED)
                .scheduledSlot("PRN")
                .administrationTime(LocalDateTime.now().minusHours(3))
                .outcomeReason("Administered for osteoarthritic knee ache")
                .prnReason("Client reported knee ache rated 7/10 after morning transfer")
                .prnEffectiveness("Pain score reduced from 7/10 to 2/10 at 45m follow-up. Client mobilised safely to chair.")
                .prnFollowUpTime(LocalDateTime.now().minusHours(2).minusMinutes(15))
                .digitalSignature("Signed by Sarah Walker, Senior Carer (SCW-9041)")
                .exception(false)
                .build();
        emar4.setTenantId("TENANT-001");
        emarRepository.save(emar4);

        MedicationAdministration emar5 = MedicationAdministration.builder()
                .clientId(savedMargaret.getId())
                .medicationId(savedMed4.getId())
                .medicationName("Oramorph (Morphine Sulfate) 10mg/5ml")
                .doseGiven("5ml (10mg)")
                .workerId(carer1.getId())
                .workerName(carer1.getFullName())
                .outcome(AdministrationOutcome.ADMINISTERED)
                .scheduledSlot("PRN")
                .administrationTime(LocalDateTime.now().minusDays(1).withHour(20).withMinute(15))
                .outcomeReason("Administered for acute nocturnal pain flare")
                .prnReason("Acute breakthrough pain rated 8/10 in bilateral knees")
                .prnEffectiveness("Pain eased to 1/10. Client settled comfortably to sleep.")
                .prnFollowUpTime(LocalDateTime.now().minusDays(1).withHour(21).withMinute(0))
                .witnessName("Clara Oswald, RN")
                .witnessRole("District Registered Nurse")
                .witnessSignedAt(LocalDateTime.now().minusDays(1).withHour(20).withMinute(16))
                .digitalSignature("Primary: Sarah Walker (SCW) / Witness: Clara Oswald (RN-8812)")
                .exception(false)
                .build();
        emar5.setTenantId("TENANT-001");
        emarRepository.save(emar5);

        // eMAR Exception for Alerts & Escalation Workflow
        MedicationAdministration emarException = MedicationAdministration.builder()
                .clientId(savedMargaret.getId())
                .medicationId(savedMed7.getId())
                .medicationName("Furosemide 40mg")
                .doseGiven("0")
                .workerId(carer2.getId())
                .workerName(carer2.getFullName())
                .outcome(AdministrationOutcome.REFUSED)
                .scheduledSlot("MORNING")
                .administrationTime(LocalDateTime.now().withHour(8).withMinute(35))
                .outcomeReason("Client refused morning diuretic citing church bus trip and fear of urge incontinence.")
                .exception(true)
                .escalationStatus("FLAGGED_TO_OFFICE")
                .escalationNotes("Urgent alert raised to Care Office: Client educated on heart failure edema risk. Coordinator contacted family to re-offer at lunchtime round.")
                .digitalSignature("Signed by James Miller, Carer (CW-772)")
                .build();
        emarException.setTenantId("TENANT-001");
        emarRepository.save(emarException);

        // Medication Reconciliation Record (Hospital Discharge vs Community)
        MedicationReconciliation dischargeRec = MedicationReconciliation.builder()
                .clientId(savedMargaret.getId())
                .source("St Mary's NHS Trust - Hospital Discharge Summary & TTO (Ward 4B)")
                .reconciledBy("Dr. Sarah Jenkins (Consultant Geriatrician) & Rachel Green (Care Coordinator)")
                .reconciliationDate(LocalDate.now().minusDays(3))
                .status("APPROVED_AND_APPLIED")
                .discrepanciesJson("[\n" +
                        "  {\"medicationName\": \"Furosemide\", \"type\": \"DOSE_INCREASE\", \"preAdmission\": \"20mg once daily\", \"discharge\": \"40mg once daily\", \"reason\": \"Persistent bilateral ankle edema managed during admission; increased maintenance dose required.\"},\n" +
                        "  {\"medicationName\": \"Atorvastatin\", \"type\": \"DOSE_INCREASE\", \"preAdmission\": \"10mg nocte\", \"discharge\": \"20mg nocte\", \"reason\": \"Cardioprotection lipid optimization per post-infarction NICE pathway.\"},\n" +
                        "  {\"medicationName\": \"Codeine Phosphate\", \"type\": \"DISCONTINUED\", \"preAdmission\": \"30mg QDS PRN\", \"discharge\": \"STOPPED\", \"reason\": \"Opioid-induced constipation and increased fall risk; replaced with topical Diclofenac.\"},\n" +
                        "  {\"medicationName\": \"Sinemet Plus\", \"type\": \"CONTINUED\", \"preAdmission\": \"100/25mg TDS\", \"discharge\": \"100/25mg TDS\", \"reason\": \"Strict 08:00, 13:00, 18:00 Parkinson's motor timing reconfirmed.\"}\n" +
                        "]")
                .clinicalNotes("Comprehensive post-discharge reconciliation executed. Community pharmacy alerted to dispense 28-day blister packs with updated Furosemide 40mg. Discontinued Codeine blister packs removed from client premises by visiting RN.")
                .build();
        dischargeRec.setTenantId("TENANT-001");
        reconciliationRepository.save(dischargeRec);

        // 10. Today's Visits (Demonstrating ECM, GPS, QR, In-Progress)
        LocalDate today = LocalDate.now();

        Visit morningVisit = Visit.builder()
                .visitReference("VST-MORN-" + today.getDayOfMonth())
                .clientId(savedMargaret.getId())
                .clientName("Margaret Higgins")
                .clientAddress(savedMargaret.getAddress())
                .staffId(carer1.getId())
                .staffName(carer1.getFullName())
                .carePlanId(plan.getId())
                .scheduledStart(today.atTime(8, 0))
                .scheduledEnd(today.atTime(9, 0))
                .actualStart(today.atTime(8, 5))
                .actualEnd(today.atTime(8, 58))
                .status(VisitStatus.COMPLETED)
                .visitType("PERSONAL_CARE")
                .checkInMethod("GPS")
                .checkInLatitude(51.5134)
                .checkInLongitude(-0.1912)
                .checkOutLatitude(51.5135)
                .checkOutLongitude(-0.1913)
                .careNotes("Margaret was in bright spirits. Morning wash and dressing completed without incident. Breakfast eaten well.")
                .billable(true)
                .billingRate(26.50)
                .build();
        morningVisit.setTenantId("TENANT-001");
        visitRepository.save(morningVisit);

        Visit lunchVisit = Visit.builder()
                .visitReference("VST-LUNCH-" + today.getDayOfMonth())
                .clientId(savedMargaret.getId())
                .clientName("Margaret Higgins")
                .clientAddress(savedMargaret.getAddress())
                .staffId(carer2.getId())
                .staffName(carer2.getFullName())
                .carePlanId(plan.getId())
                .scheduledStart(today.atTime(12, 30))
                .scheduledEnd(today.atTime(13, 15))
                .actualStart(today.atTime(12, 32))
                .status(VisitStatus.IN_PROGRESS)
                .visitType("NUTRITION")
                .checkInMethod("QR_CODE")
                .qrVerificationToken("QR-KEYSAFE-KENSINGTON-14")
                .checkInLatitude(51.5134)
                .checkInLongitude(-0.1912)
                .billable(true)
                .billingRate(26.50)
                .build();
        lunchVisit.setTenantId("TENANT-001");
        visitRepository.save(lunchVisit);

        Visit eveningVisit = Visit.builder()
                .visitReference("VST-EVE-" + today.getDayOfMonth())
                .clientId(savedMargaret.getId())
                .clientName("Margaret Higgins")
                .clientAddress(savedMargaret.getAddress())
                .staffId(carer1.getId())
                .staffName(carer1.getFullName())
                .carePlanId(plan.getId())
                .scheduledStart(today.atTime(18, 0))
                .scheduledEnd(today.atTime(18, 45))
                .status(VisitStatus.SCHEDULED)
                .visitType("PERSONAL_CARE")
                .billable(true)
                .billingRate(28.00)
                .build();
        eveningVisit.setTenantId("TENANT-001");
        visitRepository.save(eveningVisit);

        Visit nightVisit = Visit.builder()
                .visitReference("VST-BED-" + today.getDayOfMonth())
                .clientId(arthur.getId())
                .clientName("Arthur Pendelton")
                .clientAddress(arthur.getAddress())
                .staffId(carer2.getId())
                .staffName(carer2.getFullName())
                .scheduledStart(today.atTime(20, 30))
                .scheduledEnd(today.atTime(21, 15))
                .status(VisitStatus.SCHEDULED)
                .visitType("MEDICATION_ONLY")
                .billable(true)
                .billingRate(28.00)
                .build();
        nightVisit.setTenantId("TENANT-001");
        visitRepository.save(nightVisit);

        // 11. Incidents
        Incident incident = Incident.builder()
                .incidentReference("INC-202609-001")
                .clientId(savedMargaret.getId())
                .clientName("Margaret Higgins")
                .category("NEAR_MISS")
                .severity(IncidentSeverity.MEDIUM)
                .status(IncidentStatus.INVESTIGATION)
                .incidentTime(LocalDateTime.now().minusDays(1).withHour(19).withMinute(10))
                .description("Client tripped slightly on loose hallway runner mat while walking to bathroom. No fall occurred, caught self on handrail.")
                .immediateActionTaken("Carer removed loose runner mat with client consent and placed safely in utility closet.")
                .witnesses("Emily Watson (Carer)")
                .investigationNotes("Manager spoke with family member Robert Higgins to review flooring in hallway.")
                .reportedBy("Emily Watson")
                .assignedInvestigator("Sarah Jenkins")
                .build();
        incident.setTenantId("TENANT-001");
        incidentRepository.save(incident);

        // 12. Invoices & Billing
        Invoice inv1 = Invoice.builder()
                .invoiceNumber("INV-2026-0801")
                .clientId(savedMargaret.getId())
                .clientName("Margaret Higgins")
                .billingTo("Westminster City Council - Adult Social Care")
                .periodStart(today.minusDays(30))
                .periodEnd(today.minusDays(15))
                .dueDate(today.minusDays(5))
                .subtotalAmount(BigDecimal.valueOf(530.00))
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.valueOf(530.00))
                .paidAmount(BigDecimal.valueOf(530.00))
                .status(InvoiceStatus.PAID)
                .lines(new ArrayList<>())
                .build();
        inv1.setTenantId("TENANT-001");

        InvoiceLine l1 = InvoiceLine.builder()
                .invoice(inv1)
                .description("20 Hours Domiciliary Personal Care (Period 1)")
                .quantityHours(BigDecimal.valueOf(20))
                .unitRate(BigDecimal.valueOf(26.50))
                .lineTotal(BigDecimal.valueOf(530.00))
                .build();
        l1.setTenantId("TENANT-001");
        inv1.getLines().add(l1);
        invoiceRepository.save(inv1);

        Payment payment = Payment.builder()
                .invoiceId(inv1.getId())
                .amount(BigDecimal.valueOf(530.00))
                .paymentDate(today.minusDays(7))
                .paymentMethod("BACS")
                .referenceCode("BACS-WCC-99412")
                .build();
        payment.setTenantId("TENANT-001");
        paymentRepository.save(payment);

        Invoice inv2 = Invoice.builder()
                .invoiceNumber("INV-2026-0802")
                .clientId(savedMargaret.getId())
                .clientName("Margaret Higgins")
                .billingTo("Westminster City Council - Adult Social Care")
                .periodStart(today.minusDays(14))
                .periodEnd(today)
                .dueDate(today.plusDays(14))
                .subtotalAmount(BigDecimal.valueOf(424.00))
                .taxAmount(BigDecimal.ZERO)
                .totalAmount(BigDecimal.valueOf(424.00))
                .paidAmount(BigDecimal.ZERO)
                .status(InvoiceStatus.ISSUED)
                .lines(new ArrayList<>())
                .build();
        inv2.setTenantId("TENANT-001");

        InvoiceLine l2 = InvoiceLine.builder()
                .invoice(inv2)
                .description("16 Hours Domiciliary Personal Care (Period 2)")
                .quantityHours(BigDecimal.valueOf(16))
                .unitRate(BigDecimal.valueOf(26.50))
                .lineTotal(BigDecimal.valueOf(424.00))
                .build();
        l2.setTenantId("TENANT-001");
        inv2.getLines().add(l2);
        invoiceRepository.save(inv2);

        // 13. Secure Family Messaging Conversation
        Message msg1 = Message.builder()
                .clientId(savedMargaret.getId())
                .senderUsername("family_robert")
                .senderName("Robert Higgins (Son)")
                .senderRole("FAMILY_MEMBER")
                .recipientRole("CARE_MANAGER")
                .content("Hello, could you let me know how Mum managed her morning physiotherapy knee exercise today?")
                .sentAt(LocalDateTime.now().minusHours(4))
                .isRead(true)
                .build();
        msg1.setTenantId("TENANT-001");
        messageRepository.save(msg1);

        Message msg2 = Message.builder()
                .clientId(savedMargaret.getId())
                .senderUsername("manager_sarah")
                .senderName("Sarah Jenkins (Care Manager)")
                .senderRole("CARE_MANAGER")
                .recipientRole("FAMILY_MEMBER")
                .content("Hi Robert, Emily assisted Margaret with her 10-minute knee extensions during the morning visit. She completed all repetitions comfortably with good gait stability.")
                .sentAt(LocalDateTime.now().minusHours(3))
                .isRead(true)
                .build();
        msg2.setTenantId("TENANT-001");
        messageRepository.save(msg2);

        // 14. OPD (Outpatient Department) & Consultation Workspace
        OpdAppointment opd1 = OpdAppointment.builder()
                .uhid("UHID-2026-0001")
                .patientName("Margaret Higgins")
                .age(78)
                .gender("Female")
                .doctorName("Dr. Sarah Jenkins")
                .speciality("Cardiology")
                .appointmentTime(LocalDateTime.now().minusHours(1))
                .tokenNumber(1)
                .status(OpdAppointment.OpdStatus.COMPLETED)
                .triagePriority(OpdAppointment.TriagePriority.NORMAL)
                .chiefComplaints("Exertional dyspnoea, bilateral lower limb oedema")
                .vitals("BP: 138/86 mmHg | HR: 78 bpm | SpO2: 96% | Temp: 36.8°C")
                .diagnosis("I50.9 - Congestive Heart Failure, NYHA Class II")
                .clinicalNotes("Patient stable on current diuresis. Continue loop diuretic and ACE inhibitor.")
                .prescriptionJson("[{\"medicine\":\"Furosemide 40mg\",\"dosage\":\"1 tablet\",\"frequency\":\"OD (Morning)\",\"duration\":\"30 days\"},{\"medicine\":\"Ramipril 5mg\",\"dosage\":\"1 tablet\",\"frequency\":\"OD (Night)\",\"duration\":\"30 days\"}]")
                .labOrdersJson("[\"Echocardiogram 2D\",\"Serum Electrolytes\",\"NT-proBNP\"]")
                .build();
        opd1.setTenantId("TENANT-001");
        opdAppointmentRepository.save(opd1);

        OpdAppointment opd2 = OpdAppointment.builder()
                .uhid("UHID-2026-0002")
                .patientName("Arthur Pendelton")
                .age(82)
                .gender("Male")
                .doctorName("Dr. Alex Rivera")
                .speciality("General Medicine")
                .appointmentTime(LocalDateTime.now())
                .tokenNumber(2)
                .status(OpdAppointment.OpdStatus.IN_CONSULTATION)
                .triagePriority(OpdAppointment.TriagePriority.NORMAL)
                .chiefComplaints("Persistent cough with wheezing, mild fever for 3 days")
                .vitals("BP: 126/80 mmHg | HR: 84 bpm | SpO2: 94% | Temp: 37.9°C")
                .diagnosis("J18.9 - Community-Acquired Lower Respiratory Tract Infection")
                .clinicalNotes("Auscultation reveals coarse crackles at right lung base. Prescribing oral antibiotic and bronchodilator inhaler.")
                .prescriptionJson("[{\"medicine\":\"Amoxicillin 500mg\",\"dosage\":\"1 capsule\",\"frequency\":\"TDS (8-hourly)\",\"duration\":\"7 days\"},{\"medicine\":\"Salbutamol Inhaler\",\"dosage\":\"2 puffs\",\"frequency\":\"PRN (as needed)\",\"duration\":\"14 days\"}]")
                .labOrdersJson("[\"Chest X-Ray PA View\",\"Complete Blood Count (CBC)\"]")
                .build();
        opd2.setTenantId("TENANT-001");
        opdAppointmentRepository.save(opd2);

        OpdAppointment opd3 = OpdAppointment.builder()
                .uhid("UHID-2026-0003")
                .patientName("Eleanor Vance")
                .age(69)
                .gender("Female")
                .doctorName("Dr. Marcus Vance")
                .speciality("Orthopaedics")
                .appointmentTime(LocalDateTime.now().plusHours(1))
                .tokenNumber(3)
                .status(OpdAppointment.OpdStatus.WAITING)
                .triagePriority(OpdAppointment.TriagePriority.NORMAL)
                .chiefComplaints("Severe right knee pain, morning stiffness > 45 minutes")
                .vitals("BP: 130/82 mmHg | HR: 72 bpm | SpO2: 99% | Temp: 36.5°C")
                .diagnosis("M17.1 - Primary Gonarthrosis of Right Knee")
                .clinicalNotes("Evaluation for scheduled Total Knee Replacement. Review pre-operative PAC status.")
                .build();
        opd3.setTenantId("TENANT-001");
        opdAppointmentRepository.save(opd3);

        OpdAppointment opd4 = OpdAppointment.builder()
                .uhid("UHID-2026-0004")
                .patientName("Vikram Sharma")
                .age(54)
                .gender("Male")
                .doctorName("Dr. Sarah Jenkins")
                .speciality("Cardiology")
                .appointmentTime(LocalDateTime.now().plusHours(2))
                .tokenNumber(4)
                .status(OpdAppointment.OpdStatus.WAITING)
                .triagePriority(OpdAppointment.TriagePriority.URGENT)
                .chiefComplaints("Substernal chest tightness radiating to left shoulder on moderate exertion")
                .vitals("BP: 146/92 mmHg | HR: 92 bpm | SpO2: 97% | Temp: 36.7°C")
                .diagnosis("I20.9 - Angina Pectoris, Unstable (Triage Urgent)")
                .clinicalNotes("Urgent ECG & Troponin ordered. Stat evaluation required.")
                .build();
        opd4.setTenantId("TENANT-001");
        opdAppointmentRepository.save(opd4);

        // 15. IPD Wards & Visual Bed Management Matrix
        Ward wardIcu = Ward.builder()
                .wardName("Intensive Care Unit (ICU)")
                .wardType(Ward.WardType.ICU)
                .floorNumber(2)
                .dailyRate(BigDecimal.valueOf(1200.00))
                .build();
        wardIcu.setTenantId("TENANT-001");
        Ward savedIcu = wardRepository.save(wardIcu);

        Ward wardPriv = Ward.builder()
                .wardName("Deluxe Private Suite")
                .wardType(Ward.WardType.PRIVATE)
                .floorNumber(3)
                .dailyRate(BigDecimal.valueOf(650.00))
                .build();
        wardPriv.setTenantId("TENANT-001");
        Ward savedPriv = wardRepository.save(wardPriv);

        Ward wardGen = Ward.builder()
                .wardName("General Medical Ward")
                .wardType(Ward.WardType.GENERAL)
                .floorNumber(1)
                .dailyRate(BigDecimal.valueOf(250.00))
                .build();
        wardGen.setTenantId("TENANT-001");
        Ward savedGen = wardRepository.save(wardGen);

        Ward wardEmg = Ward.builder()
                .wardName("Emergency & Trauma Bay")
                .wardType(Ward.WardType.EMERGENCY)
                .floorNumber(0)
                .dailyRate(BigDecimal.valueOf(450.00))
                .build();
        wardEmg.setTenantId("TENANT-001");
        Ward savedEmg = wardRepository.save(wardEmg);

        // Seed Beds
        Bed bedIcu1 = Bed.builder().wardId(savedIcu.getId()).wardName("Intensive Care Unit (ICU)").bedNumber("ICU-01").status(Bed.BedStatus.OCCUPIED).occupiedByUhid("UHID-2026-0001").occupiedByName("Margaret Higgins").admissionDate(LocalDateTime.now().minusDays(2)).build();
        bedIcu1.setTenantId("TENANT-001");
        Bed savedBedIcu1 = bedRepository.save(bedIcu1);

        Bed bedIcu2 = Bed.builder().wardId(savedIcu.getId()).wardName("Intensive Care Unit (ICU)").bedNumber("ICU-02").status(Bed.BedStatus.AVAILABLE).build();
        bedIcu2.setTenantId("TENANT-001");
        bedRepository.save(bedIcu2);

        Bed bedIcu3 = Bed.builder().wardId(savedIcu.getId()).wardName("Intensive Care Unit (ICU)").bedNumber("ICU-03").status(Bed.BedStatus.OCCUPIED).occupiedByUhid("UHID-2026-0002").occupiedByName("Arthur Pendelton").admissionDate(LocalDateTime.now().minusDays(1)).build();
        bedIcu3.setTenantId("TENANT-001");
        bedRepository.save(bedIcu3);

        Bed bedIcu4 = Bed.builder().wardId(savedIcu.getId()).wardName("Intensive Care Unit (ICU)").bedNumber("ICU-04").status(Bed.BedStatus.CLEANING).build();
        bedIcu4.setTenantId("TENANT-001");
        bedRepository.save(bedIcu4);

        Bed bedPrv1 = Bed.builder().wardId(savedPriv.getId()).wardName("Deluxe Private Suite").bedNumber("PRV-301").status(Bed.BedStatus.OCCUPIED).occupiedByUhid("UHID-2026-0003").occupiedByName("Eleanor Vance").admissionDate(LocalDateTime.now().minusHours(12)).build();
        bedPrv1.setTenantId("TENANT-001");
        bedRepository.save(bedPrv1);

        Bed bedPrv2 = Bed.builder().wardId(savedPriv.getId()).wardName("Deluxe Private Suite").bedNumber("PRV-302").status(Bed.BedStatus.AVAILABLE).build();
        bedPrv2.setTenantId("TENANT-001");
        bedRepository.save(bedPrv2);

        Bed bedGen1 = Bed.builder().wardId(savedGen.getId()).wardName("General Medical Ward").bedNumber("GEN-101").status(Bed.BedStatus.AVAILABLE).build();
        bedGen1.setTenantId("TENANT-001");
        bedRepository.save(bedGen1);

        Bed bedGen2 = Bed.builder().wardId(savedGen.getId()).wardName("General Medical Ward").bedNumber("GEN-102").status(Bed.BedStatus.AVAILABLE).build();
        bedGen2.setTenantId("TENANT-001");
        bedRepository.save(bedGen2);

        Bed bedGen3 = Bed.builder().wardId(savedGen.getId()).wardName("General Medical Ward").bedNumber("GEN-103").status(Bed.BedStatus.MAINTENANCE).build();
        bedGen3.setTenantId("TENANT-001");
        bedRepository.save(bedGen3);

        Bed bedEmg1 = Bed.builder().wardId(savedEmg.getId()).wardName("Emergency & Trauma Bay").bedNumber("EMG-01").status(Bed.BedStatus.OCCUPIED).occupiedByUhid("UHID-2026-0004").occupiedByName("Vikram Sharma").admissionDate(LocalDateTime.now().minusHours(2)).build();
        bedEmg1.setTenantId("TENANT-001");
        bedRepository.save(bedEmg1);

        Bed bedEmg2 = Bed.builder().wardId(savedEmg.getId()).wardName("Emergency & Trauma Bay").bedNumber("EMG-02").status(Bed.BedStatus.AVAILABLE).build();
        bedEmg2.setTenantId("TENANT-001");
        bedRepository.save(bedEmg2);

        // Seed IPD Admissions
        IpdAdmission adm1 = IpdAdmission.builder()
                .admissionCode("IPD-2026-001")
                .uhid("UHID-2026-0001")
                .patientName("Margaret Higgins")
                .age(78)
                .gender("Female")
                .admittingDoctor("Dr. Sarah Jenkins")
                .wardId(savedIcu.getId())
                .wardName("Intensive Care Unit (ICU)")
                .bedId(savedBedIcu1.getId())
                .bedNumber("ICU-01")
                .admissionDateTime(LocalDateTime.now().minusDays(2))
                .provisionalDiagnosis("Acute Exacerbation of Congestive Heart Failure, Fluid Overload")
                .nursingNotes("Vitals monitored Q2H. Fluid restriction 1.2L/day. Urine output 1800mL in 24h. Electrolytes stable.")
                .status(IpdAdmission.AdmissionStatus.ADMITTED)
                .build();
        adm1.setTenantId("TENANT-001");
        ipdAdmissionRepository.save(adm1);

        IpdAdmission adm2 = IpdAdmission.builder()
                .admissionCode("IPD-2026-002")
                .uhid("UHID-2026-0005")
                .patientName("Beatrice Webb")
                .age(74)
                .gender("Female")
                .admittingDoctor("Dr. Marcus Vance")
                .wardId(savedPriv.getId())
                .wardName("Deluxe Private Suite")
                .admissionDateTime(LocalDateTime.now().minusDays(5))
                .provisionalDiagnosis("Elective Right Hip Arthroplasty Recovery")
                .nursingNotes("Post-op day 4. Mobilising safely with frame. Surgical wound clean and dry.")
                .status(IpdAdmission.AdmissionStatus.DISCHARGED)
                .dischargeDateTime(LocalDateTime.now().minusHours(4))
                .dischargeSummary("Patient successfully underwent right total hip arthroplasty. Post-operative recovery uneventful. Pain controlled with oral analgesia. Mobilising independently with frame.")
                .dischargeAdvice("Keep wound dressing dry. Suture removal in 10 days. Continue daily enoxaparin prophylaxis for 28 days.")
                .build();
        adm2.setTenantId("TENANT-001");
        ipdAdmissionRepository.save(adm2);

        // 16. Diagnostics (Laboratory & Radiology)
        DiagnosticOrder lab1 = DiagnosticOrder.builder()
                .orderNumber("LAB-2026-101")
                .uhid("UHID-2026-0001")
                .patientName("Margaret Higgins")
                .age(78)
                .gender("Female")
                .referringDoctor("Dr. Sarah Jenkins")
                .testCategory(DiagnosticOrder.TestCategory.PATHOLOGY)
                .testName("Complete Blood Count (CBC)")
                .sampleType("Whole Blood (EDTA)")
                .sampleCollectedAt(LocalDateTime.now().minusHours(8))
                .status(DiagnosticOrder.OrderStatus.COMPLETED)
                .resultValue("Hb: 13.2 g/dL | WBC: 7.4 x10^9/L | Platelets: 240 x10^9/L | Neutrophils: 64%")
                .referenceRange("Hb: 12.0-15.5 g/dL, WBC: 4.5-11.0, Platelets: 150-450")
                .unit("g/dL")
                .isAbnormal(false)
                .verifiedBy("Dr. Elena Rostova (Pathologist)")
                .completedAt(LocalDateTime.now().minusHours(6))
                .build();
        lab1.setTenantId("TENANT-001");
        diagnosticOrderRepository.save(lab1);

        DiagnosticOrder lab2 = DiagnosticOrder.builder()
                .orderNumber("LAB-2026-102")
                .uhid("UHID-2026-0001")
                .patientName("Margaret Higgins")
                .age(78)
                .gender("Female")
                .referringDoctor("Dr. Sarah Jenkins")
                .testCategory(DiagnosticOrder.TestCategory.BIOCHEMISTRY)
                .testName("NT-proBNP Cardiac Biomarker")
                .sampleType("Serum")
                .sampleCollectedAt(LocalDateTime.now().minusHours(8))
                .status(DiagnosticOrder.OrderStatus.COMPLETED)
                .resultValue("1,840 pg/mL (Significantly Elevated)")
                .referenceRange("< 300 pg/mL (Normal)")
                .unit("pg/mL")
                .isAbnormal(true)
                .verifiedBy("Dr. Elena Rostova (Pathologist)")
                .completedAt(LocalDateTime.now().minusHours(5))
                .clinicalNotes("Indicates active ventricular stretch consistent with heart failure.")
                .build();
        lab2.setTenantId("TENANT-001");
        diagnosticOrderRepository.save(lab2);

        DiagnosticOrder rad1 = DiagnosticOrder.builder()
                .orderNumber("RAD-2026-201")
                .uhid("UHID-2026-0002")
                .patientName("Arthur Pendelton")
                .age(82)
                .gender("Male")
                .referringDoctor("Dr. Alex Rivera")
                .testCategory(DiagnosticOrder.TestCategory.RADIOLOGY)
                .testName("Chest X-Ray PA View")
                .sampleType("Digital Radiograph")
                .sampleCollectedAt(LocalDateTime.now().minusHours(4))
                .status(DiagnosticOrder.OrderStatus.COMPLETED)
                .resultValue("Patchy alveolar consolidation right middle lobe consistent with acute lobar pneumonia. Heart size within normal limits. No pleural effusion.")
                .referenceRange("Normal aerated lung fields")
                .isAbnormal(true)
                .verifiedBy("Dr. R. Mehta (Consultant Radiologist)")
                .completedAt(LocalDateTime.now().minusHours(2))
                .build();
        rad1.setTenantId("TENANT-001");
        diagnosticOrderRepository.save(rad1);

        DiagnosticOrder lab3 = DiagnosticOrder.builder()
                .orderNumber("LAB-2026-103")
                .uhid("UHID-2026-0004")
                .patientName("Vikram Sharma")
                .age(54)
                .gender("Male")
                .referringDoctor("Dr. Sarah Jenkins")
                .testCategory(DiagnosticOrder.TestCategory.CARDIOLOGY)
                .testName("Cardiac High-Sensitivity Troponin-I")
                .sampleType("Serum")
                .sampleCollectedAt(LocalDateTime.now().minusMinutes(45))
                .status(DiagnosticOrder.OrderStatus.PROCESSING)
                .clinicalNotes("STAT emergency order for acute chest pain.")
                .build();
        lab3.setTenantId("TENANT-001");
        diagnosticOrderRepository.save(lab3);

        DiagnosticOrder lab4 = DiagnosticOrder.builder()
                .orderNumber("LAB-2026-104")
                .uhid("UHID-2026-0003")
                .patientName("Eleanor Vance")
                .age(69)
                .gender("Female")
                .referringDoctor("Dr. Marcus Vance")
                .testCategory(DiagnosticOrder.TestCategory.HAEMATOLOGY)
                .testName("Coagulation Screen (PT/INR/APTT)")
                .sampleType("Citrated Plasma")
                .status(DiagnosticOrder.OrderStatus.SAMPLE_COLLECTED)
                .clinicalNotes("Pre-operative PAC workup for knee replacement.")
                .build();
        lab4.setTenantId("TENANT-001");
        diagnosticOrderRepository.save(lab4);

        // 17. Pharmacy & Inventory Management
        MedicineMaster mMaster1 = MedicineMaster.builder()
                .itemCode("MED-PAR-500")
                .brandName("Paracetamol (Panadol)")
                .genericName("Acetaminophen")
                .category("Analgesic / Antipyretic")
                .dosageForm("Tablet")
                .strength("500 mg")
                .unitPrice(BigDecimal.valueOf(0.50))
                .reorderLevel(100)
                .totalStock(480)
                .build();
        mMaster1.setTenantId("TENANT-001");
        MedicineMaster savedMedMaster1 = medicineMasterRepository.save(mMaster1);

        MedicineMaster mMaster2 = MedicineMaster.builder()
                .itemCode("MED-AMX-500")
                .brandName("Amoxicillin (Amoxil)")
                .genericName("Amoxicillin Trihydrate")
                .category("Antibiotic")
                .dosageForm("Capsule")
                .strength("500 mg")
                .unitPrice(BigDecimal.valueOf(1.80))
                .reorderLevel(50)
                .totalStock(220)
                .build();
        mMaster2.setTenantId("TENANT-001");
        MedicineMaster savedMedMaster2 = medicineMasterRepository.save(mMaster2);

        MedicineMaster mMaster3 = MedicineMaster.builder()
                .itemCode("MED-RAM-005")
                .brandName("Ramipril (Altace)")
                .genericName("Ramipril")
                .category("ACE Inhibitor / Antihypertensive")
                .dosageForm("Tablet")
                .strength("5 mg")
                .unitPrice(BigDecimal.valueOf(0.95))
                .reorderLevel(25)
                .totalStock(18) // Trigger Low Stock!
                .build();
        mMaster3.setTenantId("TENANT-001");
        MedicineMaster savedMedMaster3 = medicineMasterRepository.save(mMaster3);

        MedicineMaster mMaster4 = MedicineMaster.builder()
                .itemCode("MED-SAL-100")
                .brandName("Salbutamol Inhaler (Ventolin)")
                .genericName("Salbutamol Sulfate")
                .category("Bronchodilator")
                .dosageForm("Inhaler")
                .strength("100 mcg (200 doses)")
                .unitPrice(BigDecimal.valueOf(8.50))
                .reorderLevel(15)
                .totalStock(65)
                .build();
        mMaster4.setTenantId("TENANT-001");
        MedicineMaster savedMedMaster4 = medicineMasterRepository.save(mMaster4);

        MedicineMaster mMaster5 = MedicineMaster.builder()
                .itemCode("MED-FUR-040")
                .brandName("Furosemide (Lasix)")
                .genericName("Furosemide")
                .category("Loop Diuretic")
                .dosageForm("Tablet")
                .strength("40 mg")
                .unitPrice(BigDecimal.valueOf(0.60))
                .reorderLevel(50)
                .totalStock(310)
                .build();
        mMaster5.setTenantId("TENANT-001");
        MedicineMaster savedMedMaster5 = medicineMasterRepository.save(mMaster5);

        // Batches with expiry dates
        MedicineBatch b1 = MedicineBatch.builder().medicineId(savedMedMaster1.getId()).medicineName("Paracetamol (Panadol)").batchNumber("B-PAR-2401").manufactureDate(LocalDate.of(2024, 1, 15)).expiryDate(LocalDate.of(2027, 1, 15)).quantity(350).purchasePrice(BigDecimal.valueOf(0.25)).supplier("GlaxoSmithKline").build();
        b1.setTenantId("TENANT-001");
        medicineBatchRepository.save(b1);

        MedicineBatch b2 = MedicineBatch.builder().medicineId(savedMedMaster1.getId()).medicineName("Paracetamol (Panadol)").batchNumber("B-PAR-2309").manufactureDate(LocalDate.of(2023, 9, 1)).expiryDate(LocalDate.now().plusDays(18)).quantity(130).purchasePrice(BigDecimal.valueOf(0.22)).supplier("GlaxoSmithKline").build(); // Expiring soon (<30 days)
        b2.setTenantId("TENANT-001");
        medicineBatchRepository.save(b2);

        MedicineBatch b3 = MedicineBatch.builder().medicineId(savedMedMaster2.getId()).medicineName("Amoxicillin (Amoxil)").batchNumber("B-AMX-2402").manufactureDate(LocalDate.of(2024, 3, 10)).expiryDate(LocalDate.of(2026, 12, 30)).quantity(220).purchasePrice(BigDecimal.valueOf(0.90)).supplier("Sandoz Pharma").build();
        b3.setTenantId("TENANT-001");
        medicineBatchRepository.save(b3);

        MedicineBatch b4 = MedicineBatch.builder().medicineId(savedMedMaster3.getId()).medicineName("Ramipril (Altace)").batchNumber("B-RAM-2405").manufactureDate(LocalDate.of(2024, 5, 20)).expiryDate(LocalDate.of(2026, 8, 15)).quantity(18).purchasePrice(BigDecimal.valueOf(0.45)).supplier("Pfizer").build();
        b4.setTenantId("TENANT-001");
        medicineBatchRepository.save(b4);

        // Sample Dispensation
        PharmacyDispensation disp1 = PharmacyDispensation.builder()
                .dispensationCode("DISP-2026-001")
                .uhid("UHID-2026-0001")
                .patientName("Margaret Higgins")
                .prescriptionRef("OPD-RX-101")
                .medicineName("Paracetamol 500mg")
                .batchNumber("B-PAR-2401")
                .quantityDispensed(20)
                .unitPrice(BigDecimal.valueOf(0.50))
                .totalAmount(BigDecimal.valueOf(10.00))
                .dispensedBy("Clara Baker (Lead Pharmacist)")
                .dispensedAt(LocalDateTime.now().minusHours(2))
                .build();
        disp1.setTenantId("TENANT-001");
        pharmacyDispensationRepository.save(disp1);

        // 18. Operation Theatre (OT) & Blood Bank
        OperationTheatreBooking ot1 = OperationTheatreBooking.builder()
                .bookingCode("OT-2026-01")
                .otRoom("OT Suite 1 (Major Ortho)")
                .surgeryName("Right Total Knee Replacement (TKR)")
                .uhid("UHID-2026-0003")
                .patientName("Eleanor Vance")
                .age(69)
                .gender("Female")
                .leadSurgeon("Dr. Marcus Vance (FRCS Orth)")
                .anaesthetist("Dr. A. Taylor")
                .scheduledDateTime(LocalDateTime.now().plusDays(2).withHour(9).withMinute(0))
                .pacStatus(OperationTheatreBooking.PacStatus.CLEARED)
                .status(OperationTheatreBooking.SurgeryStatus.SCHEDULED)
                .operativeNotes("Prosthesis sized and verified. 2 units PRBC cross-matched and reserved.")
                .build();
        ot1.setTenantId("TENANT-001");
        otBookingRepository.save(ot1);

        OperationTheatreBooking ot2 = OperationTheatreBooking.builder()
                .bookingCode("OT-2026-02")
                .otRoom("OT Suite 2 (General Surgery)")
                .surgeryName("Emergency Laparoscopic Appendectomy")
                .uhid("UHID-2026-0006")
                .patientName("Liam Davies")
                .age(28)
                .gender("Male")
                .leadSurgeon("Dr. Sarah Jenkins")
                .anaesthetist("Dr. A. Taylor")
                .scheduledDateTime(LocalDateTime.now().plusHours(4))
                .pacStatus(OperationTheatreBooking.PacStatus.CLEARED)
                .status(OperationTheatreBooking.SurgeryStatus.SCHEDULED)
                .operativeNotes("Acute appendicitis with localized peritonitis.")
                .build();
        ot2.setTenantId("TENANT-001");
        otBookingRepository.save(ot2);

        // Blood Bank Units
        BloodBankUnit bb1 = BloodBankUnit.builder().unitCode("BB-O-POS-101").bloodGroup("O+").componentType(BloodBankUnit.ComponentType.PRBC).volumeMl(350).collectionDate(LocalDate.now().minusDays(14)).expiryDate(LocalDate.now().plusDays(28)).status(BloodBankUnit.UnitStatus.AVAILABLE).build();
        bb1.setTenantId("TENANT-001");
        bloodBankUnitRepository.save(bb1);

        BloodBankUnit bb2 = BloodBankUnit.builder().unitCode("BB-O-POS-102").bloodGroup("O+").componentType(BloodBankUnit.ComponentType.PRBC).volumeMl(350).collectionDate(LocalDate.now().minusDays(20)).expiryDate(LocalDate.now().plusDays(15)).status(BloodBankUnit.UnitStatus.RESERVED).reservedForUhid("UHID-2026-0003").reservedForName("Eleanor Vance").build();
        bb2.setTenantId("TENANT-001");
        bloodBankUnitRepository.save(bb2);

        BloodBankUnit bb3 = BloodBankUnit.builder().unitCode("BB-A-POS-201").bloodGroup("A+").componentType(BloodBankUnit.ComponentType.PRBC).volumeMl(350).collectionDate(LocalDate.now().minusDays(10)).expiryDate(LocalDate.now().plusDays(32)).status(BloodBankUnit.UnitStatus.AVAILABLE).build();
        bb3.setTenantId("TENANT-001");
        bloodBankUnitRepository.save(bb3);

        BloodBankUnit bb4 = BloodBankUnit.builder().unitCode("BB-B-POS-301").bloodGroup("B+").componentType(BloodBankUnit.ComponentType.FFP).volumeMl(250).collectionDate(LocalDate.now().minusDays(30)).expiryDate(LocalDate.now().plusDays(150)).status(BloodBankUnit.UnitStatus.AVAILABLE).build();
        bb4.setTenantId("TENANT-001");
        bloodBankUnitRepository.save(bb4);

        BloodBankUnit bb5 = BloodBankUnit.builder().unitCode("BB-AB-NEG-401").bloodGroup("AB-").componentType(BloodBankUnit.ComponentType.PLATELETS).volumeMl(200).collectionDate(LocalDate.now().minusDays(1)).expiryDate(LocalDate.now().plusDays(4)).status(BloodBankUnit.UnitStatus.AVAILABLE).build();
        bb5.setTenantId("TENANT-001");
        bloodBankUnitRepository.save(bb5);

        // ==========================================
        // 19. Epic-Grade Longitudinal EHR Seed Dataset
        // ==========================================
        Long mId = savedMargaret.getId();
        Long aId = arthur.getId();

        // 19.1. Allergies
        PatientAllergy al1 = PatientAllergy.builder().clientId(mId).allergenName("Penicillin").allergenType(PatientAllergy.AllergenType.DRUG).reaction("Anaphylaxis, diffuse urticaria, wheezing").severity(PatientAllergy.Severity.SEVERE_LIFE_THREATENING).verificationStatus(PatientAllergy.VerificationStatus.CONFIRMED).onsetDate(LocalDate.of(1998, 6, 12)).recordedBy("Dr. Sarah Jenkins").clinicalNotes("Strictly avoid all beta-lactams including amoxicillin, augmentin.").build();
        al1.setTenantId("TENANT-001");
        patientAllergyRepository.save(al1);

        PatientAllergy al2 = PatientAllergy.builder().clientId(mId).allergenName("Aspirin (Acetylsalicylic Acid)").allergenType(PatientAllergy.AllergenType.DRUG).reaction("Severe dyspepsia, gastric erosion").severity(PatientAllergy.Severity.MODERATE).verificationStatus(PatientAllergy.VerificationStatus.CONFIRMED).onsetDate(LocalDate.of(2012, 3, 10)).recordedBy("Dr. Alistair Campbell").clinicalNotes("Avoid high-dose NSAIDs; paracetamol preferred.").build();
        al2.setTenantId("TENANT-001");
        patientAllergyRepository.save(al2);

        PatientAllergy al3 = PatientAllergy.builder().clientId(mId).allergenName("Natural Rubber Latex").allergenType(PatientAllergy.AllergenType.LATEX).reaction("Contact dermatitis, local erythema").severity(PatientAllergy.Severity.MILD).verificationStatus(PatientAllergy.VerificationStatus.CONFIRMED).onsetDate(LocalDate.of(2018, 9, 1)).recordedBy("Clara Oswald, RN").build();
        al3.setTenantId("TENANT-001");
        patientAllergyRepository.save(al3);

        PatientAllergy al4 = PatientAllergy.builder().clientId(aId).allergenName("Sulfonamides (Bactrim / Septra)").allergenType(PatientAllergy.AllergenType.DRUG).reaction("Erythematous maculopapular rash").severity(PatientAllergy.Severity.MODERATE).verificationStatus(PatientAllergy.VerificationStatus.CONFIRMED).onsetDate(LocalDate.of(2005, 11, 20)).recordedBy("Dr. Fiona Gallagher").build();
        al4.setTenantId("TENANT-001");
        patientAllergyRepository.save(al4);

        // 19.2. Problem List (ICD-10 Diagnoses)
        PatientProblem pr1 = PatientProblem.builder().clientId(mId).icdCode("I50.9").snomedCode("84114007").problemName("Heart failure, unspecified (NYHA Class II)").status(PatientProblem.ProblemStatus.CHRONIC).priority(PatientProblem.Priority.PRIMARY).onsetDate(LocalDate.of(2021, 8, 15)).diagnosingClinician("Dr. Sarah Jenkins (Cardiology)").clinicalNotes("Preserved ejection fraction (HFpEF, LVEF 52%). Stable on loop diuresis.").build();
        pr1.setTenantId("TENANT-001");
        patientProblemRepository.save(pr1);

        PatientProblem pr2 = PatientProblem.builder().clientId(mId).icdCode("M17.0").snomedCode("239872002").problemName("Primary osteoarthritis of both knees").status(PatientProblem.ProblemStatus.CHRONIC).priority(PatientProblem.Priority.SECONDARY).onsetDate(LocalDate.of(2017, 2, 10)).diagnosingClinician("Dr. Alistair Campbell").clinicalNotes("Bilateral crepitus. Uses wheeled walking frame outdoors.").build();
        pr2.setTenantId("TENANT-001");
        patientProblemRepository.save(pr2);

        PatientProblem pr3 = PatientProblem.builder().clientId(mId).icdCode("I10").snomedCode("38341003").problemName("Essential (primary) hypertension").status(PatientProblem.ProblemStatus.CHRONIC).priority(PatientProblem.Priority.SECONDARY).onsetDate(LocalDate.of(2010, 5, 14)).diagnosingClinician("Dr. Alistair Campbell").clinicalNotes("Controlled with ACE inhibitor therapy.").build();
        pr3.setTenantId("TENANT-001");
        patientProblemRepository.save(pr3);

        PatientProblem pr4 = PatientProblem.builder().clientId(aId).icdCode("E11.9").snomedCode("44054006").problemName("Type 2 diabetes mellitus without complications").status(PatientProblem.ProblemStatus.CHRONIC).priority(PatientProblem.Priority.PRIMARY).onsetDate(LocalDate.of(2014, 3, 22)).diagnosingClinician("Dr. Fiona Gallagher").build();
        pr4.setTenantId("TENANT-001");
        patientProblemRepository.save(pr4);

        PatientProblem pr5 = PatientProblem.builder().clientId(aId).icdCode("I63.9").snomedCode("230690007").problemName("Cerebral infarction (Stroke) with residual left hemiparesis").status(PatientProblem.ProblemStatus.CHRONIC).priority(PatientProblem.Priority.PRIMARY).onsetDate(LocalDate.of(2023, 1, 18)).diagnosingClinician("Dr. Marcus Vance (Neurology)").build();
        pr5.setTenantId("TENANT-001");
        patientProblemRepository.save(pr5);

        // 19.3. Medications & Med Rec
        PatientMedication pMed1 = PatientMedication.builder().clientId(mId).medicationName("Furosemide").genericName("Furosemide").dose("40 mg").route(PatientMedication.Route.ORAL).frequency(PatientMedication.Frequency.ONCE_DAILY).indication("Congestive Heart Failure Volume Overload").reconciliationStatus(PatientMedication.ReconciliationStatus.INPATIENT_ACTIVE).startDate(LocalDate.of(2024, 1, 15)).prescribedBy("Dr. Sarah Jenkins").instructions("1 tablet each morning with food.").build();
        pMed1.setTenantId("TENANT-001");
        patientMedicationRepository.save(pMed1);

        PatientMedication pMed2 = PatientMedication.builder().clientId(mId).medicationName("Ramipril").genericName("Ramipril").dose("5 mg").route(PatientMedication.Route.ORAL).frequency(PatientMedication.Frequency.ONCE_DAILY).indication("Hypertension & Cardioprotection").reconciliationStatus(PatientMedication.ReconciliationStatus.INPATIENT_ACTIVE).startDate(LocalDate.of(2023, 6, 10)).prescribedBy("Dr. Sarah Jenkins").instructions("1 tablet at bedtime.").build();
        pMed2.setTenantId("TENANT-001");
        patientMedicationRepository.save(pMed2);

        PatientMedication pMed3 = PatientMedication.builder().clientId(mId).medicationName("Paracetamol").genericName("Acetaminophen").dose("500 mg").route(PatientMedication.Route.ORAL).frequency(PatientMedication.Frequency.AS_NEEDED_PRN).indication("Bilateral knee osteoarthritic pain").reconciliationStatus(PatientMedication.ReconciliationStatus.HOME_MED).startDate(LocalDate.of(2022, 9, 1)).prescribedBy("Dr. Alistair Campbell").instructions("1-2 tablets up to QDS PRN. Max 4g/24h.").build();
        pMed3.setTenantId("TENANT-001");
        patientMedicationRepository.save(pMed3);

        PatientMedication pMed4 = PatientMedication.builder().clientId(mId).medicationName("Atorvastatin").genericName("Atorvastatin Calcium").dose("20 mg").route(PatientMedication.Route.ORAL).frequency(PatientMedication.Frequency.ONCE_DAILY).indication("Hyperlipidemia & CV risk reduction").reconciliationStatus(PatientMedication.ReconciliationStatus.INPATIENT_ACTIVE).startDate(LocalDate.of(2023, 6, 10)).prescribedBy("Dr. Sarah Jenkins").instructions("1 tablet at night.").build();
        pMed4.setTenantId("TENANT-001");
        patientMedicationRepository.save(pMed4);

        PatientMedication pMed5 = PatientMedication.builder().clientId(aId).medicationName("Metformin Hydrochloride").genericName("Metformin").dose("500 mg").route(PatientMedication.Route.ORAL).frequency(PatientMedication.Frequency.TWICE_DAILY).indication("Type 2 Diabetes Mellitus").reconciliationStatus(PatientMedication.ReconciliationStatus.HOME_MED).startDate(LocalDate.of(2020, 4, 12)).prescribedBy("Dr. Fiona Gallagher").instructions("Take with breakfast and evening meal.").build();
        pMed5.setTenantId("TENANT-001");
        patientMedicationRepository.save(pMed5);

        // 19.4. Immunizations Registry
        PatientImmunization imm1 = PatientImmunization.builder().clientId(mId).vaccineName("COVID-19 mRNA (Comirnaty Bivalent Booster)").cvxCode("CVX-229").doseNumber(4).administrationDate(LocalDate.of(2025, 10, 18)).manufacturer("Pfizer-BioNTech").lotNumber("LOT-PF-9941").site("Left Deltoid IM").administeredBy("Clara Oswald, RN").status(PatientImmunization.ImmunizationStatus.ADMINISTERED).notes("Tolerated well. 15-min post-observation unremarkable.").build();
        imm1.setTenantId("TENANT-001");
        patientImmunizationRepository.save(imm1);

        PatientImmunization imm2 = PatientImmunization.builder().clientId(mId).vaccineName("Influenza Quadrivalent (Fluarix)").cvxCode("CVX-150").doseNumber(1).administrationDate(LocalDate.of(2025, 11, 4)).manufacturer("GSK Biologicals").lotNumber("LOT-GSK-3210").site("Right Deltoid IM").administeredBy("Clara Oswald, RN").status(PatientImmunization.ImmunizationStatus.ADMINISTERED).build();
        imm2.setTenantId("TENANT-001");
        patientImmunizationRepository.save(imm2);

        PatientImmunization imm3 = PatientImmunization.builder().clientId(mId).vaccineName("Pneumococcal Conjugate 20-valent (Prevnar 20)").cvxCode("CVX-216").doseNumber(1).administrationDate(LocalDate.of(2024, 3, 14)).manufacturer("Pfizer").lotNumber("LOT-PCV-781").site("Left Deltoid IM").administeredBy("Dr. Alistair Campbell").status(PatientImmunization.ImmunizationStatus.ADMINISTERED).build();
        imm3.setTenantId("TENANT-001");
        patientImmunizationRepository.save(imm3);

        PatientImmunization imm4 = PatientImmunization.builder().clientId(mId).vaccineName("Shingles Recombinant (Shingrix) Dose 1").cvxCode("CVX-187").doseNumber(1).administrationDate(LocalDate.of(2024, 5, 20)).manufacturer("GSK").lotNumber("LOT-SHX-551").site("Right Deltoid IM").administeredBy("Dr. Alistair Campbell").status(PatientImmunization.ImmunizationStatus.ADMINISTERED).build();
        imm4.setTenantId("TENANT-001");
        patientImmunizationRepository.save(imm4);

        // 19.5. Procedures & Surgeries
        PatientProcedure proc1 = PatientProcedure.builder().clientId(mId).procedureName("Diagnostic 2D Echocardiography & Color Doppler").cptCode("93306").category(PatientProcedure.ProcedureCategory.DIAGNOSTIC).procedureDate(LocalDate.of(2026, 10, 15)).leadSurgeon("Dr. Sarah Jenkins").location("Cardiology Non-Invasive Lab").findings("LVEF 52%. Concentric LV remodeling. Grade 1 diastolic dysfunction. Trace mitral regurgitation.").build();
        proc1.setTenantId("TENANT-001");
        patientProcedureRepository.save(proc1);

        PatientProcedure proc2 = PatientProcedure.builder().clientId(mId).procedureName("Right Total Knee Arthroplasty (TKA)").cptCode("27447").category(PatientProcedure.ProcedureCategory.SURGICAL).procedureDate(LocalDate.of(2022, 11, 10)).leadSurgeon("Mr. David Montgomery, FRCS").anesthesiologist("Dr. Sterling").location("Kensington Surgical Wing").findings("Severe tricompartmental osteoarthritis. Cemented cruciate-retaining prosthesis implanted.").complications("None. Uncomplicated primary recovery.").build();
        proc2.setTenantId("TENANT-001");
        patientProcedureRepository.save(proc2);

        // 19.6. Past Medical, Family & Social Histories
        PastMedicalHistory pmh1 = PastMedicalHistory.builder().clientId(mId).conditionName("Transient Ischemic Attack (TIA)").onsetDate(LocalDate.of(2019, 2, 11)).status("RESOLVED").notes("Brief right arm weakness resolving in 20 min. MRI brain negative for acute infarction.").build();
        pmh1.setTenantId("TENANT-001");
        pastMedicalHistoryRepository.save(pmh1);

        PastMedicalHistory pmh2 = PastMedicalHistory.builder().clientId(mId).conditionName("Mild Cognitive Impairment (MCI)").onsetDate(LocalDate.of(2023, 4, 5)).status("ACTIVE").notes("MoCA score 24/30. Preserves independent daily function with verbal prompts.").build();
        pmh2.setTenantId("TENANT-001");
        pastMedicalHistoryRepository.save(pmh2);

        FamilyHistory fh1 = FamilyHistory.builder().clientId(mId).relationship("MOTHER").conditionName("Ischemic Heart Disease & Congestive Heart Failure").ageOfOnset(72).isDeceased(true).notes("Passed away at age 81 from acute pulmonary edema.").build();
        fh1.setTenantId("TENANT-001");
        familyHistoryRepository.save(fh1);

        FamilyHistory fh2 = FamilyHistory.builder().clientId(mId).relationship("FATHER").conditionName("Colorectal Adenocarcinoma").ageOfOnset(68).isDeceased(true).notes("Underwent partial hemicolectomy.").build();
        fh2.setTenantId("TENANT-001");
        familyHistoryRepository.save(fh2);

        SocialHistory sh1 = SocialHistory.builder().clientId(mId).tobaccoStatus("FORMER_SMOKER").packsPerDay(0.5).smokingYears(15).alcoholUse("OCCASIONAL").alcoholUnitsPerWeek(2).physicalActivity("LIGHT_WALKING").occupation("Retired Headteacher (Primary Education)").livingSituation("LIVES_ALONE").notes("Son Robert lives 2 miles away and holds Power of Attorney. Independent with bathing with grab rails.").build();
        sh1.setTenantId("TENANT-001");
        socialHistoryRepository.save(sh1);

        // 19.7. Clinical Notes (SOAP Documentation)
        ClinicalNote note1 = ClinicalNote.builder()
                .clientId(mId)
                .noteType(ClinicalNote.NoteType.SOAP_NOTE)
                .title("Comprehensive Outpatient Cardiology Review Note")
                .authorName("Dr. Sarah Jenkins")
                .authorRole("Attending Cardiologist")
                .signedAt(Instant.now().minusSeconds(86400))
                .status(ClinicalNote.NoteStatus.FINAL_SIGNED)
                .subjective("Margaret presents for outpatient review of congestive heart failure. Reports improved exertional dyspnoea since titrating Furosemide to 40mg daily. Orthopnoea reduced to 1 pillow. Denies chest pain, presyncope, or acute paroxysmal nocturnal dyspnoea.")
                .objective("Gen: Alert, comfortable at rest. BP: 138/86 mmHg | HR: 74 bpm regular | SpO2: 97% on room air | Weight: 68.4 kg (dry weight maintained). JVP not elevated. Chest: Bilateral vesicular breath sounds, no basal crackles. CVS: S1+S2 present, soft II/VI systolic murmur at apex. Extremities: Trace bilateral ankle oedema.")
                .assessment("1. Congestive Heart Failure, NYHA Class II (HFpEF) - Well compensated on current diuresis and ACE-inhibition.\n2. Essential Hypertension - Blood pressure within target range (<140/90).\n3. Bilateral Knee Osteoarthritis - Stable on PRN paracetamol and mobility frame.")
                .plan("1. Continue Furosemide 40mg PO OD morning and Ramipril 5mg PO OD night.\n2. Serum electrolytes and renal panel (U&Es) booked for next week.\n3. Daily morning weight monitoring; contact clinic if weight rises >1.5kg in 48 hours.\n4. Routine follow-up in 3 months.")
                .build();
        note1.setTenantId("TENANT-001");
        clinicalNoteRepository.save(note1);

        ClinicalNote note2 = ClinicalNote.builder()
                .clientId(mId)
                .noteType(ClinicalNote.NoteType.PROGRESS_NOTE)
                .title("Nursing Multidisciplinary Shift Progress Note")
                .authorName("Clara Oswald, RN")
                .authorRole("Clinical Ward Nurse")
                .signedAt(Instant.now().minusSeconds(36000))
                .status(ClinicalNote.NoteStatus.FINAL_SIGNED)
                .subjective("Client reports feeling well-rested. No morning dizziness upon sitting.")
                .objective("Morning vitals: BP 132/82 mmHg | HR 72 bpm | SpO2 98% | Temp 36.6Â°C. Morning medications administered without difficulty.")
                .assessment("Patient stable, compliant with treatment regimen, safe mobilization with frame.")
                .plan("Encourage 1.5L fluid balance target. Continue physiotherapy knee mobility exercises.")
                .build();
        note2.setTenantId("TENANT-001");
        clinicalNoteRepository.save(note2);

        // 19.8. Clinical Documents & Attachments
        ClinicalDocument doc1 = ClinicalDocument.builder()
                .clientId(mId)
                .title("12-Lead Diagnostic Electrocardiogram (ECG)")
                .documentCategory(ClinicalDocument.DocumentCategory.LAB_REPORT)
                .documentDate(LocalDate.now().minusDays(10))
                .fileName("ECG_Margaret_Higgins_2026.pdf")
                .mimeType("application/pdf")
                .fileSizeKb(340)
                .authorOrSource("Kensington Cardiology Non-Invasive Dept")
                .summary("Normal sinus rhythm at 74 bpm. Normal axis. Non-specific ST-T wave changes in lateral leads, unchanged compared to previous ECG.")
                .build();
        doc1.setTenantId("TENANT-001");
        clinicalDocumentRepository.save(doc1);

        ClinicalDocument doc2 = ClinicalDocument.builder()
                .clientId(mId)
                .title("Comprehensive 2D Echocardiography Scan Report")
                .documentCategory(ClinicalDocument.DocumentCategory.RADIOLOGY_SCAN)
                .documentDate(LocalDate.now().minusMonths(1))
                .fileName("ECHO_Report_Higgins.pdf")
                .mimeType("application/pdf")
                .fileSizeKb(1250)
                .authorOrSource("St. Mary's Imaging Institute")
                .summary("Preserved systolic ejection fraction (LVEF 52%). Normal chamber dimensions. Concentric left ventricular remodeling.")
                .build();
        doc2.setTenantId("TENANT-001");
        clinicalDocumentRepository.save(doc2);

        // 20. Virtual Ward / Hospital-at-Home Seeding (Benchmark: AlayaCare & Epic)
        VirtualWardStay vwStay = VirtualWardStay.builder()
                .clientId(mId)
                .clientName("Margaret Higgins")
                .hospitalAdmissionId(1L)
                .virtualWardName("Frailty & Step-Down Virtual Ward")
                .admittingConsultant("Dr. Sarah Jenkins (Consultant Geriatrician)")
                .leadCommunityNurse("Clara Oswald, RN")
                .admissionDate(LocalDate.now().minusDays(5))
                .targetDischargeDate(LocalDate.now().plusDays(2))
                .status("STABLE")
                .acuityLevel("MEDIUM")
                .telemetryDeviceId("RPM-DOCK-8841")
                .latestSpo2(96)
                .latestHeartRate(74)
                .latestBloodPressure("124/82")
                .latestTemperature(36.8)
                .lastRemoteRoundTime(LocalDateTime.now().minusHours(4))
                .remoteRoundNotes("Daily virtual round completed. Biometric trends stable. Edema resolving on Furosemide 40mg. Mobility safe with zimmer frame.")
                .clinicalPlan("Step down to standard domiciliary visits upon completion of 7-day remote telemetry monitoring.")
                .build();
        vwStay.setTenantId("TENANT-001");
        virtualWardRepository.save(vwStay);

        // 21. Wound Care & Tissue Viability Seeding (Benchmark: Birdie, PASS Care, Cerner)
        WoundAssessment wound1 = WoundAssessment.builder()
                .clientId(mId)
                .woundNumber("WOUND-01")
                .anatomicalLocation("Sacrum")
                .woundType("PRESSURE_ULCER")
                .stage("STAGE_2")
                .lengthCm(2.2)
                .widthCm(1.5)
                .depthCm(0.3)
                .exudateType("SEROUS")
                .exudateAmount("LOW")
                .tissueType("GRANULATION")
                .dressingType("Aquacel Ag Silver Hydrofiber & Mepilex Border Sacrum")
                .dressingFrequency("EVERY_3_DAYS")
                .healingStatus("IMPROVING")
                .assessedBy("Clara Oswald, RN (Tissue Viability Nurse)")
                .assessmentDate(LocalDate.now().minusDays(1))
                .clinicalNotes("Sacral pressure ulcer showing healthy pink granulation bed. Exudate minimal. Skin barrier film applied to periwound skin.")
                .build();
        wound1.setTenantId("TENANT-001");
        woundAssessmentRepository.save(wound1);

        // 22. Hydration, Nutrition & Fluid Balance (Benchmark: Birdie, PASS Care & Epic)
        FluidBalanceEntry fb1 = FluidBalanceEntry.builder()
                .clientId(mId)
                .entryType("INTAKE")
                .volumeMl(250)
                .fluidDescription("Cup of Tea with skimmed milk")
                .recordedAt(LocalDateTime.now().withHour(8).withMinute(30))
                .recordedBy("Emily Watson (Senior Carer)")
                .targetDailyVolumeMl(1800)
                .dietTexture("REGULAR")
                .fluidThickness("NORMAL")
                .notes("Ingested full cup without coughing or hesitation.")
                .build();
        fb1.setTenantId("TENANT-001");
        fluidBalanceRepository.save(fb1);

        FluidBalanceEntry fb2 = FluidBalanceEntry.builder()
                .clientId(mId)
                .entryType("INTAKE")
                .volumeMl(200)
                .fluidDescription("Fresh Water")
                .recordedAt(LocalDateTime.now().withHour(11).withMinute(15))
                .recordedBy("Emily Watson (Senior Carer)")
                .targetDailyVolumeMl(1800)
                .dietTexture("REGULAR")
                .fluidThickness("NORMAL")
                .notes("Hydration prompt during morning transfer.")
                .build();
        fb2.setTenantId("TENANT-001");
        fluidBalanceRepository.save(fb2);

        FluidBalanceEntry fb3 = FluidBalanceEntry.builder()
                .clientId(mId)
                .entryType("INTAKE")
                .volumeMl(300)
                .fluidDescription("Ensure Plus High-Protein Nutritional Shake")
                .recordedAt(LocalDateTime.now().withHour(13).withMinute(0))
                .recordedBy("Emily Watson (Senior Carer)")
                .targetDailyVolumeMl(1800)
                .dietTexture("REGULAR")
                .fluidThickness("NORMAL")
                .notes("Taken with lunch to support tissue healing.")
                .build();
        fb3.setTenantId("TENANT-001");
        fluidBalanceRepository.save(fb3);

        FluidBalanceEntry fb4 = FluidBalanceEntry.builder()
                .clientId(mId)
                .entryType("OUTPUT")
                .volumeMl(450)
                .fluidDescription("Urine Output (Urinary Drainage Bag)")
                .recordedAt(LocalDateTime.now().withHour(13).withMinute(15))
                .recordedBy("Emily Watson (Senior Carer)")
                .targetDailyVolumeMl(1800)
                .notes("Clear straw-colored urine. Post-diuretic diuresis satisfactory.")
                .build();
        fb4.setTenantId("TENANT-001");
        fluidBalanceRepository.save(fb4);

        // 23. Carer Skills & Competency Matrix (Benchmark: AlayaCare & Homecare Homebase)
        String[] emilySkills = {"PEG_FEEDING", "CATHETER_CARE", "INSULIN_ADMINISTRATION", "DEMENTIA_TIER_3", "TWO_PERSON_HOIST"};
        for (String s : emilySkills) {
            CarerSkill cs = CarerSkill.builder()
                    .userId(carer1.getId())
                    .carerName("Emily Watson (Senior Carer)")
                    .skillName(s)
                    .skillCategory("CLINICAL")
                    .certificationNumber("CPD-CERT-" + Math.abs(9000 + s.hashCode() % 1000))
                    .certifiedAt(LocalDate.now().minusMonths(3))
                    .expiresAt(LocalDate.now().plusMonths(9))
                    .verifiedBy("Marcus Vance (Org Administrator)")
                    .active(true)
                    .build();
            cs.setTenantId("TENANT-001");
            carerSkillRepository.save(cs);
        }

        String[] jamesSkills = {"DEMENTIA_TIER_3", "TWO_PERSON_HOIST", "MEDICATION_ADMINISTRATION"};
        for (String s : jamesSkills) {
            CarerSkill cs = CarerSkill.builder()
                    .userId(carer2.getId())
                    .carerName("James Carter (Care Worker)")
                    .skillName(s)
                    .skillCategory("CLINICAL")
                    .certificationNumber("CPD-CERT-" + Math.abs(8000 + s.hashCode() % 1000))
                    .certifiedAt(LocalDate.now().minusMonths(2))
                    .expiresAt(LocalDate.now().plusMonths(10))
                    .verifiedBy("Marcus Vance (Org Administrator)")
                    .active(true)
                    .build();
            cs.setTenantId("TENANT-001");
            carerSkillRepository.save(cs);
        }

        // 25. Emergency Department & Trauma Triage (Benchmark: KareXpert, MocDoc, Medinous)
        EmergencyTriage er1 = EmergencyTriage.builder()
                .triageNumber("ER-2026-0041")
                .patientName("David Miller")
                .uhid("UHID-2026-0091")
                .age(62)
                .gender("MALE")
                .arrivalDateTime(LocalDateTime.now().minusMinutes(25))
                .arrivalMode("AMBULANCE_PRE_NOTIFIED")
                .ambulanceVehicleNumber("AMB-LON-992")
                .paramedicNotes("Crushing retrosternal chest pain radiating to left jaw, diaphoresis. 12-lead ECG indicates acute inferior STEMI.")
                .chiefComplaint("Acute ST-elevation myocardial infarction with severe chest pain")
                .esiLevel(1)
                .triageColor("RED")
                .heartRate(118)
                .bloodPressure("86/54")
                .respiratoryRate(26)
                .oxygenSaturation(91)
                .temperature(36.8)
                .glasgowComaScale(14)
                .painScore(9)
                .triageNurse("Charge Nurse Clara Oswald")
                .attendingEmergencyPhysician("Dr. Robert Sterling (Emergency Consultant)")
                .status("IN_RESUSCITATION")
                .assignedBay("Resuscitation Bay 1")
                .clinicalInterventions("High-flow oxygen, dual antiplatelet load (Aspirin 300mg + Ticagrelor 180mg), IV access established, Cath Lab alerted.")
                .build();
        er1.setTenantId("TENANT-001");
        emergencyTriageRepository.save(er1);

        EmergencyTriage er2 = EmergencyTriage.builder()
                .triageNumber("ER-2026-0042")
                .patientName("Sophie Turner")
                .uhid("UHID-2026-0092")
                .age(29)
                .gender("FEMALE")
                .arrivalDateTime(LocalDateTime.now().minusMinutes(45))
                .arrivalMode("AMBULANCE_PRE_NOTIFIED")
                .ambulanceVehicleNumber("AMB-LON-814")
                .paramedicNotes("Motor vehicle collision, high speed impact. Restrained driver. Airbag deployed.")
                .chiefComplaint("Blunt chest trauma, suspected pelvic fracture, left clavicle deformity")
                .esiLevel(2)
                .triageColor("ORANGE")
                .heartRate(104)
                .bloodPressure("112/68")
                .respiratoryRate(22)
                .oxygenSaturation(96)
                .temperature(37.1)
                .glasgowComaScale(15)
                .painScore(8)
                .triageNurse("Nurse Alan Davies")
                .attendingEmergencyPhysician("Dr. Robert Sterling")
                .status("UNDER_OBSERVATION")
                .assignedBay("Trauma Bay A")
                .clinicalInterventions("Full trauma series X-rays ordered, FAST scan negative for intraperitoneal fluid, IV morphine analgesia.")
                .build();
        er2.setTenantId("TENANT-001");
        emergencyTriageRepository.save(er2);

        EmergencyTriage er3 = EmergencyTriage.builder()
                .triageNumber("ER-2026-0043")
                .patientName("George Bennett")
                .uhid("UHID-2026-0093")
                .age(48)
                .gender("MALE")
                .arrivalDateTime(LocalDateTime.now().minusMinutes(70))
                .arrivalMode("WALK_IN")
                .chiefComplaint("Severe right lower quadrant abdominal pain for 14 hours, nausea, fever")
                .esiLevel(3)
                .triageColor("YELLOW")
                .heartRate(92)
                .bloodPressure("128/82")
                .respiratoryRate(18)
                .oxygenSaturation(98)
                .temperature(38.4)
                .glasgowComaScale(15)
                .painScore(7)
                .triageNurse("Nurse Alan Davies")
                .attendingEmergencyPhysician("Dr. Sarah Jenkins")
                .status("WAITING_IN_TRIAGE")
                .assignedBay("Acute Bay 3")
                .clinicalInterventions("Blood work dispatched (FBC, CRP, LFTs), IV cannulation, surgical review requested for suspected acute appendicitis.")
                .build();
        er3.setTenantId("TENANT-001");
        emergencyTriageRepository.save(er3);

        EmergencyTriage er4 = EmergencyTriage.builder()
                .triageNumber("ER-2026-0044")
                .patientName("Incoming Patient (Elderly Male)")
                .age(79)
                .gender("MALE")
                .arrivalDateTime(LocalDateTime.now().plusMinutes(6))
                .arrivalMode("AMBULANCE_PRE_NOTIFIED")
                .ambulanceVehicleNumber("AMB-LON-319")
                .paramedicNotes("Acute severe respiratory distress, history of severe COPD. SpO2 84% on air, nebulized salbutamol in transit.")
                .chiefComplaint("Exacerbation of COPD with severe respiratory compromise")
                .esiLevel(1)
                .triageColor("RED")
                .etaMinutes(6)
                .status("PRE_ARRIVAL")
                .assignedBay("Resuscitation Bay 2 (Reserved)")
                .build();
        er4.setTenantId("TENANT-001");
        emergencyTriageRepository.save(er4);

        // 26. TPA & Cashless Insurance Claims (Benchmark: KareXpert, MocDoc, Medinous)
        InsuranceClaim claim1 = InsuranceClaim.builder()
                .claimNumber("TPA-CLM-8831")
                .uhid("UHID-2026-0001")
                .patientName("Margaret Higgins")
                .patientPhone("07700 900123")
                .insuranceCompany("Bupa Global Healthcare")
                .tpaName("Bupa In-House TPA Desk")
                .policyNumber("BUPA-UK-994120")
                .memberId("MEM-BP-001")
                .corporateName("Westminster Senior Care Scheme")
                .requestedAmount(BigDecimal.valueOf(4500.00))
                .approvedAmount(BigDecimal.valueOf(4050.00))
                .coPayPercentage(BigDecimal.valueOf(10.00))
                .deductibleAmount(BigDecimal.valueOf(150.00))
                .disallowedAmount(BigDecimal.valueOf(300.00))
                .preAuthApprovalCode("AUTH-BP-88192-A")
                .approvalDate(LocalDate.now().minusDays(5))
                .claimStatus("INITIAL_PREAUTH_APPROVED")
                .estimatedStayDays(7)
                .provisionalDiagnosis("Congestive heart failure exacerbation & step-down post-acute monitoring")
                .plannedProcedure("Inpatient telemetry, IV diuretic titration, geriatric MDT rehabilitation")
                .approvalLetterReference("REF-BUPA-DOC-9912.pdf")
                .build();
        claim1.setTenantId("TENANT-001");
        insuranceClaimRepository.save(claim1);

        InsuranceClaim claim2 = InsuranceClaim.builder()
                .claimNumber("TPA-CLM-8832")
                .uhid("UHID-2026-0002")
                .patientName("Arthur Pendelton")
                .patientPhone("07700 900456")
                .insuranceCompany("AXA Health")
                .tpaName("Medi Assist Global UK")
                .policyNumber("AXA-EXEC-7721")
                .memberId("MEM-AXA-992")
                .corporateName("Barclays Corporate Health Plan")
                .requestedAmount(BigDecimal.valueOf(2800.00))
                .approvedAmount(BigDecimal.ZERO)
                .coPayPercentage(BigDecimal.ZERO)
                .claimStatus("QUERY_RAISED")
                .estimatedStayDays(4)
                .provisionalDiagnosis("Post-operative orthopedic rehabilitation and deep tissue wound management")
                .plannedProcedure("Specialized wound dressing, inpatient physiotherapy, mobility rehabilitation")
                .queryRemarks("Please submit previous operative summary from discharging trust to verify medical necessity.")
                .build();
        claim2.setTenantId("TENANT-001");
        insuranceClaimRepository.save(claim2);

        // 27. Open Shift Broadcasting (Benchmark: AxisCare, CareSmartz360)
        OpenShiftBroadcast broadcast1 = OpenShiftBroadcast.builder()
                .clientName("Margaret Higgins")
                .clientAddress("Flat 4, Rosewood Court, London SW1P 3AA")
                .shiftDate(LocalDate.now().plusDays(1))
                .startTime("17:30")
                .endTime("20:30")
                .requiredSkills("DEMENTIA_TIER3, MEDICATION_ADMINISTRATION")
                .hourlyRate(BigDecimal.valueOf(22.50))
                .urgency("CRITICAL_SAME_DAY")
                .broadcastStatus("OPEN")
                .broadcastNotes("Regular evening carer on emergency leave. Client requires assistance with evening meal, Parkinson's Sinemet medication prompt, and transfer assist.")
                .build();
        broadcast1.setTenantId("TENANT-001");
        openShiftBroadcastRepository.save(broadcast1);

        OpenShiftBroadcast broadcast2 = OpenShiftBroadcast.builder()
                .clientName("Arthur Pendelton")
                .clientAddress("12 Bramble Lane, Westminster, London SW1V 2EE")
                .shiftDate(LocalDate.now().plusDays(2))
                .startTime("08:00")
                .endTime("11:00")
                .requiredSkills("PEG_FEEDING, HOISTING_COMPLEX")
                .hourlyRate(BigDecimal.valueOf(19.00))
                .urgency("HIGH_PRIORITY")
                .broadcastStatus("CLAIMED")
                .claimedByUserId(carer1.getId())
                .claimedByName("Emily Watson (Senior Carer)")
                .claimedAt(LocalDateTime.now().minusHours(2))
                .broadcastNotes("Morning PEG flush and hoist-assisted transfer to recliner chair.")
                .build();
        broadcast2.setTenantId("TENANT-001");
        openShiftBroadcastRepository.save(broadcast2);

        // 28. Agency CRM & Inquiries Pipeline (Benchmark: AxisCare, CareSmartz360)
        ClientLead lead1 = ClientLead.builder()
                .prospectName("Eleanor Vance")
                .contactPhone("07700 900881")
                .contactEmail("patricia.vance@gmail.com")
                .address("28 Kensington Church Street, London W8 4EP")
                .primaryContactPerson("Patricia Vance (Daughter)")
                .referralSource("HOSPITAL_DISCHARGE")
                .referringOrganisation("St. Thomas' Hospital Discharge Lounge")
                .careTypeNeeded("POST_SURGICAL_STEP_DOWN")
                .estimatedHoursPerWeek(20)
                .budgetPerHour(BigDecimal.valueOf(26.00))
                .pipelineStage("HOME_ASSESSMENT_BOOKED")
                .targetStartDate(LocalDate.now().plusDays(4))
                .homeAssessmentDateTime(LocalDateTime.now().plusDays(2).withHour(11).withMinute(0))
                .assignedAssessor("Sarah Jenkins (Care Manager)")
                .clinicalNeedsSummary("Step-down care following elective total hip replacement. Assistance required for shower transfers, compression stockings, and meal prep.")
                .build();
        lead1.setTenantId("TENANT-001");
        clientLeadRepository.save(lead1);

        ClientLead lead2 = ClientLead.builder()
                .prospectName("Harold Green")
                .contactPhone("07700 900772")
                .contactEmail("mark.davis@westminster.gov.uk")
                .address("15 Regency Street, Westminster, London SW1P 4PQ")
                .primaryContactPerson("Mark Davis (Social Worker)")
                .referralSource("LOCAL_COUNCIL")
                .referringOrganisation("Westminster Adult Social Care Services")
                .careTypeNeeded("DEMENTIA_SPECIALIST")
                .estimatedHoursPerWeek(14)
                .budgetPerHour(BigDecimal.valueOf(23.50))
                .pipelineStage("NEW_INQUIRY")
                .targetStartDate(LocalDate.now().plusWeeks(1))
                .clinicalNeedsSummary("Living alone with moderate vascular dementia. Sundowning episodes and wandering risk. Needs twice-daily prompt visits and nutrition support.")
                .build();
        lead2.setTenantId("TENANT-001");
        clientLeadRepository.save(lead2);

        // 29. Multi-Specialty EMR Consultations (Benchmark: KareXpert, Medinous)
        SpecialtyConsultation cardioNote = SpecialtyConsultation.builder()
                .uhid("UHID-2026-0001")
                .patientName("Margaret Higgins")
                .clientId(mId)
                .consultantName("Dr. James Harrison, FRCP")
                .department("Cardiology")
                .specialtyCode("CARDIOLOGY")
                .consultationDateTime(LocalDateTime.now().minusDays(3))
                .chiefComplaint("Exertional dyspnea on walking 50 meters, bilateral ankle edema, orthopnea requiring 3 pillows")
                .clinicalDiagnosis("Congestive Heart Failure NYHA Class III with Reduced Ejection Fraction (HFrEF)")
                .structuredFindingsJson("{\"nyhaClass\":\"CLASS_III\",\"lvefPercentage\":35,\"ecgRhythm\":\"Atrial Fibrillation with controlled ventricular response (HR 78)\",\"cathLabUrgency\":\"ELECTIVE\"}")
                .treatmentPlan("Up-titrate Furosemide to 40mg OM. Continue Ramipril and Bisoprolol. Fluid restriction to 1,500ml/day. Daily weight monitoring.")
                .prescribedMedications("Furosemide 40mg OM, Ramipril 5mg ON, Bisoprolol 2.5mg OM, Apixaban 5mg BD")
                .diagnosticOrders("Repeat Transthoracic Echocardiogram in 6 weeks, Serum Electrolytes & eGFR in 7 days")
                .nextFollowUpDate(LocalDate.now().plusWeeks(4))
                .build();
        cardioNote.setTenantId("TENANT-001");
        specialtyConsultationRepository.save(cardioNote);

        SpecialtyConsultation pedsNote = SpecialtyConsultation.builder()
                .uhid("UHID-2026-0044")
                .patientName("Master Leo Higgins")
                .consultantName("Dr. Alistair Campbell, MRCPCH")
                .department("Pediatrics & Child Health")
                .specialtyCode("PEDIATRICS")
                .consultationDateTime(LocalDateTime.now().minusDays(7))
                .chiefComplaint("Routine 6-year developmental assessment and mild seasonal reactive airway check")
                .clinicalDiagnosis("Normal child physical development, mild exercise-induced bronchospasm")
                .structuredFindingsJson("{\"weightKg\":21.5,\"heightCm\":117.0,\"headCircumferenceCm\":52.0,\"growthPercentile\":\"50TH_MEDIAN\",\"developmentalMilestones\":\"APPROPRIATE_FOR_AGE\"}")
                .treatmentPlan("Salbutamol 100mcg MDI via spacer 2 puffs PRN before physical activity. All routine UK childhood immunizations verified up to date.")
                .prescribedMedications("Salbutamol Inhaler 100mcg PRN with Volumatic Spacer")
                .diagnosticOrders("Peak Expiratory Flow (PEF) charting diary")
                .nextFollowUpDate(LocalDate.now().plusMonths(6))
                .build();
        pedsNote.setTenantId("TENANT-001");
        specialtyConsultationRepository.save(pedsNote);

        // 14. Audit trail seed
        auditService.record("SYSTEM_INIT", "Platform", "1", "Platform reference dataset seeded with multi-tenancy support", null, "READY");

        log.info("Care Platform data bootstrapping completed successfully!");
    }

    private User createUser(String username, String pass, String email, String fullName, Role role, Long branchId) {
        User u = User.builder()
                .username(username)
                .password(pass)
                .email(email)
                .fullName(fullName)
                .role(role)
                .branchId(branchId)
                .enabled(true)
                .lastLogin(LocalDateTime.now().minusHours(2).toInstant(java.time.ZoneOffset.UTC))
                .build();
        u.setTenantId("TENANT-001");
        return userRepository.save(u);
    }

    private void createTimelineEvent(Long clientId, String type, String title, String desc, String sev, String author) {
        CareTimelineEvent ev = CareTimelineEvent.builder()
                .clientId(clientId)
                .eventType(type)
                .title(title)
                .description(desc)
                .severity(sev)
                .recordedBy(author)
                .visibleToFamily(true)
                .build();
        ev.setTenantId("TENANT-001");
        timelineRepository.save(ev);
    }
}
