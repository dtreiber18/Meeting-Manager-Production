package com.g37.meetingmanager.util;

import com.g37.meetingmanager.model.ActionItem;
import com.g37.meetingmanager.model.Meeting;
import com.g37.meetingmanager.model.Participant;
import com.g37.meetingmanager.repository.mysql.ActionItemRepository;
import com.g37.meetingmanager.repository.mysql.MeetingRepository;
import com.g37.meetingmanager.repository.mysql.ParticipantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.Arrays;

@Configuration
public class MeetingDataSeeder {
    @Bean
    CommandLineRunner seedDatabase(MeetingRepository meetingRepo, ParticipantRepository participantRepo,
                        ActionItemRepository actionItemRepo) {
                return args -> {
                        if (meetingRepo.count() > 0)
                                return; // Only seed if empty

                        Meeting m1 = new Meeting();
                        m1.setSubject("Quarterly Planning");
                        m1.setDate(LocalDate.of(2025, 8, 1));
                        m1.setTime("10:00");
                        m1.setSummary("Quarterly planning session");
                        m1.setDetails("Discussed Q3 goals and deliverables.");
                        m1.setNextSteps("Finalize project assignments");
                        m1.setRecordingUrl("https://example.com/recording1");
                        m1.setType("internal");

                        Meeting m2 = new Meeting();
                        m2.setSubject("Product Launch");
                        m2.setDate(LocalDate.of(2025, 8, 5));
                        m2.setTime("14:00");
                        m2.setSummary("Product launch kickoff");
                        m2.setDetails("Reviewed launch checklist and marketing plan.");
                        m2.setNextSteps("Send press release");
                        m2.setRecordingUrl("https://example.com/recording2");
                        m2.setType("external");

                        Meeting m3 = new Meeting();
                        m3.setSubject("Team Retrospective");
                        m3.setDate(LocalDate.of(2025, 8, 8));
                        m3.setTime("16:00");
                        m3.setSummary("Sprint retrospective");
                        m3.setDetails("Analyzed sprint outcomes and blockers.");
                        m3.setNextSteps("Schedule follow-up");
                        m3.setRecordingUrl(null);
                        m3.setType("internal");

                        meetingRepo.saveAll(Arrays.asList(m1, m2, m3));

                        Participant p1 = new Participant(); p1.setMeeting(m1); p1.setName("Alice Johnson"); p1.setAttended(true);
                        Participant p2 = new Participant(); p2.setMeeting(m1); p2.setName("Bob Smith"); p2.setAttended(true);
                        Participant p3 = new Participant(); p3.setMeeting(m1); p3.setName("Carol Lee"); p3.setAttended(false);
                        Participant p4 = new Participant(); p4.setMeeting(m2); p4.setName("Alice Johnson"); p4.setAttended(true);
                        Participant p5 = new Participant(); p5.setMeeting(m2); p5.setName("David Kim"); p5.setAttended(true);
                        Participant p6 = new Participant(); p6.setMeeting(m3); p6.setName("Bob Smith"); p6.setAttended(false);
                        Participant p7 = new Participant(); p7.setMeeting(m3); p7.setName("Carol Lee"); p7.setAttended(true);

                        participantRepo.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7));

                        ActionItem a1 = new ActionItem();
                        a1.setMeeting(m1); a1.setDescription("Draft Q3 OKRs"); a1.setAssignedTo("Alice Johnson"); a1.setDueDate(LocalDate.of(2025, 8, 10)); a1.setPriority("high"); a1.setStatus("pending");
                        ActionItem a2 = new ActionItem();
                        a2.setMeeting(m1); a2.setDescription("Update roadmap"); a2.setAssignedTo("Bob Smith"); a2.setDueDate(LocalDate.of(2025, 8, 12)); a2.setPriority("medium"); a2.setStatus("in-progress");
                        ActionItem a3 = new ActionItem();
                        a3.setMeeting(m2); a3.setDescription("Prepare launch email"); a3.setAssignedTo("David Kim"); a3.setDueDate(LocalDate.of(2025, 8, 6)); a3.setPriority("high"); a3.setStatus("pending");
                        ActionItem a4 = new ActionItem();
                        a4.setMeeting(m3); a4.setDescription("Document sprint learnings"); a4.setAssignedTo("Carol Lee"); a4.setDueDate(LocalDate.of(2025, 8, 9)); a4.setPriority("low"); a4.setStatus("completed");

                        actionItemRepo.saveAll(Arrays.asList(a1, a2, a3, a4));
                };
        }
}
