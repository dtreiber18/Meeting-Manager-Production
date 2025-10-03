package com.g37.meetingmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(
    scanBasePackages = "com.g37.meetingmanager"
)
@EnableJpaRepositories(basePackages = "com.g37.meetingmanager.repository.mysql")
@EnableScheduling
public class MeetingManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeetingManagerApplication.class, args);
    }
}