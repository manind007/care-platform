package com.careplatform.client.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "care_timeline_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareTimelineEvent extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType; // VISIT_COMPLETED, CARE_NOTE, MEDICATION_GIVEN, INCIDENT_REPORTED, ASSESSMENT_SUBMITTED

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "severity", length = 50)
    private String severity; // INFO, WARNING, CRITICAL

    @Column(name = "recorded_by", length = 100)
    private String recordedBy;

    @Column(name = "event_timestamp", nullable = false)
    @Builder.Default
    private Instant eventTimestamp = Instant.now();

    @Column(name = "visible_to_family")
    @Builder.Default
    private boolean visibleToFamily = true;
}
