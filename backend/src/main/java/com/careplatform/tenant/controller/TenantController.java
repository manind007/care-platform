package com.careplatform.tenant.controller;

import com.careplatform.tenant.model.Tenant;
import com.careplatform.tenant.repository.TenantRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
@Tag(name = "Tenants", description = "Multi-tenant directory and provisioning")
public class TenantController {

    private final TenantRepository tenantRepository;

    @GetMapping
    @Operation(summary = "List all active tenants for multi-tenant switching")
    public List<Tenant> getTenants() {
        return tenantRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tenant details by ID")
    public ResponseEntity<Tenant> getTenantById(@PathVariable Long id) {
        return tenantRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'ORG_ADMIN')")
    @Operation(summary = "Provision a new tenant organisation")
    public ResponseEntity<?> createTenant(@RequestBody Tenant tenant) {
        if (tenant.getTenantId() == null || tenant.getTenantId().isBlank()) {
            tenant.setTenantId("TENANT-" + (System.currentTimeMillis() % 10000));
        }
        if (tenantRepository.findByTenantId(tenant.getTenantId()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tenant ID '" + tenant.getTenantId() + "' already exists."));
        }
        if (tenant.getSubscriptionTier() == null) {
            tenant.setSubscriptionTier("ENTERPRISE");
        }
        tenant.setActive(true);
        Tenant saved = tenantRepository.save(tenant);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'ORG_ADMIN')")
    @Operation(summary = "Update tenant configuration and tier")
    public ResponseEntity<Tenant> updateTenant(@PathVariable Long id, @RequestBody Tenant req) {
        return tenantRepository.findById(id).map(existing -> {
            if (req.getName() != null) existing.setName(req.getName());
            if (req.getSubscriptionTier() != null) existing.setSubscriptionTier(req.getSubscriptionTier());
            existing.setActive(req.isActive());
            return ResponseEntity.ok(tenantRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'ORG_ADMIN')")
    @Operation(summary = "Decommission or delete tenant")
    public ResponseEntity<Void> deleteTenant(@PathVariable Long id) {
        if (tenantRepository.existsById(id)) {
            tenantRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
