package com.careplatform.crm.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.client.model.Client;
import com.careplatform.client.repository.ClientRepository;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.crm.model.ClientLead;
import com.careplatform.crm.repository.ClientLeadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientLeadService {

    private final ClientLeadRepository leadRepository;
    private final ClientRepository clientRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<ClientLead> getAllLeads() {
        return leadRepository.findByTenantIdOrderByCreatedAtDesc(TenantContext.getTenantId());
    }

    @Transactional(readOnly = true)
    public ClientLead getLeadById(Long id) {
        return leadRepository.findById(id)
                .filter(l -> l.getTenantId().equals(TenantContext.getTenantId()))
                .orElseThrow(() -> new CarePlatformException("Client lead not found: " + id));
    }

    @Transactional
    public ClientLead createLead(ClientLead lead) {
        String tenantId = TenantContext.getTenantId();
        lead.setTenantId(tenantId);
        if (lead.getPipelineStage() == null || lead.getPipelineStage().isBlank()) {
            lead.setPipelineStage("NEW_INQUIRY");
        }
        ClientLead saved = leadRepository.save(lead);
        auditService.record("CRM_LEAD_CREATED", "ClientLead", saved.getId().toString(),
                "Registered new care lead: " + saved.getProspectName() + " (Source: " + saved.getReferralSource() + ", Need: " + saved.getCareTypeNeeded() + ")",
                null, saved.getPipelineStage());
        return saved;
    }

    @Transactional
    public ClientLead updatePipelineStage(Long id, String newStage, String notes) {
        ClientLead lead = getLeadById(id);
        lead.setPipelineStage(newStage);
        if (notes != null && !notes.isBlank()) {
            lead.setPipelineNotes(notes);
        }
        ClientLead saved = leadRepository.save(lead);
        auditService.record("CRM_LEAD_STAGE_MOVED", "ClientLead", saved.getId().toString(),
                "Lead " + saved.getProspectName() + " moved to stage " + newStage,
                null, newStage);
        return saved;
    }

    @Transactional
    public Client convertLeadToClient(Long leadId) {
        ClientLead lead = getLeadById(leadId);
        if ("CONVERTED_TO_CLIENT".equalsIgnoreCase(lead.getPipelineStage()) && lead.getConvertedClientId() != null) {
            return clientRepository.findById(lead.getConvertedClientId())
                    .orElseThrow(() -> new CarePlatformException("Linked client profile not found"));
        }

        String tenantId = TenantContext.getTenantId();
        String[] nameParts = lead.getProspectName().trim().split("\\s+", 2);
        String firstName = nameParts[0];
        String lastName = (nameParts.length > 1) ? nameParts[1] : "Client";

        Client newClient = Client.builder()
                .firstName(firstName)
                .lastName(lastName)
                .clientIdentifier("CLI-" + System.currentTimeMillis() % 10000)
                .uhid("UHID-" + System.currentTimeMillis() % 100000)
                .address(lead.getAddress())
                .phone(lead.getContactPhone())
                .email(lead.getContactEmail())
                .status("ACTIVE")
                .carePreferences(lead.getCareTypeNeeded() + " (" + (lead.getEstimatedHoursPerWeek() != null ? lead.getEstimatedHoursPerWeek() + " hrs/week" : "") + ")")
                .build();
        newClient.setTenantId(tenantId);
        Client savedClient = clientRepository.save(newClient);

        lead.setPipelineStage("CONVERTED_TO_CLIENT");
        lead.setConvertedClientId(savedClient.getId());
        leadRepository.save(lead);

        auditService.record("CRM_LEAD_CONVERTED", "ClientLead", lead.getId().toString(),
                "Converted prospect " + lead.getProspectName() + " into active Client profile " + savedClient.getClientIdentifier() + " (UHID: " + savedClient.getUhid() + ")",
                null, "CONVERTED");

        return savedClient;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCrmPipelineSummary() {
        String tenantId = TenantContext.getTenantId();
        List<ClientLead> all = leadRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);

        long newInquiries = all.stream().filter(l -> "NEW_INQUIRY".equalsIgnoreCase(l.getPipelineStage())).count();
        long assessmentBooked = all.stream().filter(l -> "HOME_ASSESSMENT_BOOKED".equalsIgnoreCase(l.getPipelineStage()) || "ASSESSMENT_COMPLETED".equalsIgnoreCase(l.getPipelineStage())).count();
        long proposals = all.stream().filter(l -> "PROPOSAL_SENT".equalsIgnoreCase(l.getPipelineStage())).count();
        long converted = all.stream().filter(l -> "CONVERTED_TO_CLIENT".equalsIgnoreCase(l.getPipelineStage())).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalLeads", all.size());
        summary.put("newInquiries", newInquiries);
        summary.put("inAssessment", assessmentBooked);
        summary.put("proposalsOut", proposals);
        summary.put("convertedActive", converted);
        summary.put("conversionRatePercentage", all.isEmpty() ? 0.0 : Math.round(((double) converted / all.size()) * 1000.0) / 10.0);

        return summary;
    }
}
