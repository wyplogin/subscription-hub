const tokenInput = document.querySelector('#tokenInput');
const saveTokenButton = document.querySelector('#saveTokenButton');
const updateButton = document.querySelector('#updateButton');
const refreshButton = document.querySelector('#refreshButton');
const copyAllButton = document.querySelector('#copyAllButton');
const loginPanel = document.querySelector('#loginPanel');
const statusEl = document.querySelector('#status');
const lastMessageEl = document.querySelector('#lastMessage');
const lastSucceededAtEl = document.querySelector('#lastSucceededAt');
const publishedBytesEl = document.querySelector('#publishedBytes');
const profileCountEl = document.querySelector('#profileCount');
const profilesListEl = document.querySelector('#profilesList');
const logsEl = document.querySelector('#logs');

let adminToken = localStorage.getItem('adminToken') || '';
tokenInput.value = adminToken;

saveTokenButton.addEventListener('click', () => {
  adminToken = tokenInput.value.trim();
  localStorage.setItem('adminToken', adminToken);
  loadState();
});

updateButton.addEventListener('click', async () => {
  setBusy(true);
  try {
    const result = await api('/api/update', { method: 'POST' });
    renderState(result.state ? { ...result.state, profiles: result.profiles } : result);
  } catch (error) {
    showError(error);
    await loadState();
  } finally {
    setBusy(false);
  }
});

refreshButton.addEventListener('click', loadState);

copyAllButton.addEventListener('click', async () => {
  const urls = [...profilesListEl.querySelectorAll('[data-profile-url]')]
    .map((item) => item.textContent.trim())
    .filter(Boolean);
  if (!urls.length) return;
  await navigator.clipboard.writeText(urls.join('\n'));
  copyAllButton.textContent = '已复制';
  setTimeout(() => {
    copyAllButton.textContent = '复制全部';
  }, 1200);
});

profilesListEl.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-copy-profile]');
  if (!button) return;

  const row = button.closest('[data-profile-row]');
  const url = row?.querySelector('[data-profile-url]')?.textContent.trim();
  if (!url) return;

  await navigator.clipboard.writeText(url);
  button.textContent = '已复制';
  setTimeout(() => {
    button.textContent = '复制';
  }, 1200);
});

setInterval(loadState, 15000);
loadState();

async function loadState() {
  try {
    const state = await api('/api/state');
    renderState(state);
  } catch (error) {
    showError(error);
  }
}

async function api(path, options = {}) {
  if (!adminToken) {
    throw new Error('请先填写管理口令。');
  }

  const response = await fetch(path, {
    ...options,
    headers: {
      authorization: `Bearer ${adminToken}`,
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `请求失败：${response.status}`);
  }
  return body;
}

function renderState(state) {
  loginPanel.classList.toggle('saved', Boolean(adminToken));
  statusEl.textContent = state.running ? '更新中' : statusText(state.status);
  statusEl.dataset.status = state.running ? 'running' : state.status;
  lastMessageEl.textContent = state.lastError || '服务正常。';
  lastSucceededAtEl.textContent = formatDate(state.lastSucceededAt);
  publishedBytesEl.textContent = state.lastPublishedBytes
    ? `${formatBytes(state.lastPublishedBytes)} · ${shortHash(state.lastPublishedSha256)}`
    : '-';
  renderProfiles(state.profiles || []);

  const logs = [...(state.logs || [])].reverse();
  logsEl.innerHTML = logs.length
    ? logs.map((item) => `<li><time>${escapeHtml(formatDate(item.at))}</time><span>${escapeHtml(item.message)}</span></li>`).join('')
    : '<li><span>暂无日志。</span></li>';
}

function setBusy(isBusy) {
  updateButton.disabled = isBusy;
  updateButton.textContent = isBusy ? '更新中...' : '立即更新';
}

function showError(error) {
  statusEl.textContent = '需要处理';
  statusEl.dataset.status = 'failed';
  lastMessageEl.textContent = error.message;
}

function renderProfiles(profiles) {
  profileCountEl.textContent = profiles.length ? `${profiles.length} 个` : '-';
  copyAllButton.disabled = profiles.length === 0;

  profilesListEl.innerHTML = profiles.length
    ? profiles.map(renderProfile).join('')
    : '<p class="empty">暂无订阅档案。</p>';
}

function renderProfile(profile) {
  const status = profile.status || 'idle';
  const detail = profile.lastError
    ? profile.lastError
    : profile.lastPublishedBytes
      ? `${formatBytes(profile.lastPublishedBytes)} · ${shortHash(profile.lastPublishedSha256)}`
      : '还没有发布配置。';

  return `
    <article class="profile-row" data-profile-row>
      <div class="profile-main">
        <div class="profile-title">
          <strong>${escapeHtml(profile.name || profile.id)}</strong>
          <span data-status="${escapeHtml(status)}">${escapeHtml(statusText(status))}</span>
        </div>
        <p>${escapeHtml(profile.target || '-')} · ${escapeHtml(profile.publicPath || '-')}</p>
        <code data-profile-url>${escapeHtml(profile.downloadUrl || '-')}</code>
        <p>${escapeHtml(detail)}</p>
      </div>
      <button type="button" class="secondary" data-copy-profile>复制</button>
    </article>
  `;
}

function statusText(status) {
  const map = {
    idle: '空闲',
    failed: '失败',
    running: '更新中',
  };
  return map[status] || status || '未知';
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(value));
}

function formatBytes(value) {
  if (!Number.isFinite(value)) return '-';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function shortHash(value) {
  return value ? value.slice(0, 10) : '-';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
