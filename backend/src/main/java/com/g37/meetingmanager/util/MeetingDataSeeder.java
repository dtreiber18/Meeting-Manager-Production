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
            // DISABLED: Meeting data seeding for production
            // This was demo/development data and should not be used in production
            System.out.println("Meeting data seeding is disabled for production use");
        };
    }
}
