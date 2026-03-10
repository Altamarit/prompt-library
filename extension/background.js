const API_BASE = 'https://prompt-library-5h93jjx2j-alextamaritb-5351s-projects.vercel.app';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-prompt',
    title: 'Guardar prompt',
    contexts: ['selection'],
  });

  chrome.contextMenus.create({
    id: 'use-prompt',
    title: 'Usar prompt',
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'save-prompt') {
    const selectedText = info.selectionText || '';
    await chrome.storage.local.set({ pendingSaveText: selectedText });
    chrome.action.openPopup();
  }

  if (info.menuItemId === 'use-prompt') {
    await chrome.storage.local.set({ mode: 'use' });
    chrome.action.openPopup();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'API_REQUEST') {
    handleApiRequest(message).then(sendResponse);
    return true;
  }

  if (message.type === 'INSERT_TEXT') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'INSERT_TEXT',
          text: message.text,
        });
      }
    });
  }
});

async function handleApiRequest({ url, method, body }) {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');
    if (!authToken) return { error: 'No autenticado' };

    const res = await fetch(`${API_BASE}${url}`, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}
