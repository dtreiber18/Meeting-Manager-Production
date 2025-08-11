package com.g37.meetingmanager.config;

import com.g37.meetingmanager.model.*;
import com.g37.meetingmanager.repository.mysql.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private MeetingParticipantRepository meetingParticipantRepository;

    @Autowired
    private ActionItemRepository actionItemRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Always run to ensure demo user exists
        seedDatabase();
    }

    private void seedDatabase() {
        System.out.println("Starting database seeding...");
        
        // Create default permissions
        Permission readPermission = createPermissionIfNotExists("READ", "Can read data");
        Permission writePermission = createPermissionIfNotExists("WRITE", "Can write data");
        Permission deletePermission = createPermissionIfNotExists("DELETE", "Can delete data");
        Permission adminPermission = createPermissionIfNotExists("ADMIN", "Full administrative access");

        // Create default roles
        Role userRole = createRoleIfNotExists("USER", "Standard user role");
        if (!userRole.hasPermission("READ")) {
            userRole.getPermissions().add(readPermission);
        }
        if (!userRole.hasPermission("WRITE")) {
            userRole.getPermissions().add(writePermission);
        }
        roleRepository.save(userRole);

        Role adminRole = createRoleIfNotExists("ADMIN", "Administrator role");
        if (!adminRole.hasPermission("READ")) {
            adminRole.getPermissions().add(readPermission);
        }
        if (!adminRole.hasPermission("WRITE")) {
            adminRole.getPermissions().add(writePermission);
        }
        if (!adminRole.hasPermission("DELETE")) {
            adminRole.getPermissions().add(deletePermission);
        }
        if (!adminRole.hasPermission("ADMIN")) {
            adminRole.getPermissions().add(adminPermission);
        }
        roleRepository.save(adminRole);

        // Create sample organization if it doesn't exist
        Organization organization = organizationRepository.findByName("Acme Corporation")
            .orElseGet(() -> {
                Organization org = new Organization();
                org.setName("Acme Corporation");
                org.setDescription("A sample organization for testing");
                org.setSubscriptionTier(Organization.SubscriptionTier.ENTERPRISE);
                org.setMaxUsers(100);
                return organizationRepository.save(org);
            });

        // Create sample users only if they don't exist
        createUserIfNotExists("demo@acme.com", "Demo", "User", "Demo User", "Demo", organization, userRole);
        createUserIfNotExists("john.doe@acme.com", "John", "Doe", "Product Manager", "Product", organization, adminRole);
        createUserIfNotExists("jane.smith@acme.com", "Jane", "Smith", "Software Engineer", "Engineering", organization, userRole);
        createUserIfNotExists("mike.wilson@acme.com", "Mike", "Wilson", "UX Designer", "Design", organization, userRole);

        System.out.println("Database seeded with sample data!");
    }

    private Permission createPermissionIfNotExists(String name, String description) {
        return permissionRepository.findByName(name).orElseGet(() -> {
            Permission permission = new Permission();
            permission.setName(name);
            permission.setDescription(description);
            return permissionRepository.save(permission);
        });
    }

    private Role createRoleIfNotExists(String name, String description) {
        return roleRepository.findByName(name).orElseGet(() -> {
            Role role = new Role();
            role.setName(name);
            role.setDescription(description);
            role.setPermissions(new HashSet<>()); // Initialize permissions set
            return roleRepository.save(role);
        });
    }

    private MeetingParticipant createMeetingParticipant(Meeting meeting, User user, MeetingParticipant.ParticipantRole role) {
        MeetingParticipant participant = new MeetingParticipant(meeting, user, role);
        participant.setInvitationStatus(MeetingParticipant.InvitationStatus.ACCEPTED);
        if (meeting.getStatus() == Meeting.MeetingStatus.COMPLETED) {
            participant.setAttendanceStatus(MeetingParticipant.AttendanceStatus.PRESENT);
        }
        return meetingParticipantRepository.save(participant);
    }

    private User createUserIfNotExists(String email, String firstName, String lastName, String jobTitle, String department, Organization organization, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setJobTitle(jobTitle);
            user.setDepartment(department);
            user.setPasswordHash(passwordEncoder.encode("password123")); // Default password
            user.setOrganization(organization);
            user.getRoles().add(role);
            return userRepository.save(user);
        });
    }
}
