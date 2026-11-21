package com.careplatform.auth.dto;

import com.careplatform.common.security.Permission;
import com.careplatform.common.security.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String tenantId;
    private Role role;
    private Set<Permission> permissions;
}
