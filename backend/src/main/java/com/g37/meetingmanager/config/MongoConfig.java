package com.g37.meetingmanager.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * MongoDB Configuration
 * Only enables MongoDB repositories when MongoDB URI is configured
 */
@Configuration
@ConditionalOnProperty(name = "spring.data.mongodb.uri", matchIfMissing = false)
@EnableMongoRepositories(basePackages = "com.g37.meetingmanager.repository.mongodb")
public class MongoConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(MongoConfig.class);
    
    public MongoConfig() {
        logger.info("✅ MongoDB configuration enabled - MongoDB repositories will be available");
    }
}