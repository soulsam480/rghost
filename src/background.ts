chrome.runtime.onInstalled.addListener(() => {
	console.log("Reddit Username Hider extension installed");
	
	// Initialize storage with default values
	chrome.storage.sync.get(['redditUsername', 'redditDisplayName'], (result) => {
		const updates: { redditUsername?: string; redditDisplayName?: string } = {};
		if (!result.redditUsername) {
			updates.redditUsername = '';
		}
		if (!result.redditDisplayName) {
			updates.redditDisplayName = '';
		}
		if (Object.keys(updates).length > 0) {
			chrome.storage.sync.set(updates);
		}
	});
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
	if (request.action === "getStoredUsername") {
		chrome.storage.sync.get(['redditUsername'], (result) => {
			sendResponse({ username: result.redditUsername || '' });
		});
		return true;
	}
});

