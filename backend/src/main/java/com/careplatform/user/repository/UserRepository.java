package com.careplatform.user.repository;

import com.careplatform.common.security.Role;
import com.careplatform.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByTenantId(String tenantId);
    List<User> findByTenantIdAndRole(String tenantId, Role role);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
