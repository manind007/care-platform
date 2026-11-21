package com.careplatform.ehr.model;

import com.careplatform.common.model.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "ehr_clinical_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClinicalDocument extends BaseTenantEntity {

    @Column(name = "client_id", nullable = false)
    private Long clientId;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_category", length = 40)
    @Builder.Default
    private DocumentCategory documentCategory = DocumentCategory.LAB_REPORT;

    @Column(name = "document_date")
    private LocalDate documentDate;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_size_kb")
    private Integer fileSizeKb;

    @Column(name = "author_or_source", length = 150)
    private String authorOrSource;

    @Column(columnDefinition = "TEXT")
    private String summary;

    public enum DocumentCategory {
        LAB_REPORT, RADIOLOGY_SCAN, DISCHARGE_SUMMARY, OPERATIVE_REPORT, CONSENT_FORM, REFERRAL_LETTER, EXTERNAL_RECORDS
    }
}

