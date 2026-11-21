package com.careplatform.incident.service;

import com.careplatform.audit.service.AuditService;
import com.careplatform.client.service.ClientService;
import com.careplatform.common.exception.ResourceNotFoundException;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.incident.model.Incident;
import com.careplatform.incident.model.IncidentSeverity;
import com.careplatform.incident.model.IncidentStatus;
import com.careplatform.incident.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final AuditService auditService;
    private final ClientService clientService;

    @Transactional(readOnly = true)
    public List<Incident> getAllIncidents() {
        return incidentRepository.findByTenantId(TenantContext.getTenantId());
    }

    @Transactional(readOnly = true)
    public List<Incident> getIncidentsByClient(Long clientId) {
        return incidentRepository.findByTenantIdAndClientId(TenantContext.getTenantId(), clientId);
    }

    @Transactional(readOnly = true)
    public Incident getIncidentById(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found: " + id));
    }

    @Transactional
    public Incident reportIncident(Incident incident, String reporter) {
        incident.setTenantId(TenantContext.getTenantId());
        incident.setStatus(IncidentStatus.REPORTED);
        if (incident.getIncidentReference() == null) {
            incident.setIncidentReference("INC-" + System.currentTimeMillis() % 1000000);
        }
        if (incident.getReportedBy() == null) {
            incident.setReportedBy(reporter);
        }

        Incident saved = incidentRepository.save(incident);

        auditService.record("INCIDENT_REPORT", "Incident", saved.getId().toString(),
                "Incident reported (" + saved.getCategory() + " - " + saved.getSeverity() + "): " + saved.getDescription(),
                null, "REPORTED");

        clientService.addTimelineEvent(saved.getClientId(), "INCIDENT_REPORTED",
                "Incident: " + saved.getCategory() + " (" + saved.getSeverity() + ")",
                saved.getDescription() + " | Action: " + saved.getImmediateActionTaken(),
                saved.getSeverity() == IncidentSeverity.CRITICAL || saved.getSeverity() == IncidentSeverity.HIGH ? "CRITICAL" : "WARNING",
                saved.getReportedBy(), true);

        return saved;
    }

    @Transactional
    public Incident advanceWorkflow(Long id, IncidentStatus newStatus, String notes, String investigator) {
        Incident incident = getIncidentById(id);
        IncidentStatus oldStatus = incident.getStatus();
        incident.setStatus(newStatus);

        if (investigator != null) {
            incident.setAssignedInvestigator(investigator);
        }

        if (newStatus == IncidentStatus.INVESTIGATION && notes != null) {
            incident.setInvestigationNotes(notes);
        } else if (newStatus == IncidentStatus.CORRECTIVE_ACTION && notes != null) {
            incident.setCorrectiveActions(notes);
        } else if (newStatus == IncidentStatus.CLOSED) {
            incident.setClosedAt(LocalDateTime.now());
        }

        Incident saved = incidentRepository.save(incident);

        auditService.record("INCIDENT_WORKFLOW_ADVANCE", "Incident", id.toString(),
                "Incident workflow changed: " + oldStatus + " -> " + newStatus,
                oldStatus.name(), newStatus.name());

        return saved;
    }
}
