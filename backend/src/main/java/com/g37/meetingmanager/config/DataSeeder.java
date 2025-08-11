package com.g37.meetingmanager.config;

import com.g37.meetingmanager.model.Meeting;
import com.g37.meetingmanager.model.Participant;
import com.g37.meetingmanager.model.ActionItem;
import com.g37.meetingmanager.repository.mysql.MeetingRepository;
import com.g37.meetingmanager.repository.mysql.ParticipantRepository;
import com.g37.meetingmanager.repository.mysql.ActionItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private ParticipantRepository participantRepository;

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
        // Create sample meetings
        Meeting meeting1 = new Meeting();
        meeting1.setSubject("Quarterly Planning Meeting");
        meeting1.setSummary("Discussed Q4 goals and objectives for the team");
        meeting1.setDetails("We reviewed the previous quarter's performance and set targets for Q4. Key focus areas include product development, customer acquisition, and process improvement.");
        meeting1.setNextSteps("1. Finalize budget allocations\n2. Schedule department meetings\n3. Review resource requirements");
        meeting1.setRecordingUrl("https://example.com/recording/1");
        meeting1.setType("Planning");
        meeting1.setDate(LocalDate.of(2024, 10, 15));
        meeting1.setTime("10:00 AM");

        Meeting meeting2 = new Meeting();
        meeting2.setSubject("Weekly Standup");
        meeting2.setSummary("Regular team sync on current projects");
        meeting2.setDetails("Team members shared updates on their current tasks, discussed blockers, and coordinated on upcoming deliverables.");
        meeting2.setNextSteps("1. John to complete API documentation\n2. Sarah to finalize UI designs\n3. Mike to deploy testing environment");
        meeting2.setRecordingUrl("https://example.com/recording/2");
        meeting2.setType("Standup");
        meeting2.setDate(LocalDate.of(2024, 10, 20));
        meeting2.setTime("9:00 AM");

        Meeting meeting3 = new Meeting();
        meeting3.setSubject("Client Presentation Review");
        meeting3.setSummary("Final review of presentation materials for client meeting");
        meeting3.setDetails("Reviewed all presentation slides, demo scenarios, and Q&A preparation. Made final adjustments based on team feedback.");
        meeting3.setNextSteps("1. Update presentation with final changes\n2. Prepare demo environment\n3. Schedule practice run");
        meeting3.setRecordingUrl("https://example.com/recording/3");
        meeting3.setType("Review");
        meeting3.setDate(LocalDate.of(2024, 10, 22));
        meeting3.setTime("2:00 PM");

        // Save meetings first
        meeting1 = meetingRepository.save(meeting1);
        meeting2 = meetingRepository.save(meeting2);
        meeting3 = meetingRepository.save(meeting3);

        // Create participants for meeting1
        Participant p1 = new Participant();
        p1.setName("John Smith");
        p1.setEmail("john.smith@example.com");
        p1.setAttended(true);
        p1.setMeeting(meeting1);

        Participant p2 = new Participant();
        p2.setName("Sarah Johnson");
        p2.setEmail("sarah.johnson@example.com");
        p2.setAttended(true);
        p2.setMeeting(meeting1);

        Participant p3 = new Participant();
        p3.setName("Mike Davis");
        p3.setEmail("mike.davis@example.com");
        p3.setAttended(false);
        p3.setMeeting(meeting1);

        // Create participants for meeting2
        Participant p4 = new Participant();
        p4.setName("John Smith");
        p4.setEmail("john.smith@example.com");
        p4.setAttended(true);
        p4.setMeeting(meeting2);

        Participant p5 = new Participant();
        p5.setName("Sarah Johnson");
        p5.setEmail("sarah.johnson@example.com");
        p5.setAttended(true);
        p5.setMeeting(meeting2);

        // Save participants
        participantRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5));

        // Create action items for meeting1
        ActionItem a1 = new ActionItem();
        a1.setDescription("Finalize Q4 budget allocation");
        a1.setAssignedTo("John Smith");
        a1.setDueDate(LocalDate.of(2024, 10, 25));
        a1.setPriority("high");
        a1.setStatus("pending");
        a1.setMeeting(meeting1);

        ActionItem a2 = new ActionItem();
        a2.setDescription("Schedule department meetings");
        a2.setAssignedTo("Sarah Johnson");
        a2.setDueDate(LocalDate.of(2024, 10, 20));
        a2.setPriority("medium");
        a2.setStatus("in-progress");
        a2.setMeeting(meeting1);

        // Create action items for meeting2
        ActionItem a3 = new ActionItem();
        a3.setDescription("Complete API documentation");
        a3.setAssignedTo("John Smith");
        a3.setDueDate(LocalDate.of(2024, 10, 25));
        a3.setPriority("high");
        a3.setStatus("pending");
        a3.setMeeting(meeting2);

        ActionItem a4 = new ActionItem();
        a4.setDescription("Finalize UI designs");
        a4.setAssignedTo("Sarah Johnson");
        a4.setDueDate(LocalDate.of(2024, 10, 23));
        a4.setPriority("medium");
        a4.setStatus("completed");
        a4.setMeeting(meeting2);

        // Save action items
        actionItemRepository.saveAll(Arrays.asList(a1, a2, a3, a4));

        System.out.println("Database seeded with sample meeting data!");
    }
}
