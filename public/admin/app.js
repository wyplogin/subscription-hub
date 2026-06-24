const tokenInput = document.querySelector('#tokenInput');
const saveTokenButton = document.querySelector('#saveTokenButton');
const updateButton = document.querySelector('#updateButton');
const refreshButton = document.querySelector('#refreshButton');
const copyAllButton = document.querySelector('#copyAllButton');
const saveSettingsButton = document.querySelector('#saveSettingsButton');
const loginPanel = document.querySelector('#loginPanel');
const statusEl = document.querySelector('#status');
const lastMessageEl = document.querySelector('#lastMessage');
const lastSucceededAtEl = document.querySelector('#lastSucceededAt');
const publishedBytesEl = document.querySelector('#publishedBytes');
const profileCountEl = document.querySelector('#profileCount');
const profilesListEl = document.querySelector('#profilesList');
const converterUrlInput = document.querySelector('#converterUrlInput');
const templateUrlInput = document.querySelector('#templateUrlInput');
const converterInputSelect = document.querySelector('#converterInputSelect');
const extraParamsInput = document.querySelector('#extraParamsInput');
const profilesEditorEl = document.querySelector('#profilesEditor');
const logsEl = document.querySelector('#logs');

const primaryProviderParams = 'include=Premium&rename=%60Premium%40Pre%60';
const secondaryProviderParams =
  'exclude=%E6%98%9F%E9%93%BE%7C%E6%B8%B8%E6%88%8F%7C5G%7C%E5%AE%9E%E9%AA%8C&include=%E9%A6%99%E6%B8%AF%7C%E6%96%B0%E5%8A%A0%E5%9D%A1%7C%E6%97%A5%E6%9C%AC%7C%E7%BE%8E%E5%9B%BD&rename=%60%E9%A6%99%E6%B8%AF%E5%AE%B6%E5%AE%BD%5Cs*(%5Cd%2B).*%40Hong%20Kong%20%241%20%5BPre%5D%60%60%E9%A6%99%E6%B8%AF%5Cs*(%5Cd%2B).*%40Hong%20Kong%20%241%60%60%E6%96%B0%E5%8A%A0%E5%9D%A1%E5%AE%B6%E5%AE%BD.*%40Singapore%20%5BPre%5D%60%60%E6%96%B0%E5%8A%A0%E5%9D%A1%5Cs*(%5Cd%2B).*%40Singapore%20%241%60%60%E6%97%A5%E6%9C%AC%E5%AE%B6%E5%AE%BD%5Cs*(%5Cd%2B).*%40Japan%20%241%20%5BPre%5D%60%60%E6%97%A5%E6%9C%AC%5Cs*(%5Cd%2B).*%40Japan%20%241%60%60%E7%BE%8E%E5%9B%BD-%E5%AE%B6%E5%AE%BD%5Cs*(%5Cd%2B).*%40United%20States%20%241%20%5BPre%5D%60%60%E7%BE%8E%E5%9B%BD-%E8%B4%B9%E5%9F%8E.*%40United%20States%20Philadelphia%60%60%E7%BE%8E%E5%9B%BD-%E7%BA%BD%E7%BA%A6%5Cs*(%5Cd%2B).*%40United%20States%20New%20York%20%241%60%60%E7%BE%8E%E5%9B%BD-%E6%B4%9B%E6%9D%89%E7%9F%B6%5Cs*(%5Cd%2B).*%40United%20States%20Los%20Angeles%20%241%60%60%E7%BE%8E%E5%9B%BD-%E7%9B%90%E6%B9%96%E5%9F%8E.*%40United%20States%20Salt%20Lake%20City%60%60%E7%BE%8E%E5%9B%BD-%E5%9C%A3%E4%BD%95%E5%A1%9E.*%40United%20States%20San%20Jose%60%60%E7%BE%8E%E5%9B%BD-%E8%BF%88%E9%98%BF%E5%AF%86.*%40United%20States%20Miami%60%60%E7%BE%8E%E5%9B%BD-%E8%A5%BF%E9%9B%85%E5%9B%BE.*%40United%20States%20Seattle%60%60%E7%BE%8E%E5%9B%BD-%E6%AA%80%E9%A6%99%E5%B1%B1.*%40United%20States%20Honolulu%60%60%E7%BE%8E%E5%9B%BD-%E6%97%A7%E9%87%91%E5%B1%B1.*%40United%20States%20San%20Francisco%60%60%E7%BE%8E%E5%9B%BD-%E5%87%A4%E5%87%B0%E5%9F%8E.*%40United%20States%20Phoenix%60%60%E7%BE%8E%E5%9B%BD-%E8%BE%BE%E6%8B%89%E6%96%AF.*%40United%20States%20Dallas%60%60%E7%BE%8E%E5%9B%BD-%E4%BC%91%E6%96%AF%E9%A1%BF.*%40United%20States%20Houston%60%60%E7%BE%8E%E5%9B%BD-%E8%8A%9D%E5%8A%A0%E5%93%A5.*%40United%20States%20Chicago%60%60%E7%BE%8E%E5%9B%BD-%E5%A4%8F%E6%B4%9B%E7%89%B9.*%40United%20States%20Charlotte%60%60%E7%BE%8E%E5%9B%BD-%E6%96%AF%E6%B3%A2%E5%9D%8E.*%40United%20States%20Spokane%60%60%E7%BE%8E%E5%9B%BD-%E9%98%BF%E4%BB%80%E6%9C%AC.*%40United%20States%20Ashburn%60%60%E7%BE%8E%E5%9B%BD-%E6%8B%89%E6%96%AF%E7%BB%B4%E5%8A%A0%E6%96%AF.*%40United%20States%20Las%20Vegas%60%60%E7%BE%8E%E5%9B%BD-%E5%AE%9E%E9%AA%8C%E8%8A%82%E7%82%B9.*%40United%20States%20Experimental%60';

