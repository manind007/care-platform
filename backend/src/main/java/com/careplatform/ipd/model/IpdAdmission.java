package com.careplatform.ipd.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ipd_admissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IpdAdmission extends BaseTenantEntity {

    @Column(nullable = false)
    private String admissionCode;

    @Column(nullable = false)
    private String uhid;

    @Column(nullable = false)
    private String patientName;

    private Integer age;
    private String gender;

    @Column(nullable = false)
    private String admittingDoctor;

    private Long wardId;
    private String wardName;

    private Long bedId;
    private String bedNumber;

    private LocalDateTime admissionDateTime;

    @Column(length = 2000)
    private String provisionalDiagnosis;

    @Column(length = 4000)
    private String nursingNotes;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AdmissionStatus status = AdmissionStatus.ADMITTED;

    private LocalDateTime dischargeDateTime;

    @Column(length = 4000)
    private String dischargeSummary;

    @Column(length = 2000)
    private String dischargeAdvice;

    public enum AdmissionStatus {
        ADMITTED, TRANSFERRED, DISCHARGED
    }
}

