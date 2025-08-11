package com.g37.meetingmanager.controller;

import com.g37.meetingmanager.model.Meeting;
import com.g37.meetingmanager.repository.mysql.MeetingRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {
    private final MeetingRepository meetingRepository;

    public MeetingController(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    @GetMapping
    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }
}