const defaultSettings = {
  converter: {
    url: 'https://sub.dler.io/sub',
    input: 'provider-url',
    templateUrl: '',
    extraParams: 'emoji=true&udp=true&list=false',
  },
  profiles: [
    {
      id: 'clash-ss',
      name: 'Clash SS',
      subscriptionUrl: '',
      path: '/clash-ss.yaml',
      target: 'clash',
      templateUrl: '',
      extraParams: primaryProviderParams,
    },
    {
      id: 'clash-anytls',
      name: 'Clash AnyTLS',
      subscriptionUrl: '',
      path: '/clash-anytls.yaml',
      target: 'clash',
      templateUrl: '',
      extraParams: primaryProviderParams,
    },
    {
      id: 'clash-ss-secondary',
      name: 'Clash SS 2',
      subscriptionUrl: '',
      path: '/clash-ss-2.yaml',
      target: 'clash',
      templateUrl: '',
      extraParams: secondaryProviderParams,
    },
  ],
};

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

saveSettingsButton.addEventListener('click', async () => {
  setSaving(true);
  try {
    const settings = collectSettings();
    const saved = await api('/api/settings', { method: 'PUT', body: JSON.stringify(settings) });
    renderSettings(saved);
    await loadState();
    saveSettingsButton.textContent = '已保存';
    setTimeout(() => {
      saveSettingsButton.textContent = '保存设置';
    }, 1200);
  } catch (error) {
    showError(error);
  } finally {
    setSaving(false);
  }
});

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

profilesEditorEl.addEventListener('input', (event) => {
  const input = event.target.closest('[data-field="extraParams"]');
  if (!input) return;

  const row = input.closest('[data-profile-editor]');
  const preview = row?.querySelector('[data-rule-preview]');
  if (preview) {
    preview.innerHTML = renderRulePreview(input.value);
  }
});

setInterval(loadState, 15000);
loadInitial();

async function loadInitial() {
  renderSettings(defaultSettings);
  await loadSettings();
  await loadState();
}

async function loadSettings() {
  try {
    const settings = await api('/api/settings');
    renderSettings(settings);
  } catch (error) {
    showError(error);
  }
}

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

function setSaving(isSaving) {
  saveSettingsButton.disabled = isSaving;
  saveSettingsButton.textContent = isSaving ? '保存中...' : saveSettingsButton.textContent;
}

function showError(error) {
  statusEl.textContent = '需要处理';
  statusEl.dataset.status = 'failed';
  lastMessageEl.textContent = error.message;
}

function renderSettings(settings) {
  const profiles = normalizeProfiles(settings.profiles);
  const merged = {
    ...defaultSettings,
    ...settings,
    converter: {
      ...defaultSettings.converter,
      ...(settings.converter || {}),
    },
    profiles,
  };

  converterUrlInput.value = merged.converter.url || '';
  templateUrlInput.value = merged.converter.templateUrl || '';
  converterInputSelect.value = merged.converter.input || 'provider-url';
  extraParamsInput.value = merged.converter.extraParams || '';

  profilesEditorEl.innerHTML = merged.profiles.map(renderProfileEditor).join('');
}

function normalizeProfiles(profiles = []) {
  const savedById = new Map(
    profiles
      .filter((profile) => profile && typeof profile === 'object')
      .map((profile) => [profile.id, profile]),
  );
  const mergedDefaults = defaultSettings.profiles.map((profile) => ({
    ...profile,
    ...(savedById.get(profile.id) || {}),
    target: 'clash',
    extraParams: savedById.get(profile.id)?.extraParams || profile.extraParams,
  }));
  const customProfiles = profiles
    .filter((profile) => profile && typeof profile === 'object')
    .filter((profile) => !defaultSettings.profiles.some((fallback) => fallback.id === profile.id))
    .filter((profile) => (profile.target || 'clash') === 'clash')
    .map((profile) => ({ ...profile, target: 'clash' }));

  return [...mergedDefaults, ...customProfiles];
}

