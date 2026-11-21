package com.careplatform.ehr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CdsEvaluationRequest {
    private Long clientId;
    private String proposedMedicationName;
    private Integer systolicBp;
    private Integer diastolicBp;
    private Integer heartRate;
    private Integer respiratoryRate;
    private Integer oxygenSaturation;
    private Double temperature;
    private Boolean supplementalOxygen;
    private Boolean consciousnessAlert;
}

