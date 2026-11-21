package com.careplatform.tenant.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "organisations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organisation extends BaseTenantEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 50)
    private String registrationNumber;

    @Column(length = 100)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(length = 255)
    private String address;

    @Column(length = 50)
    private String timezone;

    @Column(name = "working_hours_start", length = 10)
    @Builder.Default
    private String workingHoursStart = "07:00";

    @Column(name = "working_hours_end", length = 10)
    @Builder.Default
    private String workingHoursEnd = "21:00";

    @Column(name = "ecm_tolerance_minutes")
    @Builder.Default
    private Integer ecmToleranceMinutes = 15;
}
