package com.careplatform.ehr.repository;

import com.careplatform.ehr.model.ClinicalNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClinicalNoteRepository extends JpaRepository<ClinicalNote, Long> {
    List<ClinicalNote> findByTenantIdAndClientIdOrderBySignedAtDesc(String tenantId, Long clientId);
}

