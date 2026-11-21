package com.careplatform.ehr.repository;

import com.careplatform.ehr.model.ClinicalDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClinicalDocumentRepository extends JpaRepository<ClinicalDocument, Long> {
    List<ClinicalDocument> findByTenantIdAndClientIdOrderByDocumentDateDesc(String tenantId, Long clientId);
}

