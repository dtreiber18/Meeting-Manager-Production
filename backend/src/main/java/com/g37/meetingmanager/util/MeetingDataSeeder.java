package com.g37.meetingmanager.util;

import com.g37.meetingmanager.model.*;
import com.g37.meetingmanager.repository.mysql.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
public class MeetingDataSeeder {
    @Bean
    CommandLineRunner seedDatabase(MeetingRepository meetingRepo, 
                                 MeetingParticipantRepository participantRepo,
                                 ActionItemRepository actionItemRepo,
                                 UserRepository userRepo,
                                 OrganizationRepository orgRepo) {
        return args -> {
            if (meetingRepo.count() > 0)
                return; // Only seed if empty

            // Create a sample organization
            Organization org = new Organization();
            org.setName("Sample Company");
            org.setDomain("example.com");
            org = orgRepo.save(org);

            // Create a sample user
            User user = new User();
            user.setEmail("admin@example.com");
            user.setFirstName("Admin");
            user.setLastName("User");
            user.setOrganization(org);
            user = userRepo.save(user);

            // Create meetings
            Meeting m1 = new Meeting();
            m1.setTitle("Quarterly Planning");
            m1.setStartTime(LocalDateTime.of(2025, 8, 1, 10, 0));
            m1.setEndTime(LocalDateTime.of(2025, 8, 1, 11, 0));
            m1.setSummary("Quarterly planning session");
            m1.setDescription("Discussed Q3 goals and deliverables.");
            m1.setNextSteps("Finalize project assignments");
            m1.setRecordingUrl("https://example.com/recording1");
            m1.setMeetingType(Meeting.MeetingType.PLANNING);
            m1.setOrganizer(user);
            m1.setOrganization(org);

            Meeting m2 = new Meeting();
            m2.setTitle("Product Launch");
            m2.setStartTime(LocalDateTime.of(2025, 8, 5, 14, 0));
            m2.setEndTime(LocalDateTime.of(2025, 8, 5, 15, 0));
            m2.setSummary("Product launch kickoff");
            m2.setDescription("Reviewed launch checklist and marketing plan.");
            m2.setNextSteps("Send press release");
            m2.setRecordingUrl("https://example.com/recording2");
            m2.setMeetingType(Meeting.MeetingType.CLIENT_MEETING);
            m2.setOrganizer(user);
            m2.setOrganization(org);

            Meeting m3 = new Meeting();
            m3.setTitle("Team Retrospective");
            m3.setStartTime(LocalDateTime.of(2025, 8, 8, 16, 0));
            m3.setEndTime(LocalDateTime.of(2025, 8, 8, 17, 0));
            m3.setSummary("Sprint retrospective");
            m3.setDescription("Analyzed sprint outcomes and blockers.");
            m3.setNextSteps("Schedule follow-up");
            m3.setRecordingUrl(null);
            m3.setMeetingType(Meeting.MeetingType.RETROSPECTIVE);
            m3.setOrganizer(user);
            m3.setOrganization(org);

            meetingRepo.saveAll(Arrays.asList(m1, m2, m3));

                        // Create participants using MeetingParticipant
            MeetingParticipant p1 = new MeetingParticipant(m1, "alice@example.com", "Alice Johnson", MeetingParticipant.ParticipantRole.ORGANIZER);
            p1.setInvitationStatus(MeetingParticipant.InvitationStatus.ACCEPTED);
            p1.setAttendanceStatus(MeetingParticipant.AttendanceStatus.PRESENT);
            
            MeetingParticipant p2 = new MeetingParticipant(m1, "bob.wilson@example.com", "Bob Wilson", MeetingParticipant.ParticipantRole.ATTENDEE);
            p2.setInvitationStatus(MeetingParticipant.InvitationStatus.ACCEPTED);
            p2.setAttendanceStatus(MeetingParticipant.AttendanceStatus.PRESENT);
            
            MeetingParticipant p3 = new MeetingParticipant(m2, "charlie@example.com", "Charlie Brown", MeetingParticipant.ParticipantRole.ATTENDEE);
            p3.setInvitationStatus(MeetingParticipant.InvitationStatus.ACCEPTED);
            p3.setAttendanceStatus(MeetingParticipant.AttendanceStatus.ABSENT);
            
            MeetingParticipant p4 = new MeetingParticipant(m2, "diana@example.com", "Diana Prince", MeetingParticipant.ParticipantRole.PRESENTER);
            p4.setInvitationStatus(MeetingParticipant.InvitationStatus.ACCEPTED);
            p4.setAttendanceStatus(MeetingParticipant.AttendanceStatus.PRESENT);
            
            MeetingParticipant p5 = new MeetingParticipant(m3, "eve@example.com", "Eve Adams", MeetingParticipant.ParticipantRole.ORGANIZER);
            p5.setInvitationStatus(MeetingParticipant.InvitationStatus.ACCEPTED);
            p5.setAttendanceStatus(MeetingParticipant.AttendanceStatus.PRESENT);
            
            MeetingParticipant p6 = new MeetingParticipant(m3, "bob@example.com", "Bob Smith", MeetingParticipant.ParticipantRole.ATTENDEE);
            p6.setInvitationStatus(MeetingParticipant.InvitationStatus.DECLINED);
            p6.setAttendanceStatus(MeetingParticipant.AttendanceStatus.ABSENT);
            
            MeetingParticipant p7 = new MeetingParticipant(m3, "carol@example.com", "Carol Lee", MeetingParticipant.ParticipantRole.ATTENDEE);
            p7.setInvitationStatus(MeetingParticipant.InvitationStatus.ACCEPTED);
            p7.setAttendanceStatus(MeetingParticipant.AttendanceStatus.PRESENT);

            participantRepo.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7));

