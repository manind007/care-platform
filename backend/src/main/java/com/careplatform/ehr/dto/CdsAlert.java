package com.careplatform.ehr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CdsAlert {
    private String id;
    private String severity; // CRITICAL, WARNING, INFO
    private String title;
    private String description;
    private String recommendation;
    private String ruleCategory; // DRUG_ALLERGY, DRUG_DRUG, EARLY_WARNING_SCORE, PREVENTIVE_GAP, FALL_RISK
    @Builder.Default
    private boolean canOverride = true;
    private String overrideReason;
}

