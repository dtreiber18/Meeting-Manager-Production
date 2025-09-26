package com.g37.meetingmanager.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@ConditionalOnProperty(name = "spring.data.mongodb.uri", matchIfMissing = false)
@EnableMongoRepositories(basePackages = "com.g37.meetingmanager.repository.mongodb")
public class MongoConfig {
    // This configuration will only be active if MongoDB URI property is present
    // matchIfMissing = false means MongoDB repos only enabled when URI is explicitly set
}