            // Create action items
            ActionItem a1 = new ActionItem();
            a1.setMeeting(m1);
            a1.setTitle("Draft Q3 OKRs");
            a1.setDescription("Create and draft Q3 objectives and key results");
            a1.setDueDate(LocalDateTime.of(2025, 8, 10, 17, 0));
            a1.setPriority(ActionItem.Priority.HIGH);
            a1.setStatus(ActionItem.ActionItemStatus.OPEN);
            a1.setOrganization(org);

            ActionItem a2 = new ActionItem();
            a2.setMeeting(m1);
            a2.setTitle("Update roadmap");
            a2.setDescription("Update the product roadmap with Q3 milestones");
            a2.setDueDate(LocalDateTime.of(2025, 8, 12, 17, 0));
            a2.setPriority(ActionItem.Priority.MEDIUM);
            a2.setStatus(ActionItem.ActionItemStatus.IN_PROGRESS);
            a2.setOrganization(org);

            ActionItem a3 = new ActionItem();
            a3.setMeeting(m2);
            a3.setTitle("Prepare launch email");
            a3.setDescription("Draft and prepare the product launch email campaign");
            a3.setDueDate(LocalDateTime.of(2025, 8, 6, 17, 0));
            a3.setPriority(ActionItem.Priority.HIGH);
            a3.setStatus(ActionItem.ActionItemStatus.OPEN);
            a3.setOrganization(org);

            ActionItem a4 = new ActionItem();
            a4.setMeeting(m3);
            a4.setTitle("Document sprint learnings");
            a4.setDescription("Document lessons learned from the sprint retrospective");
            a4.setDueDate(LocalDateTime.of(2025, 8, 9, 17, 0));
            a4.setPriority(ActionItem.Priority.LOW);
            a4.setStatus(ActionItem.ActionItemStatus.COMPLETED);
            a4.setCompleted(true);
            a4.setOrganization(org);

            actionItemRepo.saveAll(Arrays.asList(a1, a2, a3, a4));
        };
    }
}
