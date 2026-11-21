package com.careplatform.messaging.repository;

import com.careplatform.messaging.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByTenantIdAndClientIdOrderBySentAtAsc(String tenantId, Long clientId);
}
