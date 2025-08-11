-- Sample data for the 'meetings' table
INSERT INTO meetings (subject, date, time, summary, details, next_steps, recording_url)
VALUES
  ('Quarterly Planning', '2025-08-01', '10:00', 'Quarterly planning session', 'Discussed Q3 goals and deliverables.', 'Finalize project assignments', 'https://example.com/recording1'),
  ('Product Launch', '2025-08-05', '14:00', 'Product launch kickoff', 'Reviewed launch checklist and marketing plan.', 'Send press release', 'https://example.com/recording2'),
  ('Team Retrospective', '2025-08-08', '16:00', 'Sprint retrospective', 'Analyzed sprint outcomes and blockers.', 'Schedule follow-up', NULL);

-- Sample data for the 'participants' table
INSERT INTO participants (meeting_id, name, attended)
VALUES
  (1, 'Alice Johnson', true),
  (1, 'Bob Smith', true),
  (1, 'Carol Lee', false),
  (2, 'Alice Johnson', true),
  (2, 'David Kim', true),
  (3, 'Bob Smith', false),
  (3, 'Carol Lee', true);

-- Sample data for the 'action_items' table
INSERT INTO action_items (meeting_id, description, assigned_to, due_date, priority, status)
VALUES
  (1, 'Draft Q3 OKRs', 'Alice Johnson', '2025-08-10', 'high', 'pending'),
  (1, 'Update roadmap', 'Bob Smith', '2025-08-12', 'medium', 'in-progress'),
  (2, 'Prepare launch email', 'David Kim', '2025-08-06', 'high', 'pending'),
  (3, 'Document sprint learnings', 'Carol Lee', '2025-08-09', 'low', 'completed');
