package com.careplatform.client.model;

import com.careplatform.common.model.BaseTenantEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "emergency_contacts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyContact extends BaseTenantEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    @JsonIgnore
    private Client client;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 50)
    private String relationship;

    @Column(length = 50)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(name = "is_primary")
    @Builder.Default
    private boolean primary = false;

    @Column(name = "has_portal_access")
    @Builder.Default
    private boolean hasPortalAccess = false;
}
