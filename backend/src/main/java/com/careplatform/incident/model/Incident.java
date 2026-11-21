package com.careplatform.incident.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident extends BaseTenantEntity {

    @Column(name = "incident_reference", nullable = false, length = 50)
    private String incidentReference; // e.g. INC-20260917-001

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "client_name", length = 150)
    private String clientName;

    @Column(nullable = false, length = 100)
    private String category; // FALL, MEDICATION_ERROR, ACCIDENT_INJURY, SAFEGUARDING, MISSED_VISIT, COMPLAINT, NEAR_MISS

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private IncidentSeverity severity = IncidentSeverity.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private IncidentStatus status = IncidentStatus.CREATED;

    @Column(name = "incident_time", nullable = false)
    @Builder.Default
    private LocalDateTime incidentTime = LocalDateTime.now();

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String immediateActionTaken;

    @Column(columnDefinition = "TEXT")
    private String witnesses;

    @Column(columnDefinition = "TEXT")
    private String investigationNotes;

    @Column(columnDefinition = "TEXT")
    private String correctiveActions;

    @Column(name = "reported_by", length = 100)
    private String reportedBy;

    @Column(name = "assigned_investigator", length = 100)
    private String assignedInvestigator;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;
}
