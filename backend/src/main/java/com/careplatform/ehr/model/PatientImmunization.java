package com.careplatform.ehr.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "ehr_patient_immunizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientImmunization extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "vaccine_name", nullable = false, length = 150)
    private String vaccineName;

    @Column(name = "cvx_code", length = 30)
    private String cvxCode;

    @Column(name = "dose_number")
    private Integer doseNumber;

    @Column(name = "administration_date", nullable = false)
    private LocalDate administrationDate;

    @Column(length = 100)
    private String manufacturer;

    @Column(name = "lot_number", length = 50)
    private String lotNumber;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(length = 50)
    private String site; // e.g. Left Deltoid IM, Right Thigh SC

    @Column(name = "administered_by", length = 100)
    private String administeredBy;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private ImmunizationStatus status = ImmunizationStatus.ADMINISTERED;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public enum ImmunizationStatus {
        ADMINISTERED, HISTORICAL, DUE, OVERDUE, DECLINED, CONTRAINDICATED
    }
}

