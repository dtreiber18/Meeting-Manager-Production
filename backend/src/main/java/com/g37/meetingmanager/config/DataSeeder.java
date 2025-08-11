package com.g37.meetingmanager.config;

import com.g37.meetingmanager.model.*;
import com.g37.meetingmanager.repository.mysql.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

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

    @Override
    public void run(String... args) throws Exception {
        // Only seed if database is empty
        if (meetingRepository.count() == 0) {
            seedDatabase();
        }
    }

    private void seedDatabase() {
        // Create sample organization
        Organization organization = new Organization();
        organization.setName("Acme Corporation");
        organization.setDescription("A sample organization for testing");
        organization.setSubscriptionTier(Organization.SubscriptionTier.ENTERPRISE);
        organization.setMaxUsers(100);
        organization = organizationRepository.save(organization);

        // Create sample users
        User user1 = new User();
        user1.setEmail("john.doe@acme.com");
        user1.setFirstName("John");
        user1.setLastName("Doe");
        user1.setJobTitle("Product Manager");
        user1.setDepartment("Product");
        user1.setOrganization(organization);
        user1 = userRepository.save(user1);

        User user2 = new User();
        user2.setEmail("jane.smith@acme.com");
        user2.setFirstName("Jane");
        user2.setLastName("Smith");
        user2.setJobTitle("Software Engineer");
        user2.setDepartment("Engineering");
        user2.setOrganization(organization);
        user2 = userRepository.save(user2);

        User user3 = new User();
        user3.setEmail("mike.wilson@acme.com");
        user3.setFirstName("Mike");
        user3.setLastName("Wilson");
        user3.setJobTitle("UX Designer");
        user3.setDepartment("Design");
        user3.setOrganization(organization);
        user3 = userRepository.save(user3);

        // Create sample meetings
        Meeting meeting1 = new Meeting();
        meeting1.setTitle("Quarterly Planning Meeting");
        meeting1.setDescription("Discussed Q4 goals and objectives for the team");
        meeting1.setAgenda("1. Review Q3 performance\n2. Set Q4 objectives\n3. Budget planning\n4. Resource allocation");
        meeting1.setStartTime(LocalDateTime.of(2024, 10, 15, 10, 0));
        meeting1.setEndTime(LocalDateTime.of(2024, 10, 15, 11, 30));
        meeting1.setStatus(Meeting.MeetingStatus.COMPLETED);
        meeting1.setMeetingType(Meeting.MeetingType.PLANNING);
        meeting1.setPriority(Meeting.Priority.HIGH);
        meeting1.setOrganizer(user1);
        meeting1.setOrganization(organization);
        meeting1 = meetingRepository.save(meeting1);

        Meeting meeting2 = new Meeting();
        meeting2.setTitle("Weekly Standup");
        meeting2.setDescription("Regular team sync on current projects");
        meeting2.setAgenda("1. Sprint updates\n2. Blockers discussion\n3. Next week planning");
        meeting2.setStartTime(LocalDateTime.of(2024, 10, 22, 9, 0));
        meeting2.setEndTime(LocalDateTime.of(2024, 10, 22, 9, 30));
        meeting2.setStatus(Meeting.MeetingStatus.SCHEDULED);
        meeting2.setMeetingType(Meeting.MeetingType.STANDUP);
        meeting2.setPriority(Meeting.Priority.MEDIUM);
        meeting2.setOrganizer(user2);
        meeting2.setOrganization(organization);
        meeting2 = meetingRepository.save(meeting2);

        Meeting meeting3 = new Meeting();
        meeting3.setTitle("Design Review Session");
        meeting3.setDescription("Review new UI designs for the mobile app");
        meeting3.setAgenda("1. Present new designs\n2. Gather feedback\n3. Discuss implementation");
        meeting3.setStartTime(LocalDateTime.of(2024, 10, 25, 14, 0));
        meeting3.setEndTime(LocalDateTime.of(2024, 10, 25, 15, 30));
        meeting3.setStatus(Meeting.MeetingStatus.SCHEDULED);
        meeting3.setMeetingType(Meeting.MeetingType.PRESENTATION);
        meeting3.setPriority(Meeting.Priority.MEDIUM);
        meeting3.setOrganizer(user3);
        meeting3.setOrganization(organization);
        meeting3 = meetingRepository.save(meeting3);

        // Create meeting participants
        createMeetingParticipant(meeting1, user1, MeetingParticipant.ParticipantRole.ORGANIZER);
        createMeetingParticipant(meeting1, user2, MeetingParticipant.ParticipantRole.ATTENDEE);
        createMeetingParticipant(meeting1, user3, MeetingParticipant.ParticipantRole.ATTENDEE);

        createMeetingParticipant(meeting2, user2, MeetingParticipant.ParticipantRole.ORGANIZER);
        createMeetingParticipant(meeting2, user1, MeetingParticipant.ParticipantRole.ATTENDEE);
        createMeetingParticipant(meeting2, user3, MeetingParticipant.ParticipantRole.ATTENDEE);

        createMeetingParticipant(meeting3, user3, MeetingParticipant.ParticipantRole.ORGANIZER);
        createMeetingParticipant(meeting3, user1, MeetingParticipant.ParticipantRole.ATTENDEE);
        createMeetingParticipant(meeting3, user2, MeetingParticipant.ParticipantRole.ATTENDEE);

        // Create sample action items
        ActionItem actionItem1 = new ActionItem();
        actionItem1.setTitle("Finalize Q4 budget allocations");
        actionItem1.setDescription("Review and approve budget for all departments");
        actionItem1.setDueDate(LocalDateTime.of(2024, 10, 30, 17, 0));
        actionItem1.setPriority(ActionItem.Priority.HIGH);
        actionItem1.setStatus(ActionItem.ActionItemStatus.IN_PROGRESS);
        actionItem1.setAssignee(user1);
        actionItem1.setReporter(user1);
        actionItem1.setMeeting(meeting1);
        actionItem1.setOrganization(organization);
        actionItemRepository.save(actionItem1);

        ActionItem actionItem2 = new ActionItem();
        actionItem2.setTitle("Update sprint board");
        actionItem2.setDescription("Reflect current progress on Jira board");
        actionItem2.setDueDate(LocalDateTime.of(2024, 10, 23, 12, 0));
        actionItem2.setPriority(ActionItem.Priority.MEDIUM);
        actionItem2.setStatus(ActionItem.ActionItemStatus.OPEN);
        actionItem2.setAssignee(user2);
        actionItem2.setReporter(user2);
        actionItem2.setMeeting(meeting2);
        actionItem2.setOrganization(organization);
        actionItemRepository.save(actionItem2);

        ActionItem actionItem3 = new ActionItem();
        actionItem3.setTitle("Prepare design presentation");
        actionItem3.setDescription("Create presentation slides for design review");
        actionItem3.setDueDate(LocalDateTime.of(2024, 10, 24, 16, 0));
        actionItem3.setPriority(ActionItem.Priority.HIGH);
        actionItem3.setStatus(ActionItem.ActionItemStatus.OPEN);
        actionItem3.setAssignee(user3);
        actionItem3.setReporter(user3);
        actionItem3.setMeeting(meeting3);
        actionItem3.setOrganization(organization);
        actionItemRepository.save(actionItem3);

        ActionItem actionItem4 = new ActionItem();
        actionItem4.setTitle("Schedule department meetings");
        actionItem4.setDescription("Coordinate with all department heads for follow-up meetings");
        actionItem4.setDueDate(LocalDateTime.of(2024, 11, 5, 17, 0));
        actionItem4.setPriority(ActionItem.Priority.MEDIUM);
        actionItem4.setStatus(ActionItem.ActionItemStatus.OPEN);
        actionItem4.setAssignee(user1);
        actionItem4.setReporter(user1);
        actionItem4.setMeeting(meeting1);
        actionItem4.setOrganization(organization);
        actionItemRepository.save(actionItem4);

        System.out.println("Database seeded with sample data!");
    }

    private MeetingParticipant createMeetingParticipant(Meeting meeting, User user, MeetingParticipant.ParticipantRole role) {
        MeetingParticipant participant = new MeetingParticipant(meeting, user, role);
        participant.setInvitationStatus(MeetingParticipant.InvitationStatus.ACCEPTED);
        if (meeting.getStatus() == Meeting.MeetingStatus.COMPLETED) {
            participant.setAttendanceStatus(MeetingParticipant.AttendanceStatus.PRESENT);
        }
        return meetingParticipantRepository.save(participant);
    }
}
