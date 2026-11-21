package com.careplatform.client.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.client.model.CareTimelineEvent;
import com.careplatform.client.model.Client;
import com.careplatform.client.model.EmergencyContact;
import com.careplatform.client.repository.CareTimelineEventRepository;
import com.careplatform.client.repository.ClientRepository;
import com.careplatform.common.exception.ResourceNotFoundException;
import com.careplatform.common.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final CareTimelineEventRepository timelineEventRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<Client> getAllClients(String status) {
        String tenant = TenantContext.getTenantId();
        if (status != null && !status.isBlank()) {
            return clientRepository.findByTenantIdAndStatus(tenant, status);
        }
        return clientRepository.findByTenantId(tenant);
    }

    @Transactional(readOnly = true)
    public Client getClientById(Long id) {
        return clientRepository.findByTenantIdAndId(TenantContext.getTenantId(), id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
    }

    @Transactional
    public Client createClient(Client client) {
        client.setTenantId(TenantContext.getTenantId());
        if (client.getClientIdentifier() == null || client.getClientIdentifier().isBlank()) {
            client.setClientIdentifier("CLI-" + (1000 + (int)(Math.random() * 9000)));
        }
        if (client.getStatus() == null || client.getStatus().isBlank()) {
            client.setStatus("ACTIVE");
        }
        Client saved = clientRepository.save(client);

        auditService.record("CLIENT_CREATE", "Client", saved.getId().toString(),
                "Client created: " + saved.getFirstName() + " " + saved.getLastName() + " (" + saved.getClientIdentifier() + ")",
                null, "ACTIVE");

        addTimelineEvent(saved.getId(), "CLIENT_REGISTERED", "Client Registered",
                "New client record established in platform.", "INFO", "System", true);

        return saved;
    }

    @Transactional
    public Client updateClient(Long id, Client updated) {
        Client existing = getClientById(id);
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setDateOfBirth(updated.getDateOfBirth());
        existing.setPhone(updated.getPhone());
        existing.setEmail(updated.getEmail());
        existing.setAddress(updated.getAddress());
        existing.setKeySafeCode(updated.getKeySafeCode());
        existing.setMedicalHistory(updated.getMedicalHistory());
        existing.setAllergies(updated.getAllergies());
        existing.setCarePreferences(updated.getCarePreferences());
        existing.setStatus(updated.getStatus());
        existing.setFundingType(updated.getFundingType());

        Client saved = clientRepository.save(existing);
        auditService.record("CLIENT_UPDATE", "Client", id.toString(),
                "Client updated: " + saved.getFirstName() + " " + saved.getLastName(), null, saved.getStatus());

        return saved;
    }

    @Transactional
    public CareTimelineEvent addTimelineEvent(Long clientId, String eventType, String title, String description,
                                              String severity, String recordedBy, boolean visibleToFamily) {
        CareTimelineEvent event = CareTimelineEvent.builder()
                .clientId(clientId)
                .eventType(eventType)
                .title(title)
                .description(description)
                .severity(severity != null ? severity : "INFO")
                .recordedBy(recordedBy)
                .eventTimestamp(Instant.now())
                .visibleToFamily(visibleToFamily)
                .build();
        event.setTenantId(TenantContext.getTenantId());
        return timelineEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<CareTimelineEvent> getTimeline(Long clientId, boolean familyOnly) {
        String tenant = TenantContext.getTenantId();
        if (familyOnly) {
            return timelineEventRepository.findByTenantIdAndClientIdAndVisibleToFamilyTrueOrderByEventTimestampDesc(tenant, clientId);
        }
        return timelineEventRepository.findByTenantIdAndClientIdOrderByEventTimestampDesc(tenant, clientId);
    }

    @Transactional
    public EmergencyContact addEmergencyContact(Long clientId, EmergencyContact contact) {
        Client client = getClientById(clientId);
        contact.setClient(client);
        contact.setTenantId(TenantContext.getTenantId());
        client.getEmergencyContacts().add(contact);
        clientRepository.save(client);

        auditService.record("EMERGENCY_CONTACT_ADD", "Client", clientId.toString(),
                "Added emergency contact: " + contact.getName() + " (" + contact.getRelationship() + ")", null, "ACTIVE");

        return contact;
    }
}
