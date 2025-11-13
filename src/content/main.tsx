let targetUsername: string | null = null;
let targetDisplayName: string | null = null;

// Load saved data from storage
function loadUserData() {
  chrome.storage.sync.get(['redditUsername', 'redditDisplayName'], (result) => {
    targetUsername = result.redditUsername || null;
    targetDisplayName = result.redditDisplayName || null;
    if (targetUsername || targetDisplayName) {
      hideUserData();
    }
  });
}

// Function to hide username and display name in the DOM
function hideUserData() {
  if (!targetUsername && !targetDisplayName) return;

  // Common selectors where Reddit usernames appear
  const selectors = [
    'a[href*="/user/"]',
    'a[href*="/u/"]',
    '[data-testid="comment_author_link"]',
    '.author',
    '.UserLink',
    '[data-click-id="user"]',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    '[data-faceplate-tracking-context] p',
    'div[class*="username"]',
    'p[class*="username"]',
    'h1[class*="username"]',
    'h2[class*="username"]',
    'h3[class*="username"]'
  ];

  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const elementText = element.textContent?.trim();
      if (!elementText) return;

      let shouldHide = false;
      
      // Check for username match
      if (targetUsername) {
        if (elementText === targetUsername || elementText?.includes(`u/${targetUsername}`)) {
          shouldHide = true;
        }
      }
      
      // Check for display name match
      if (targetDisplayName && elementText === targetDisplayName) {
        shouldHide = true;
      }

      if (shouldHide) {
        // Replace with asterisks
        const asteriskCount = elementText.length;
        element.textContent = '*'.repeat(asteriskCount);
        
        // Add a data attribute to mark as processed
        element.setAttribute('data-username-hidden', 'true');
      }
    });
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.action === 'userUpdated') {
    targetUsername = request.username;
    targetDisplayName = request.displayName;
    hideUserData();
  } else if (request.action === 'userCleared') {
    targetUsername = null;
    targetDisplayName = null;
    // Restore original usernames by removing the hidden attribute
    document.querySelectorAll('[data-username-hidden="true"]').forEach(element => {
      element.removeAttribute('data-username-hidden');
      // Note: In a real implementation, you'd want to store original text
      // For now, this will require a page refresh to restore
    });
  }
});

// Watch for DOM changes (for dynamically loaded content)
const observer = new MutationObserver(() => {
  if (targetUsername || targetDisplayName) {
    hideUserData();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial load
loadUserData();

console.log('Reddit Username Hider content script loaded');
