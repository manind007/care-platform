package com.careplatform.ehr.dto;

import com.careplatform.client.model.CareTimelineEvent;
import com.careplatform.client.model.Client;
import com.careplatform.ehr.model.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LongitudinalPatientRecord {
    private Client client;
    @Builder.Default
    private List<PatientAllergy> allergies = new ArrayList<>();
    @Builder.Default
    private List<PatientProblem> problems = new ArrayList<>();
    @Builder.Default
    private List<PatientMedication> medications = new ArrayList<>();
    @Builder.Default
    private List<PatientImmunization> immunizations = new ArrayList<>();
    @Builder.Default
    private List<PatientProcedure> procedures = new ArrayList<>();
    @Builder.Default
    private List<PastMedicalHistory> pastMedicalHistory = new ArrayList<>();
    @Builder.Default
    private List<FamilyHistory> familyHistory = new ArrayList<>();
    private SocialHistory socialHistory;
    @Builder.Default
    private List<ClinicalNote> clinicalNotes = new ArrayList<>();
    @Builder.Default
    private List<ClinicalDocument> clinicalDocuments = new ArrayList<>();
    @Builder.Default
    private List<CdsAlert> activeBpaAlerts = new ArrayList<>();
    @Builder.Default
    private List<CareTimelineEvent> timelineEvents = new ArrayList<>();
}

