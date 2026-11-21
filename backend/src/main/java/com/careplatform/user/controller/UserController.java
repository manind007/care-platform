package com.careplatform.user.controller;

import com.careplatform.common.security.Role;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.user.model.User;
import com.careplatform.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management and directory")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @Operation(summary = "List users for tenant (optional filter by role)")
    public List<User> getUsers(@RequestParam(required = false) Role role) {
        String tenant = TenantContext.getTenantId();
        if (role != null) {
            return userRepository.findByTenantIdAndRole(tenant, role);
        }
        return userRepository.findByTenantId(tenant);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user details by ID")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'ORG_ADMIN', 'CARE_MANAGER')")
    @Operation(summary = "Create or onboard a new user/staff member")
    public ResponseEntity<?> createUser(@RequestBody User req) {
        if (req.getUsername() == null || req.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
        }
        if (userRepository.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username '" + req.getUsername() + "' already exists"));
        }
        String tenant = TenantContext.getTenantId();
        req.setTenantId(tenant);
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            req.setPassword(passwordEncoder.encode("password123"));
        } else {
            req.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        if (req.getRole() == null) {
            req.setRole(Role.CARE_WORKER);
        }
        req.setEnabled(true);
        User saved = userRepository.save(req);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'ORG_ADMIN', 'CARE_MANAGER')")
    @Operation(summary = "Update user details, role or branch")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User req) {
        return userRepository.findById(id).map(user -> {
            if (req.getFullName() != null) user.setFullName(req.getFullName());
            if (req.getEmail() != null) user.setEmail(req.getEmail());
            if (req.getPhone() != null) user.setPhone(req.getPhone());
            if (req.getRole() != null) user.setRole(req.getRole());
            if (req.getBranchId() != null) user.setBranchId(req.getBranchId());
            user.setEnabled(req.isEnabled());
            if (req.getPassword() != null && !req.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(req.getPassword()));
            }
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'ORG_ADMIN', 'CARE_MANAGER')")
    @Operation(summary = "Toggle user active status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setEnabled(!user.isEnabled());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN', 'ORG_ADMIN')")
    @Operation(summary = "Delete user")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/personas")
    @Operation(summary = "Get active user personas for one-click stakeholder switching")
    public List<java.util.Map<String, Object>> getPersonas() {
        String tenant = TenantContext.getTenantId();
        List<User> users = userRepository.findByTenantId(tenant);
        if (users.isEmpty()) {
            users = userRepository.findAll();
        }

        return users.stream().map(u -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", u.getUsername());
            map.put("userId", u.getId());
            map.put("name", u.getFullName());
            map.put("role", u.getRole().name());
            map.put("email", u.getEmail());
            map.put("branch", u.getBranchId() != null ? "Branch #" + u.getBranchId() : "Central HQ");

            String label = switch (u.getRole()) {
                case PLATFORM_ADMIN -> "Platform Administrator";
                case ORG_ADMIN -> "Organisation Administrator";
                case CARE_MANAGER -> "Care Manager";
                case CARE_COORDINATOR -> "Care Coordinator";
                case CARE_WORKER -> "Care Worker";
                case FAMILY_MEMBER -> "Family Member";
                case FINANCE_ADMIN -> "Finance Administrator";
                case AUDIT_TEAM -> "Compliance Inspector";
            };
            map.put("label", label);

            String[] parts = u.getFullName().split(" ");
            String avatar = (parts.length >= 2)
                    ? ("" + parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
                    : u.getUsername().substring(0, Math.min(2, u.getUsername().length())).toUpperCase();
            map.put("avatar", avatar);
            return map;
        }).toList();
    }
}