function renderProfileEditor(profile) {
  return `
    <article class="profile-editor" data-profile-editor>
      <div class="editor-header">
        <div>
          <strong>${escapeHtml(profile.name || profile.id)}</strong>
          <span>Clash 配置</span>
        </div>
        <code>${escapeHtml(profile.path || '')}</code>
      </div>
      <input type="hidden" data-field="id" value="${escapeHtml(profile.id || '')}" />
      <input type="hidden" data-field="target" value="clash" />
      <label>
        <span>显示名称</span>
        <input data-field="name" type="text" value="${escapeHtml(profile.name || '')}" />
      </label>
      <label>
        <span>机场订阅链接</span>
        <textarea data-field="subscriptionUrl" rows="3">${escapeHtml(profile.subscriptionUrl || '')}</textarea>
      </label>
      <div class="settings-grid compact">
        <label>
          <span>公开路径</span>
          <input data-field="path" type="text" value="${escapeHtml(profile.path || '')}" />
        </label>
      </div>
      <details class="advanced-settings"${profile.templateUrl || profile.extraParams ? ' open' : ''}>
        <summary>单独转换参数</summary>
        <div class="settings-grid compact">
          <label>
            <span>单独分流模板</span>
            <input data-field="templateUrl" type="url" value="${escapeHtml(profile.templateUrl || '')}" placeholder="留空则使用上面的分流模板" />
          </label>
          <label>
            <span>单独额外参数</span>
            <textarea data-field="extraParams" rows="3" placeholder="例如 ver=4&diyua=ShadowRocket">${escapeHtml(profile.extraParams || '')}</textarea>
          </label>
        </div>
        <div class="rule-preview" data-rule-preview>
          ${renderRulePreview(profile.extraParams || '')}
        </div>
      </details>
    </article>
  `;
}

function renderRulePreview(extraParams) {
  const rules = decodeRuleParams(extraParams);
  const rows = [];

  if (rules.include) rows.push(rulePreviewRow('包含节点', rules.include));
  if (rules.exclude) rows.push(rulePreviewRow('排除节点', rules.exclude));
  if (rules.rename.length) {
    rows.push(`
      <div class="rule-preview-block">
        <span>重命名正则</span>
        <ol>${rules.rename.map((item) => `<li><code>${escapeHtml(item)}</code></li>`).join('')}</ol>
      </div>
    `);
  }

  return rows.length ? rows.join('') : '<p>没有单独筛选或重命名规则。</p>';
}

function decodeRuleParams(extraParams) {
  const params = new URLSearchParams(extraParams || '');
  return {
    include: params.get('include') || '',
    exclude: params.get('exclude') || '',
    rename: splitRenameRules(params.get('rename') || ''),
  };
}

function splitRenameRules(rename) {
  return rename
    .split('`')
    .map((item) => item.trim())
    .filter(Boolean);
}

function rulePreviewRow(label, value) {
  return `
    <div class="rule-preview-row">
      <span>${escapeHtml(label)}</span>
      <code>${escapeHtml(value)}</code>
    </div>
  `;
}

function collectSettings() {
  return {
    converter: {
      url: converterUrlInput.value.trim(),
      input: converterInputSelect.value,
      templateUrl: templateUrlInput.value.trim(),
      extraParams: extraParamsInput.value.trim(),
    },
    profiles: [...profilesEditorEl.querySelectorAll('[data-profile-editor]')].map((row) => ({
      id: valueOf(row, 'id'),
      name: valueOf(row, 'name'),
      subscriptionUrl: valueOf(row, 'subscriptionUrl'),
      path: valueOf(row, 'path'),
      target: 'clash',
      templateUrl: valueOf(row, 'templateUrl'),
      extraParams: valueOf(row, 'extraParams'),
    })),
  };
}

function valueOf(row, field) {
  return row.querySelector(`[data-field="${field}"]`)?.value.trim() || '';
}

function renderProfiles(profiles) {
  profileCountEl.textContent = profiles.length ? `${profiles.length} 个` : '-';
  copyAllButton.disabled = profiles.length === 0;

  profilesListEl.innerHTML = profiles.length
    ? profiles.map(renderProfile).join('')
    : '<p class="empty">暂无订阅档案。</p>';
}

function renderProfile(profile) {
  const status = profile.configured ? profile.status || 'idle' : 'pending';
  const detail = profile.lastError
    ? profile.lastError
    : profile.lastPublishedBytes
      ? `${formatBytes(profile.lastPublishedBytes)} · ${shortHash(profile.lastPublishedSha256)}`
      : profile.configured
        ? '还没有发布配置。'
        : '还没有填写机场订阅链接。';

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
    pending: '待填写',
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
