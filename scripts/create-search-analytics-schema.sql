-- Search Analytics table for tracking search patterns and popular terms
CREATE TABLE IF NOT EXISTS search_analytics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    search_term VARCHAR(500) NOT NULL,
    search_count BIGINT NOT NULL DEFAULT 1,
    first_searched DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_searched DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT,
    results_count INT,
    INDEX idx_search_term (search_term),
    INDEX idx_search_count (search_count DESC),
    INDEX idx_last_searched (last_searched DESC),
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_search_term (search_term)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some sample analytics data for demonstration
INSERT INTO search_analytics (search_term, search_count, first_searched, last_searched, user_id, results_count) VALUES
('meeting', 150, '2024-01-15 10:00:00', '2024-02-01 15:30:00', 1, 25),
('calendar', 120, '2024-01-16 09:15:00', '2024-02-01 14:20:00', 2, 18),
('users', 95, '2024-01-17 11:30:00', '2024-02-01 16:45:00', 1, 12),
('permissions', 80, '2024-01-18 14:00:00', '2024-02-01 13:10:00', 3, 8),
('settings', 75, '2024-01-19 16:20:00', '2024-02-01 12:00:00', 2, 15),
('notifications', 65, '2024-01-20 08:45:00', '2024-02-01 17:25:00', 1, 20),
('dashboard', 55, '2024-01-21 13:15:00', '2024-02-01 11:40:00', 3, 10),
('reports', 45, '2024-01-22 10:30:00', '2024-02-01 18:50:00', 2, 6),
('export', 35, '2024-01-23 15:45:00', '2024-02-01 09:30:00', 1, 4),
('help', 30, '2024-01-24 12:00:00', '2024-02-01 14:15:00', 3, 22)
ON DUPLICATE KEY UPDATE
    search_count = VALUES(search_count),
    last_searched = VALUES(last_searched),
    results_count = VALUES(results_count);