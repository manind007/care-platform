package com.careplatform.messaging.controller;

import com.careplatform.common.security.UserPrincipal;
import com.careplatform.messaging.model.Message;
import com.careplatform.messaging.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
@Tag(name = "Messaging", description = "Secure communications between family, carers, and management")
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    @Operation(summary = "Get conversation messages for a client")
    public List<Message> getMessages(@RequestParam Long clientId) {
        return messageService.getMessagesForClient(clientId);
    }

    @PostMapping
    @Operation(summary = "Send a new message")
    public Message sendMessage(
            @RequestBody Message message,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal != null) {
            message.setSenderUsername(principal.getUsername());
            message.setSenderName(principal.getFullName());
            message.setSenderRole(principal.getRole().name());
        } else if (message.getSenderName() == null) {
            message.setSenderUsername("system");
            message.setSenderName("Care Coordinator");
            message.setSenderRole("CARE_COORDINATOR");
        }
        return messageService.sendMessage(message);
    }
}
