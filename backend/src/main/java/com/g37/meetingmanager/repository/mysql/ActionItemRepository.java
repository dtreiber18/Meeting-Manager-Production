package com.g37.meetingmanager.repository.mysql;

import com.g37.meetingmanager.model.ActionItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActionItemRepository extends JpaRepository<ActionItem, Long> {
}
