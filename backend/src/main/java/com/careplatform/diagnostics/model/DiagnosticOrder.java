package com.careplatform.diagnostics.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "diagnostic_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosticOrder extends BaseTenantEntity {

    @Column(nullable = false)
    private String orderNumber;

    @Column(nullable = false)
    private String uhid;

    @Column(nullable = false)
    private String patientName;

    private Integer age;
    private String gender;

    @Column(nullable = false)
    private String referringDoctor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TestCategory testCategory;

    @Column(nullable = false)
    private String testName;

    private String sampleType; // Blood, Serum, Urine, Imaging, etc.

    private LocalDateTime sampleCollectedAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OrderStatus status = OrderStatus.ORDERED;

    @Column(length = 2000)
    private String resultValue;

    private String referenceRange;

    private String unit;

    @Builder.Default
    private Boolean isAbnormal = false;

    private String verifiedBy;

    private LocalDateTime completedAt;

    @Column(length = 2000)
    private String clinicalNotes;

    public enum TestCategory {
        PATHOLOGY, RADIOLOGY, BIOCHEMISTRY, MICROBIOLOGY, HAEMATOLOGY, CARDIOLOGY
    }

    public enum OrderStatus {
        ORDERED, SAMPLE_COLLECTED, PROCESSING, COMPLETED, CANCELLED
    }
}

