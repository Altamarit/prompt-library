const API_BASE = 'https://prompt-library-self.vercel.app';

let currentMode = 'save';
let savedPromptId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const { authToken } = await chrome.storage.local.get('authToken');
  const { pendingSaveText, mode } = await chrome.storage.local.get(['pendingSaveText', 'mode']);

  if (!authToken) {
    showView('login-view');
    return;
  }

  if (mode === 'use') {
    currentMode = 'use';
    showView('use-view');
    loadPrompts();
    await chrome.storage.local.remove('mode');
  } else {
    currentMode = 'save';
    showView('save-view');
    if (pendingSaveText) {
      document.getElementById('save-text').value = pendingSaveText;
      await chrome.storage.local.remove('pendingSaveText');
    }
    loadDropdowns();
  }
});

// Login
document.getElementById('btn-login').addEventListener('click', () => {
  chrome.tabs.create({ url: `${API_BASE}/login` });
  window.close();
});

// Save prompt
document.getElementById('btn-save').addEventListener('click', async () => {
  const title = document.getElementById('save-title').value;
  const content = document.getElementById('save-text').value;
  const usage_id = document.getElementById('save-usage').value || undefined;
  const collection_id = document.getElementById('save-collection').value || undefined;

  if (!title || !content) {
    alert('Título y contenido son requeridos');
    return;
  }

  const res = await apiRequest('/api/prompts', 'POST', { title, content, usage_id, collection_id });

  if (res.error) {
    alert('Error: ' + res.error);
    return;
  }

  savedPromptId = res.data?.id;
  showView('success-view');
});

// Success actions
document.getElementById('btn-close').addEventListener('click', () => window.close());
document.getElementById('btn-open-web').addEventListener('click', () => {
  if (savedPromptId) {
    chrome.tabs.create({ url: `${API_BASE}/prompts/${savedPromptId}` });
  }
  window.close();
});

// Search prompts
let searchTimeout;
document.getElementById('use-search')?.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadPrompts(e.target.value), 300);
});

async function loadPrompts(search = '') {
  const container = document.getElementById('use-results');
  container.innerHTML = '<div class="loading">Cargando...</div>';

  const params = new URLSearchParams({ limit: '10' });
  if (search) params.set('search', search);

  const res = await apiRequest(`/api/prompts?${params}`);

  if (res.error || !res.data?.length) {
    container.innerHTML = '<div class="loading">No se encontraron prompts</div>';
    return;
  }

  container.innerHTML = res.data.map((p) => `
    <div class="prompt-item">
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.current_version.substring(0, 120))}${p.current_version.length > 120 ? '...' : ''}</p>
      <div class="meta">
        <span>♥ ${p.likes_count}</span>
        <span>${p.usage_count} usos</span>
        ${p.tokens_estimated ? `<span>~${p.tokens_estimated} tokens</span>` : ''}
      </div>
      <div class="prompt-actions">
        <button class="btn-secondary btn-small" onclick="copyPrompt('${p.id}', ${JSON.stringify(p.current_version).replace(/'/g, "\\'")})">Copiar</button>
        <button class="btn-primary btn-small" onclick="insertPrompt('${p.id}', ${JSON.stringify(p.current_version).replace(/'/g, "\\'")})">Insertar aquí</button>
      </div>
    </div>
  `).join('');
}

async function loadDropdowns() {
  const [usagesRes, collectionsRes] = await Promise.all([
    apiRequest('/api/usages'),
    apiRequest('/api/collections'),
  ]);

  const usageSelect = document.getElementById('save-usage');
  (usagesRes.data || []).forEach((u) => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.textContent = u.name;
    usageSelect.appendChild(opt);
  });

  const collectionSelect = document.getElementById('save-collection');
  (collectionsRes.data || []).forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    collectionSelect.appendChild(opt);
  });
}

window.copyPrompt = async (promptId, text) => {
  await navigator.clipboard.writeText(text);
  await apiRequest('/api/prompts/use', 'POST', { prompt_id: promptId });
  showNotification('Prompt copiado');
};

window.insertPrompt = async (promptId, text) => {
  chrome.runtime.sendMessage({ type: 'INSERT_TEXT', text });
  await apiRequest('/api/prompts/use', 'POST', { prompt_id: promptId });
  showNotification('Prompt insertado');
  setTimeout(() => window.close(), 1000);
};

function showView(viewId) {
  ['login-view', 'save-view', 'use-view', 'success-view'].forEach((id) => {
    document.getElementById(id).classList.toggle('hidden', id !== viewId);
  });
}

function showNotification(text) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = 'position:fixed;bottom:8px;left:8px;right:8px;background:#16a34a;color:#fff;padding:10px;border-radius:8px;text-align:center;font-size:13px;z-index:999;';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

async function apiRequest(url, method = 'GET', body = null) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'API_REQUEST', url, method, body }, resolve);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
