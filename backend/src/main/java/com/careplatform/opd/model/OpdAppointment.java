package com.careplatform.opd.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "opd_appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpdAppointment extends BaseTenantEntity {

    @Column(nullable = false)
    private String uhid;

    @Column(nullable = false)
    private String patientName;

    private Integer age;
    private String gender;

    @Column(nullable = false)
    private String doctorName;

    private String speciality;

    private LocalDateTime appointmentTime;

    private Integer tokenNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OpdStatus status = OpdStatus.WAITING;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TriagePriority triagePriority = TriagePriority.NORMAL;

    @Column(length = 2000)
    private String chiefComplaints;

    // Vitals formatted as BP / Pulse / Temp / SpO2
    private String vitals;

    @Column(length = 1000)
    private String diagnosis;

    @Column(length = 4000)
    private String clinicalNotes;

    // JSON formatted list of prescription items
    @Column(length = 4000)
    private String prescriptionJson;

    // JSON or delimited list of investigation orders
    @Column(length = 2000)
    private String labOrdersJson;

    public enum OpdStatus {
        SCHEDULED, WAITING, IN_CONSULTATION, COMPLETED, CANCELLED
    }

    public enum TriagePriority {
        NORMAL, URGENT, EMERGENCY
    }
}
