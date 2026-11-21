package com.careplatform.hospital.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "hospital_ot_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperationTheatreBooking extends BaseTenantEntity {

    @Column(nullable = false)
    private String bookingCode;

    @Column(nullable = false)
    private String otRoom; // e.g. OT-1 (Major Cardiac), OT-2 (Orthopaedic)

    @Column(nullable = false)
    private String surgeryName;

    @Column(nullable = false)
    private String uhid;

    @Column(nullable = false)
    private String patientName;

    private Integer age;
    private String gender;

    @Column(nullable = false)
    private String leadSurgeon;

    private String anaesthetist;

    @Column(nullable = false)
    private LocalDateTime scheduledDateTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PacStatus pacStatus = PacStatus.CLEARED;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SurgeryStatus status = SurgeryStatus.SCHEDULED;

    @Column(length = 4000)
    private String operativeNotes;

    public enum PacStatus {
        PENDING, CLEARED, REJECTED
    }

    public enum SurgeryStatus {
        SCHEDULED, IN_PROGRESS, RECOVERY, COMPLETED, CANCELLED
    }
}

