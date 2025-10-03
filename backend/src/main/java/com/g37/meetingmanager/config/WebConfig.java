package com.g37.meetingmanager.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final ObjectMapper objectMapper;

    public WebConfig(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void extendMessageConverters(@NonNull List<HttpMessageConverter<?>> converters) {
        org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(WebConfig.class);
        logger.info("🔧 WebConfig.extendMessageConverters() called with {} converters", converters.size());

        // Remove all Jackson converters
        converters.removeIf(converter -> converter instanceof MappingJackson2HttpMessageConverter);
        logger.info("Removed Jackson converters, now have {} converters", converters.size());

        // Add our custom Jackson converter at the beginning
        MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter(objectMapper);

        List<MediaType> mediaTypes = new ArrayList<>();
        mediaTypes.add(MediaType.APPLICATION_JSON);
        mediaTypes.add(new MediaType("application", "json", StandardCharsets.UTF_8));
        mediaTypes.add(new MediaType("application", "*+json"));
        mediaTypes.add(new MediaType("application", "*+json", StandardCharsets.UTF_8));

        jsonConverter.setSupportedMediaTypes(mediaTypes);
        converters.add(0, jsonConverter);

        logger.info("Added new Jackson converter with media types: {}", jsonConverter.getSupportedMediaTypes());
        logger.info("Total converters now: {}", converters.size());
    }
}
