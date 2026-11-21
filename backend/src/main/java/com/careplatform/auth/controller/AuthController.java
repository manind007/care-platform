package com.careplatform.auth.controller;

import com.careplatform.audit.service.AuditService;
import com.careplatform.auth.dto.LoginRequest;
import com.careplatform.auth.dto.LoginResponse;
import com.careplatform.auth.dto.RegisterRequest;
import com.careplatform.common.exception.CarePlatformException;
import com.careplatform.common.security.CustomUserDetailsService;
import com.careplatform.common.security.JwtTokenProvider;
import com.careplatform.common.security.Role;
import com.careplatform.common.security.UserPrincipal;
import com.careplatform.common.tenant.TenantContext;
import com.careplatform.user.model.User;
import com.careplatform.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User login, registration, and session identity")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT token with tenant/role metadata")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        if (request.getTenantId() != null && !request.getTenantId().isBlank()) {
            TenantContext.setTenantId(request.getTenantId());
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(principal);

        if (TenantContext.getTenantId() == null || TenantContext.getTenantId().isBlank()) {
            String fallbackTenant = principal.getTenantId() != null && !principal.getTenantId().isBlank()
                    ? principal.getTenantId() : "TENANT-001";
            TenantContext.setTenantId(fallbackTenant);
        }

        // update last login
        userRepository.findByUsername(principal.getUsername()).ifPresent(user -> {
            user.setLastLogin(Instant.now());
            userRepository.save(user);
        });

        auditService.record("USER_LOGIN", "User", principal.getId().toString(),
                "User logged in successfully: " + principal.getUsername(), null, "LOGGED_IN");

        return ResponseEntity.ok(LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(principal.getId())
                .username(principal.getUsername())
                .fullName(principal.getFullName())
                .email(principal.getEmail())
                .tenantId(principal.getTenantId())
                .role(principal.getRole())
                .permissions(principal.getPermissions())
                .build());
    }

    @PostMapping("/register")
    @Operation(summary = "Register new user account")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new CarePlatformException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CarePlatformException("Email is already in use");
        }

        String tenant = (request.getTenantId() != null && !request.getTenantId().isBlank())
                ? request.getTenantId() : TenantContext.getTenantId();

        Role role = request.getRole() != null ? request.getRole() : Role.CARE_WORKER;

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(role)
                .branchId(request.getBranchId())
                .enabled(true)
                .lastLogin(Instant.now())
                .build();
        user.setTenantId(tenant);
        user = userRepository.save(user);

        UserPrincipal principal = UserPrincipal.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .password(user.getPassword())
                .fullName(user.getFullName())
                .tenantId(user.getTenantId())
                .role(user.getRole())
                .permissions(CustomUserDetailsService.getPermissionsForRole(user.getRole()))
                .enabled(user.isEnabled())
                .build();

        String token = tokenProvider.generateToken(principal);

        auditService.record("USER_REGISTER", "User", user.getId().toString(),
                "New user registered: " + user.getUsername() + " with role " + role, null, "CREATED");

        return ResponseEntity.ok(LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .tenantId(user.getTenantId())
                .role(user.getRole())
                .permissions(principal.getPermissions())
                .build());
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user info")
    public ResponseEntity<UserPrincipal> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(principal);
    }
}
