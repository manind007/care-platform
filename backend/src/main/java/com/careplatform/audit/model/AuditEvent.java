package com.careplatform.audit.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "audit_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditEvent extends BaseTenantEntity {

    @Column(name = "actor_username", nullable = false, length = 100)
    private String actorUsername;

    @Column(name = "actor_role", length = 50)
    private String actorRole;

    @Column(name = "action_type", nullable = false, length = 100)
    private String actionType; // e.g. "CAREPLAN_APPROVE", "MEDICATION_ADMINISTER", "INCIDENT_STATUS_CHANGE"

    @Column(name = "resource_type", nullable = false, length = 100)
    private String resourceType; // e.g. "CarePlan", "MedicationAdministration", "Visit"

    @Column(name = "resource_id", length = 100)
    private String resourceId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "SUCCESS"; // SUCCESS, FAILURE

    @Column(name = "previous_state", columnDefinition = "TEXT")
    private String previousState;

    @Column(name = "new_state", columnDefinition = "TEXT")
    private String newState;
}
