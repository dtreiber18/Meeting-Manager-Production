package com.g37.meetingmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.g37.meetingmanager.repository.mysql")
@EnableMongoRepositories(basePackages = "com.g37.meetingmanager.repository.mongodb")
public class MeetingManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeetingManagerApplication.class, args);
    }
}