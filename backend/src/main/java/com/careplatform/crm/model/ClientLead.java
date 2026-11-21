package com.careplatform.crm.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "client_leads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientLead extends BaseTenantEntity {

    @Column(nullable = false, length = 150)
    private String prospectName;

    @Column(nullable = false, length = 50)
    private String contactPhone;

    @Column(length = 100)
    private String contactEmail;

    @Column(length = 250)
    private String address;

    @Column(length = 80)
    private String primaryContactPerson; // e.g. "Daughter - Jennifer Smith"

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String referralSource = "HOSPITAL_DISCHARGE"; // HOSPITAL_DISCHARGE, LOCAL_COUNCIL, GP_REFERRAL, FAMILY_DIRECT, ONLINE_WEBSITE, COMMUNITY_NURSE

    @Column(length = 150)
    private String referringOrganisation; // e.g. "St. Thomas' Hospital Discharge Lounge", "Westminster Adult Social Care"

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String careTypeNeeded = "DOMICILIARY_HOURLY"; // DOMICILIARY_HOURLY, LIVE_IN_CARE, DEMENTIA_SPECIALIST, RESPITE_CARE, POST_SURGICAL_STEP_DOWN, PALLIATIVE

    private Integer estimatedHoursPerWeek;

    @Column(precision = 10, scale = 2)
    private BigDecimal budgetPerHour;

    @Column(nullable = false, length = 40)
    @Builder.Default
    private String pipelineStage = "NEW_INQUIRY"; // NEW_INQUIRY, HOME_ASSESSMENT_BOOKED, ASSESSMENT_COMPLETED, PROPOSAL_SENT, CONVERTED_TO_CLIENT, LOST

    private LocalDate targetStartDate;

    private LocalDateTime homeAssessmentDateTime;

    @Column(length = 150)
    private String assignedAssessor;

    @Column(columnDefinition = "TEXT")
    private String clinicalNeedsSummary;

    @Column(columnDefinition = "TEXT")
    private String pipelineNotes;

    private Long convertedClientId;
}

