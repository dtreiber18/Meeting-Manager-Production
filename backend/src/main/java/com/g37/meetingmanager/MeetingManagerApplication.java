package com.g37.meetingmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(
    scanBasePackages = "com.g37.meetingmanager",
    exclude = {
        org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration.class,
        org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration.class,
        org.springframework.boot.autoconfigure.mongo.MongoReactiveAutoConfiguration.class
    }
)
@EnableJpaRepositories(basePackages = "com.g37.meetingmanager.repository.mysql")
public class MeetingManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeetingManagerApplication.class, args);
    }
}