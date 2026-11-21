package com.careplatform.medication.dto;

import com.careplatform.medication.model.AdministrationOutcome;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RecordAdministrationRequest {
    @NotNull
    private Long clientId;

    @NotNull
    private Long medicationId;

    private Long visitId;
    private String doseGiven;

    @NotNull
    private AdministrationOutcome outcome;

    private String scheduledSlot;
    private String outcomeReason;

    private String witnessName;
    private String witnessRole;
    private String digitalSignature;
    private String topicalSiteApplied;
    private String prnReason;
    private String prnEffectiveness;
    private String escalationNotes;
}
