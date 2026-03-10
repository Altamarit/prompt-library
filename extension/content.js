chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'INSERT_TEXT') {
    const activeEl = document.activeElement;

    if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT')) {
      const start = activeEl.selectionStart;
      const end = activeEl.selectionEnd;
      const value = activeEl.value;
      activeEl.value = value.substring(0, start) + message.text + value.substring(end);
      activeEl.selectionStart = activeEl.selectionEnd = start + message.text.length;
      activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (activeEl && activeEl.isContentEditable) {
      document.execCommand('insertText', false, message.text);
    } else {
      navigator.clipboard.writeText(message.text).then(() => {
        showNotification('Prompt copiado al portapapeles (no se encontró campo de texto activo)');
      });
    }
  }
});

function showNotification(text) {
  const el = document.createElement('div');
  el.textContent = text;
  Object.assign(el.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: '#1e293b',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    zIndex: '99999',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
