// Content script for Substack Post Analyzer
(function() {
  'use strict';

  let statsPanel = null;
  let isActive = false;
  let updateInterval = null;
  let debounceTimer = null;

  // Create the stats panel UI
  function createStatsPanel() {
    const panel = document.createElement('div');
    panel.id = 'substack-analyzer-panel';
    panel.innerHTML = `
      <div class="analyzer-header">
        <span>📊 Post Analyzer</span>
        <button id="analyzer-close" title="Close">×</button>
      </div>
      <div class="analyzer-content">
        <div class="metric-row">
          <span class="metric-label">Word Count:</span>
          <span id="word-count" class="metric-value">—</span>
          <span id="word-count-indicator" class="indicator"></span>
        </div>
        <div class="metric-row">
          <span class="metric-label">External Links:</span>
          <span id="link-check" class="metric-value">—</span>
          <span id="link-indicator" class="indicator"></span>
        </div>
        <div class="metric-info">
          <small>Target: 1000-2500 words | Need: Wikipedia or .edu link</small>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #substack-analyzer-panel {
        position: fixed;
        top: 80px;
        right: 20px;
        width: 320px;
        background: white;
        border: 2px solid #FF6719;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .analyzer-header {
        background: #FF6719;
        color: white;
        padding: 12px 16px;
        border-radius: 6px 6px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
      }

      #analyzer-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        line-height: 20px;
        opacity: 0.8;
        transition: opacity 0.2s;
      }

      #analyzer-close:hover {
        opacity: 1;
      }

      .analyzer-content {
        padding: 16px;
      }

      .metric-row {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        padding: 8px;
        background: #f8f9fa;
        border-radius: 4px;
      }

      .metric-label {
        font-weight: 500;
        color: #333;
        flex: 0 0 120px;
      }

      .metric-value {
        flex: 1;
        color: #666;
        font-weight: 600;
      }

      .indicator {
        font-size: 20px;
        margin-left: 8px;
      }

      .indicator.check {
        color: #22c55e;
      }

      .indicator.cross {
        color: #ef4444;
      }

      .metric-info {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #e5e7eb;
        color: #6b7280;
        text-align: center;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(panel);

    // Add close button handler
    document.getElementById('analyzer-close').addEventListener('click', deactivate);

    return panel;
  }

  // Extract text content from the editor
  function getEditorContent() {
    // Substack uses ProseMirror editor - try multiple selectors
    const editorSelectors = [
      '.ProseMirror',
      '[contenteditable="true"]',
      '.public-DraftEditor-content',
      'div[role="textbox"]'
    ];

    for (const selector of editorSelectors) {
      const editor = document.querySelector(selector);
      if (editor) {
        return editor;
      }
    }

    return null;
  }

  // Count words in text
  function countWords(text) {
    if (!text) return 0;
    // Remove extra whitespace and count words
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  // Check for external links
  function checkExternalLinks(editor) {
    if (!editor) return { hasWikipedia: false, hasEdu: false, total: 0 };

    const links = editor.querySelectorAll('a[href]');
    let hasWikipedia = false;
    let hasEdu = false;
    let total = 0;

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('https://')) {
        total++;
        if (href.includes('wikipedia.org')) {
          hasWikipedia = true;
        }
        if (href.includes('.edu')) {
          hasEdu = true;
        }
      }
    });

    return { hasWikipedia, hasEdu, total };
  }

  // Update the stats display
  function updateStats() {
    const editor = getEditorContent();
    
    if (!editor) {
      console.error('Substack editor not found');
      return;
    }

    // Get text content
    const text = editor.textContent || editor.innerText || '';
    const wordCount = countWords(text);

    // Check links
    const linkInfo = checkExternalLinks(editor);

    // Update word count
    const wordCountEl = document.getElementById('word-count');
    const wordCountIndicator = document.getElementById('word-count-indicator');
    
    if (wordCountEl) {
      wordCountEl.textContent = wordCount.toLocaleString();
      
      if (wordCount >= 1000 && wordCount <= 2500) {
        wordCountIndicator.textContent = '✓';
        wordCountIndicator.className = 'indicator check';
      } else {
        wordCountIndicator.textContent = '✗';
        wordCountIndicator.className = 'indicator cross';
      }
    }

    // Update link check
    const linkCheckEl = document.getElementById('link-check');
    const linkIndicator = document.getElementById('link-indicator');
    
    if (linkCheckEl) {
      const hasRequiredLink = linkInfo.hasWikipedia || linkInfo.hasEdu;
      
      if (linkInfo.hasWikipedia && linkInfo.hasEdu) {
        linkCheckEl.textContent = 'Wikipedia & .edu';
      } else if (linkInfo.hasWikipedia) {
        linkCheckEl.textContent = 'Wikipedia found';
      } else if (linkInfo.hasEdu) {
        linkCheckEl.textContent = '.edu found';
      } else if (linkInfo.total > 0) {
        linkCheckEl.textContent = linkInfo.total + ' link(s), none qualified';
      } else {
        linkCheckEl.textContent = 'No links found';
      }

      if (hasRequiredLink) {
        linkIndicator.textContent = '✓';
        linkIndicator.className = 'indicator check';
      } else {
        linkIndicator.textContent = '✗';
        linkIndicator.className = 'indicator cross';
      }
    }
  }

  // Debounced update function
  function debouncedUpdate() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(updateStats, 1000); // 1 second debounce
  }

  // Activate the analyzer
  function activate() {
    if (isActive) return;

    isActive = true;

    // Create panel if it doesn't exist
    if (!statsPanel) {
      statsPanel = createStatsPanel();
    } else {
      statsPanel.style.display = 'block';
    }

    // Initial update
    updateStats();

    // Set up interval update (every 30 seconds)
    updateInterval = setInterval(updateStats, 30000);

    // Set up debounced updates on editor changes
    const editor = getEditorContent();
    if (editor) {
      // Listen for input events
      editor.addEventListener('input', debouncedUpdate);
      
      // Also listen for changes in the DOM (for link additions/removals)
      const observer = new MutationObserver(debouncedUpdate);
      observer.observe(editor, {
        childList: true,
        subtree: true,
        characterData: true
      });

      // Store observer for cleanup
      statsPanel._observer = observer;
    }

    console.log('Substack Analyzer activated');
  }

  // Deactivate the analyzer
  function deactivate() {
    if (!isActive) return;

    isActive = false;

    if (statsPanel) {
      statsPanel.style.display = 'none';

      // Clean up observer
      if (statsPanel._observer) {
        statsPanel._observer.disconnect();
        statsPanel._observer = null;
      }
    }

    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    // Remove event listeners
    const editor = getEditorContent();
    if (editor) {
      editor.removeEventListener('input', debouncedUpdate);
    }

    console.log('Substack Analyzer deactivated');
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'activate') {
      activate();
      sendResponse({ status: 'activated' });
    } else if (request.action === 'deactivate') {
      deactivate();
      sendResponse({ status: 'deactivated' });
    } else if (request.action === 'toggle') {
      if (isActive) {
        deactivate();
        sendResponse({ status: 'deactivated' });
      } else {
        activate();
        sendResponse({ status: 'activated' });
      }
    } else if (request.action === 'getStatus') {
      sendResponse({ isActive });
    }
    return true;
  });

  console.log('Substack Post Analyzer loaded');
})();
