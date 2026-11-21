package com.careplatform.client.controller;

import com.careplatform.client.model.CareTimelineEvent;
import com.careplatform.client.model.Client;
import com.careplatform.client.model.EmergencyContact;
import com.careplatform.client.service.ClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clients")
@RequiredArgsConstructor
@Tag(name = "Clients", description = "Consolidated longitudinal client profiles and timeline")
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    @Operation(summary = "List clients with optional status filter")
    public List<Client> getClients(@RequestParam(required = false) String status) {
        return clientService.getAllClients(status);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single client full profile")
    public Client getClientById(@PathVariable Long id) {
        return clientService.getClientById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CLIENT_WRITE') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Register a new client")
    public Client createClient(@Valid @RequestBody Client client) {
        return clientService.createClient(client);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CLIENT_WRITE') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Update an existing client profile")
    public Client updateClient(@PathVariable Long id, @Valid @RequestBody Client client) {
        return clientService.updateClient(id, client);
    }

    @GetMapping("/{id}/timeline")
    @Operation(summary = "Retrieve chronological longitudinal care timeline")
    public List<CareTimelineEvent> getTimeline(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean familyOnly) {
        return clientService.getTimeline(id, familyOnly);
    }

    @PostMapping("/{id}/timeline")
    @Operation(summary = "Add a care note or journal event to client timeline")
    public CareTimelineEvent addTimelineEvent(
            @PathVariable Long id,
            @RequestBody CareTimelineEvent event) {
        return clientService.addTimelineEvent(
                id,
                event.getEventType(),
                event.getTitle(),
                event.getDescription(),
                event.getSeverity(),
                event.getRecordedBy(),
                event.isVisibleToFamily()
        );
    }

    @PostMapping("/{id}/emergency-contacts")
    @PreAuthorize("hasAuthority('CLIENT_WRITE') or hasRole('CARE_MANAGER') or hasRole('ORG_ADMIN') or hasRole('CARE_COORDINATOR')")
    @Operation(summary = "Add an emergency contact / next of kin to client profile")
    public EmergencyContact addEmergencyContact(
            @PathVariable Long id,
            @RequestBody EmergencyContact contact) {
        return clientService.addEmergencyContact(id, contact);
    }
}
