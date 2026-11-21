package com.careplatform.hospital.repository;

import com.careplatform.hospital.model.OperationTheatreBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperationTheatreBookingRepository extends JpaRepository<OperationTheatreBooking, Long> {
    List<OperationTheatreBooking> findByTenantIdOrderByScheduledDateTimeAsc(String tenantId);
    List<OperationTheatreBooking> findByTenantIdAndStatus(String tenantId, OperationTheatreBooking.SurgeryStatus status);
}

