import { useState, useEffect } from 'react';

export default function App() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [savedUsername, setSavedUsername] = useState('');
  const [savedDisplayName, setSavedDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load saved data from storage
    chrome.storage.sync.get(['redditUsername', 'redditDisplayName'], (result) => {
      if (result.redditUsername) {
        setSavedUsername(result.redditUsername);
        setUsername(result.redditUsername);
      }
      if (result.redditDisplayName) {
        setSavedDisplayName(result.redditDisplayName);
        setDisplayName(result.redditDisplayName);
      }
    });
  }, []);

  const handleSave = () => {
    if (!username.trim()) return;
    
    setIsSaving(true);
    const dataToSave: { redditUsername: string; redditDisplayName?: string } = {
      redditUsername: username.trim()
    };
    
    if (displayName.trim()) {
      dataToSave.redditDisplayName = displayName.trim();
    }
    
    chrome.storage.sync.set(dataToSave, () => {
      setSavedUsername(username.trim());
      setSavedDisplayName(displayName.trim());
      setIsSaving(false);
      
      // Notify content scripts about the update
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'userUpdated',
            username: username.trim(),
            displayName: displayName.trim()
          });
        }
      });
    });
  };

  const handleClear = () => {
    chrome.storage.sync.remove(['redditUsername', 'redditDisplayName'], () => {
      setSavedUsername('');
      setSavedDisplayName('');
      setUsername('');
      setDisplayName('');
      
      // Notify content scripts about the clear
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'userCleared' 
          });
        }
      });
    });
  };

  return (
    <div style={{ 
      width: '350px', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>
        Reddit User Hider
      </h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          Username (u/username):
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter Reddit username"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          Display Name (optional):
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter display name"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {(savedUsername || savedDisplayName) && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '8px',
          backgroundColor: '#f0f8ff',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          Currently hiding:
          {savedUsername && <div><strong>Username:</strong> {savedUsername}</div>}
          {savedDisplayName && <div><strong>Display Name:</strong> {savedDisplayName}</div>}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSave}
          disabled={!username.trim() || isSaving}
          style={{
            flex: 1,
            padding: '8px 16px',
            backgroundColor: isSaving ? '#ccc' : '#0079d3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        
        {(savedUsername || savedDisplayName) && (
          <button
            onClick={handleClear}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff4500',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
