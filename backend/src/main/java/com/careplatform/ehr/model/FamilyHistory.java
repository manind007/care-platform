package com.careplatform.ehr.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ehr_family_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyHistory extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(nullable = false, length = 50)
    private String relationship; // MOTHER, FATHER, SIBLING, MATERNAL_GRANDMOTHER, etc.

    @Column(name = "condition_name", nullable = false, length = 200)
    private String conditionName; // e.g. Early CAD, Type 2 Diabetes, Breast Cancer

    @Column(name = "age_of_onset")
    private Integer ageOfOnset;

    @Column(name = "is_deceased")
    @Builder.Default
    private Boolean isDeceased = false;

    @Column(columnDefinition = "TEXT")
    private String notes;
}

