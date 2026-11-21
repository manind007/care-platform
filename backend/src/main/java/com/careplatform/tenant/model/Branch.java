package com.careplatform.tenant.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "branches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch extends BaseTenantEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 100)
    private String code;

    @Column(length = 255)
    private String address;

    @Column(length = 50)
    private String phone;

    @Column(name = "organisation_id", nullable = false)
    private Long organisationId;
}
