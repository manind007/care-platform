package com.careplatform.client.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client extends BaseTenantEntity {

    @Column(name = "client_identifier", nullable = false, length = 50)
    private String clientIdentifier; // e.g. CLI-1001

    @Column(name = "uhid", length = 50)
    private String uhid; // e.g. UHID-2026-0001

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "preferred_name", length = 100)
    private String preferredName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 20)
    private String gender;

    @Column(name = "marital_status", length = 50)
    private String maritalStatus;

    @Column(name = "primary_language", length = 50)
    private String primaryLanguage;

    @Column(name = "interpreter_needed")
    @Builder.Default
    private Boolean interpreterNeeded = false;

    @Column(name = "ethnicity", length = 100)
    private String ethnicity;

    @Column(name = "primary_care_physician", length = 150)
    private String primaryCarePhysician;

    @Column(name = "payer_name", length = 150)
    private String payerName;

    @Column(name = "payer_policy_number", length = 100)
    private String payerPolicyNumber;

    @Column(name = "resuscitation_status", length = 50)
    @Builder.Default
    private String resuscitationStatus = "CPR_FULL_CODE"; // CPR_FULL_CODE, DNACPR

    @Column(length = 50)
    private String nhsNumber;

    @Column(length = 50)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 255)
    private String address;

    @Column(length = 20)
    private String postcode;

    @Column(name = "key_safe_code", length = 50)
    private String keySafeCode;

    @Column(columnDefinition = "TEXT")
    private String medicalHistory;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(columnDefinition = "TEXT")
    private String carePreferences;

    @Column(length = 50)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, PENDING_ASSESSMENT, ON_HOLD, DISCHARGED

    @Column(name = "funding_type", length = 50)
    @Builder.Default
    private String fundingType = "LOCAL_AUTHORITY"; // LOCAL_AUTHORITY, PRIVATE, NHS_CHC

    @Column(name = "branch_id")
    private Long branchId;

    @Column(name = "assigned_manager_id")
    private Long assignedManagerId;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<EmergencyContact> emergencyContacts = new ArrayList<>();
}
