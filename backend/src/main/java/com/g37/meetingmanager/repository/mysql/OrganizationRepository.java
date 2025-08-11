package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByName(String name);
    List<Organization> findByIsActiveTrue();
    List<Organization> findBySubscriptionTier(Organization.SubscriptionTier tier);
}
