package com.careplatform.common.security;

import com.careplatform.user.model.User;
import com.careplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Set<Permission> permissions = getPermissionsForRole(user.getRole());

        return UserPrincipal.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .password(user.getPassword())
                .fullName(user.getFullName())
                .tenantId(user.getTenantId())
                .role(user.getRole())
                .permissions(permissions)
                .enabled(user.isEnabled())
                .build();
    }

    public static Set<Permission> getPermissionsForRole(Role role) {
        if (role == null) return EnumSet.noneOf(Permission.class);
        if (role == Role.PLATFORM_ADMIN) {
            return EnumSet.allOf(Permission.class);
        } else if (role == Role.ORG_ADMIN) {
            return EnumSet.of(
                    Permission.CLIENT_READ, Permission.CLIENT_WRITE,
                    Permission.CAREPLAN_READ, Permission.CAREPLAN_WRITE, Permission.CAREPLAN_APPROVE,
                    Permission.ASSESSMENT_WRITE, Permission.RISK_MANAGE,
                    Permission.VISIT_READ, Permission.VISIT_WRITE, Permission.VISIT_CHECKIN,
                    Permission.MEDICATION_ADMINISTER, Permission.INCIDENT_REPORT, Permission.INCIDENT_MANAGE,
                    Permission.FINANCE_MANAGE, Permission.AUDIT_READ, Permission.AI_ASSIST, Permission.ADMIN_ALL
            );
        } else if (role == Role.CARE_MANAGER) {
            return EnumSet.of(
                    Permission.CLIENT_READ, Permission.CLIENT_WRITE,
                    Permission.CAREPLAN_READ, Permission.CAREPLAN_WRITE, Permission.CAREPLAN_APPROVE,
                    Permission.ASSESSMENT_WRITE, Permission.RISK_MANAGE,
                    Permission.VISIT_READ, Permission.INCIDENT_REPORT, Permission.INCIDENT_MANAGE,
                    Permission.AUDIT_READ, Permission.AI_ASSIST
            );
        } else if (role == Role.CARE_COORDINATOR) {
            return EnumSet.of(
                    Permission.CLIENT_READ, Permission.VISIT_READ, Permission.VISIT_WRITE,
                    Permission.CAREPLAN_READ, Permission.INCIDENT_REPORT, Permission.AI_ASSIST
            );
        } else if (role == Role.CARE_WORKER) {
            return EnumSet.of(
                    Permission.CLIENT_READ, Permission.CAREPLAN_READ,
                    Permission.VISIT_READ, Permission.VISIT_CHECKIN,
                    Permission.MEDICATION_ADMINISTER, Permission.INCIDENT_REPORT, Permission.AI_ASSIST
            );
        } else if (role == Role.FAMILY_MEMBER) {
            return EnumSet.of(
                    Permission.CLIENT_READ, Permission.CAREPLAN_READ, Permission.VISIT_READ
            );
        } else if (role == Role.FINANCE_ADMIN) {
            return EnumSet.of(
                    Permission.CLIENT_READ, Permission.VISIT_READ, Permission.FINANCE_MANAGE
            );
        } else if (role == Role.AUDIT_TEAM) {
            return EnumSet.of(
                    Permission.CLIENT_READ, Permission.CAREPLAN_READ, Permission.VISIT_READ,
                    Permission.INCIDENT_REPORT, Permission.INCIDENT_MANAGE, Permission.AUDIT_READ
            );
        }
        return EnumSet.noneOf(Permission.class);
    }
}
