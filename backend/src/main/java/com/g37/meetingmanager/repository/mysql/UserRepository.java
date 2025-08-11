package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByAzureAdObjectId(String azureAdObjectId);
    List<User> findByOrganizationId(Long organizationId);
    List<User> findByIsActiveTrue();
    
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);
    
    @Query("SELECT u FROM User u WHERE u.organization.id = :orgId AND u.isActive = true")
    List<User> findActiveUsersByOrganization(@Param("orgId") Long organizationId);
}
