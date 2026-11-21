package com.careplatform.skills.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "carer_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarerSkill extends BaseTenantEntity {

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "carer_name", nullable = false, length = 150)
    private String carerName;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName; // e.g. "PEG_FEEDING", "CATHETER_CARE", "TRACHEOSTOMY", "INSULIN_ADMINISTRATION", "DEMENTIA_TIER_3", "TWO_PERSON_HOIST", "BUCCAL_MIDAZOLAM"

    @Column(name = "skill_category", length = 50)
    @Builder.Default
    private String skillCategory = "CLINICAL"; // CLINICAL, MOBILITY, MENTAL_HEALTH, MEDICATION, STATUTORY

    @Column(name = "certification_number", length = 100)
    private String certificationNumber;

    @Column(name = "certified_at")
    private LocalDate certifiedAt;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    @Column(name = "verified_by", length = 150)
    private String verifiedBy;

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;
}

