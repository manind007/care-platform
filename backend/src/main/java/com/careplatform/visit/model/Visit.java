package com.careplatform.visit.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "visits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visit extends BaseTenantEntity {

    @Column(name = "visit_reference", nullable = false, length = 50)
    private String visitReference; // e.g. VST-20260917-001

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "client_name", length = 150)
    private String clientName;

    @Column(name = "client_address", length = 255)
    private String clientAddress;

    @Column(name = "staff_id")
    private Long staffId;

    @Column(name = "staff_name", length = 150)
    private String staffName;

    @Column(name = "care_plan_id")
    private Long carePlanId;

    @Column(name = "scheduled_start", nullable = false)
    private LocalDateTime scheduledStart;

    @Column(name = "scheduled_end", nullable = false)
    private LocalDateTime scheduledEnd;

    @Column(name = "actual_start")
    private LocalDateTime actualStart;

    @Column(name = "actual_end")
    private LocalDateTime actualEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private VisitStatus status = VisitStatus.SCHEDULED;

    @Column(name = "visit_type", length = 50)
    @Builder.Default
    private String visitType = "PERSONAL_CARE"; // PERSONAL_CARE, MEDICATION_ONLY, COMPANIONSHIP, DOMESTIC

    // Electronic Call Monitoring (ECM) fields
    @Column(name = "checkin_method", length = 30)
    private String checkInMethod; // GPS, QR_CODE, NFC, MANUAL

    @Column(name = "checkin_latitude")
    private Double checkInLatitude;

    @Column(name = "checkin_longitude")
    private Double checkInLongitude;

    @Column(name = "checkout_latitude")
    private Double checkOutLatitude;

    @Column(name = "checkout_longitude")
    private Double checkOutLongitude;

    @Column(name = "qr_verification_token", length = 100)
    private String qrVerificationToken;

    @Column(columnDefinition = "TEXT")
    private String careNotes;

    @Column(name = "is_billable")
    @Builder.Default
    private boolean billable = true;

    @Column(name = "billing_rate")
    @Builder.Default
    private Double billingRate = 25.0; // standard hourly rate in GBP/currency
}
