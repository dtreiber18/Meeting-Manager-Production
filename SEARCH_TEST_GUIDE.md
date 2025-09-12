## Dashboard Search Testing Guide

### Test Steps to Verify Search Functionality

1. **Open the Application**
   - Navigate to http://localhost:4200
   - Verify both frontend (port 4200) and backend (port 8081) are running

2. **Test Search Input**
   - Look for the search input field with placeholder "Search meetings, participants, action items..."
   - The search field should be visible at the top of the dashboard

3. **Test Search Functionality**
   - Type a search term (try: "weekly", "project", "team", "meeting")
   - Observe that:
     - Search results section appears when typing
     - Recent meetings section disappears when searching
     - Results are filtered based on the search term

4. **Test Search Fields**
   The search should work across these fields:
   - Meeting title/subject
   - Meeting description/summary
   - Participant names and emails
   - Action item descriptions
   - Meeting types

5. **Test Clear Search**
   - Clear the search input
   - Observe that:
     - Search results section disappears
     - Recent meetings section reappears

### Expected Behavior

✅ **When NOT searching**: Show "Recent Meetings" section
✅ **When searching**: Show "Search Results" section with filtered meetings
✅ **Search summary**: "X meetings found matching 'search term'"
✅ **No results**: "No meetings found matching your search criteria"

### Troubleshooting

If search is not working:
1. Check browser console for errors
2. Verify API calls to `/api/meetings` are successful
3. Check that meeting data is loaded (should see meetings in Recent Meetings when not searching)
4. Verify searchQuery is being updated when typing
