package com.careplatform.ehr.repository;

import com.careplatform.ehr.model.SpecialtyConsultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpecialtyConsultationRepository extends JpaRepository<SpecialtyConsultation, Long> {

    List<SpecialtyConsultation> findByTenantIdOrderByConsultationDateTimeDesc(String tenantId);

    List<SpecialtyConsultation> findByTenantIdAndUhidOrderByConsultationDateTimeDesc(String tenantId, String uhid);

    List<SpecialtyConsultation> findByTenantIdAndSpecialtyCodeOrderByConsultationDateTimeDesc(String tenantId, String specialtyCode);
}

