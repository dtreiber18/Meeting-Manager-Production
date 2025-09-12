// Simple JavaScript test to run in browser console
// Open http://localhost:4200 and paste this in console

console.log('=== Meeting Manager Search Test ===');

// Check if Angular is loaded
if (window.ng) {
  console.log('✅ Angular detected');
} else {
  console.log('❌ Angular not detected');
}

// Check for search input
const searchInput = document.querySelector('input[placeholder*="Search meetings"]');
if (searchInput) {
  console.log('✅ Search input found');
  console.log('Current value:', searchInput.value);
} else {
  console.log('❌ Search input not found');
}

// Check for meetings data
const meetingCards = document.querySelectorAll('[class*="meeting"]');
console.log(`Found ${meetingCards.length} meeting-related elements`);

// Check for API calls
console.log('Check Network tab for:');
console.log('- GET /api/meetings (should return meeting data)');
console.log('- Response should be JSON array of meetings');

// Test search functionality
if (searchInput) {
  console.log('Testing search...');
  searchInput.value = 'test';
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  setTimeout(() => {
    const searchResults = document.querySelector('[class*="search-result"]');
    const recentMeetings = document.querySelector('[class*="recent-meeting"]');
    console.log('Search results visible:', !!searchResults);
    console.log('Recent meetings hidden:', !recentMeetings);
  }, 100);
}
