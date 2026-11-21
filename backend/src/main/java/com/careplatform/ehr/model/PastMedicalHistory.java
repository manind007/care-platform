package com.careplatform.ehr.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "ehr_past_medical_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PastMedicalHistory extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "condition_name", nullable = false, length = 200)
    private String conditionName;

    @Column(name = "onset_date")
    private LocalDate onsetDate;

    @Column(length = 30)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, RESOLVED, INACTIVE

    @Column(columnDefinition = "TEXT")
    private String notes;
}

