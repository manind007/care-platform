package com.careplatform.messaging.service;

import com.careplatform.common.tenant.TenantContext;
import com.careplatform.messaging.model.Message;
import com.careplatform.messaging.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    @Transactional(readOnly = true)
    public List<Message> getMessagesForClient(Long clientId) {
        return messageRepository.findByTenantIdAndClientIdOrderBySentAtAsc(TenantContext.getTenantId(), clientId);
    }

    @Transactional
    public Message sendMessage(Message message) {
        message.setTenantId(TenantContext.getTenantId());
        message.setSentAt(LocalDateTime.now());
        message.setRead(false);
        return messageRepository.save(message);
    }
}
