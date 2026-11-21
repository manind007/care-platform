package com.careplatform.careplan.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "care_plan_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarePlanVersion extends BaseTenantEntity {

    @Column(name = "care_plan_id", nullable = false)
    private Long carePlanId;

    @Column(nullable = false)
    private Integer versionNumber;

    @Column(columnDefinition = "TEXT")
    private String snapshotJson;

    @Column(name = "change_summary", length = 255)
    private String changeSummary;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;
}
