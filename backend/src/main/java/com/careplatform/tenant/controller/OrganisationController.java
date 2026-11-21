package com.careplatform.tenant.controller;

import com.careplatform.common.tenant.TenantContext;
import com.careplatform.tenant.model.Branch;
import com.careplatform.tenant.model.Organisation;
import com.careplatform.tenant.repository.BranchRepository;
import com.careplatform.tenant.repository.OrganisationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organisations")
@RequiredArgsConstructor
@Tag(name = "Organisations", description = "Multi-tenant Organisation and Branch management")
public class OrganisationController {

    private final OrganisationRepository organisationRepository;
    private final BranchRepository branchRepository;

    @GetMapping
    @Operation(summary = "List all organisations for current tenant")
    public List<Organisation> getOrganisations() {
        return organisationRepository.findByTenantId(TenantContext.getTenantId());
    }

    @PostMapping
    @Operation(summary = "Create organisation")
    public Organisation createOrganisation(@RequestBody Organisation organisation) {
        organisation.setTenantId(TenantContext.getTenantId());
        return organisationRepository.save(organisation);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update organisation details")
    public ResponseEntity<Organisation> updateOrganisation(@PathVariable Long id, @RequestBody Organisation req) {
        return organisationRepository.findById(id).map(org -> {
            if (req.getName() != null) org.setName(req.getName());
            if (req.getRegistrationNumber() != null) org.setRegistrationNumber(req.getRegistrationNumber());
            if (req.getEmail() != null) org.setEmail(req.getEmail());
            if (req.getPhone() != null) org.setPhone(req.getPhone());
            if (req.getAddress() != null) org.setAddress(req.getAddress());
            if (req.getTimezone() != null) org.setTimezone(req.getTimezone());
            if (req.getWorkingHoursStart() != null) org.setWorkingHoursStart(req.getWorkingHoursStart());
            if (req.getWorkingHoursEnd() != null) org.setWorkingHoursEnd(req.getWorkingHoursEnd());
            if (req.getEcmToleranceMinutes() != null) org.setEcmToleranceMinutes(req.getEcmToleranceMinutes());
            return ResponseEntity.ok(organisationRepository.save(org));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete organisation")
    public ResponseEntity<Void> deleteOrganisation(@PathVariable Long id) {
        if (organisationRepository.existsById(id)) {
            organisationRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/branches")
    @Operation(summary = "List branches of organisation")
    public List<Branch> getBranches(@PathVariable Long id) {
        return branchRepository.findByTenantIdAndOrganisationId(TenantContext.getTenantId(), id);
    }

    @PostMapping("/{id}/branches")
    @Operation(summary = "Create branch under organisation")
    public Branch createBranch(@PathVariable Long id, @RequestBody Branch branch) {
        branch.setOrganisationId(id);
        branch.setTenantId(TenantContext.getTenantId());
        return branchRepository.save(branch);
    }

    @PutMapping("/branches/{branchId}")
    @Operation(summary = "Update branch")
    public ResponseEntity<Branch> updateBranch(@PathVariable Long branchId, @RequestBody Branch req) {
        return branchRepository.findById(branchId).map(branch -> {
            if (req.getName() != null) branch.setName(req.getName());
            if (req.getCode() != null) branch.setCode(req.getCode());
            if (req.getAddress() != null) branch.setAddress(req.getAddress());
            if (req.getPhone() != null) branch.setPhone(req.getPhone());
            return ResponseEntity.ok(branchRepository.save(branch));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/branches/{branchId}")
    @Operation(summary = "Delete branch")
    public ResponseEntity<Void> deleteBranch(@PathVariable Long branchId) {
        if (branchRepository.existsById(branchId)) {
            branchRepository.deleteById(branchId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/all-branches")
    @Operation(summary = "List all branches across tenant")
    public List<Branch> getAllBranches() {
        return branchRepository.findByTenantId(TenantContext.getTenantId());
    }
}
