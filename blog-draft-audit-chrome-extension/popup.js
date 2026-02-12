// Popup script for Substack Post Analyzer

document.addEventListener('DOMContentLoaded', async () => {
  const activateBtn = document.getElementById('activateBtn');
  const deactivateBtn = document.getElementById('deactivateBtn');
  const statusEl = document.getElementById('status');
  const errorEl = document.getElementById('error');

  // Check if we're on a Substack page
  async function checkSubstackPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('substack.com')) {
        showError('Please navigate to a Substack page to use this extension.');
        activateBtn.disabled = true;
        deactivateBtn.disabled = true;
        return false;
      }
      
      return true;
    } catch (error) {
      showError('Error checking page: ' + error.message);
      return false;
    }
  }

  // Show error message
  function showError(message) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    errorEl.className = 'error';
  }

  // Update status display
  function updateStatus(isActive) {
    if (isActive) {
      statusEl.textContent = '✓ Status: Active';
      statusEl.className = 'status active';
    } else {
      statusEl.textContent = 'Status: Inactive';
      statusEl.className = 'status';
    }
  }

  // Send message to content script
  async function sendMessage(action) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const response = await chrome.tabs.sendMessage(tab.id, { action });
      
      if (response.status === 'activated') {
        updateStatus(true);
        errorEl.style.display = 'none';
      } else if (response.status === 'deactivated') {
        updateStatus(false);
      }
    } catch (error) {
      showError('Error: ' + error.message + '. Try refreshing the page.');
    }
  }

  // Check initial status
  async function checkStatus() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStatus' });
      updateStatus(response.isActive);
    } catch (error) {
      // Content script might not be loaded yet
      updateStatus(false);
    }
  }

  // Event listeners
  activateBtn.addEventListener('click', () => {
    sendMessage('activate');
  });

  deactivateBtn.addEventListener('click', () => {
    sendMessage('deactivate');
  });

  // Initialize
  const isSubstack = await checkSubstackPage();
  if (isSubstack) {
    await checkStatus();
  }
});
