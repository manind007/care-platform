package com.careplatform.ehr.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "ehr_patient_procedures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProcedure extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "procedure_name", nullable = false, length = 200)
    private String procedureName;

    @Column(name = "cpt_code", length = 30)
    private String cptCode;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private ProcedureCategory category = ProcedureCategory.SURGICAL;

    @Column(name = "procedure_date", nullable = false)
    private LocalDate procedureDate;

    @Column(name = "lead_surgeon", length = 100)
    private String leadSurgeon;

    @Column(length = 100)
    private String anesthesiologist;

    @Column(length = 100)
    private String location; // e.g. Main Hospital OT 2, Ambulatory Surgery Center

    @Column(columnDefinition = "TEXT")
    private String findings;

    @Column(columnDefinition = "TEXT")
    private String complications;

    public enum ProcedureCategory {
        SURGICAL, INTERVENTIONAL, DIAGNOSTIC, BEDSIDE, ENDOSCOPIC
    }
}

