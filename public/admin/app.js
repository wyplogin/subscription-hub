const tokenInput = document.querySelector('#tokenInput');
const saveTokenButton = document.querySelector('#saveTokenButton');
const updateButton = document.querySelector('#updateButton');
const refreshButton = document.querySelector('#refreshButton');
const copyAllButton = document.querySelector('#copyAllButton');
const saveSettingsButton = document.querySelector('#saveSettingsButton');
const addProviderButton = document.querySelector('#addProviderButton');
const loginPanel = document.querySelector('#loginPanel');
const statusEl = document.querySelector('#status');
const lastMessageEl = document.querySelector('#lastMessage');
const lastSucceededAtEl = document.querySelector('#lastSucceededAt');
const publishedBytesEl = document.querySelector('#publishedBytes');
const profileCountEl = document.querySelector('#profileCount');
const profilesListEl = document.querySelector('#profilesList');
const converterUrlInput = document.querySelector('#converterUrlInput');
const templateUrlInput = document.querySelector('#templateUrlInput');
const converterInputSegmented = document.querySelector('#converterInputSegmented');
const extraParamsInput = document.querySelector('#extraParamsInput');
const providersListEl = document.querySelector('#providersList');
const profilesEditorEl = document.querySelector('#profilesEditor');
const logsEl = document.querySelector('#logs');

const primaryProviderParams = 'include=Premium&rename=%60Premium%40Pre%60';
const secondaryProviderParams =
  'exclude=%E6%98%9F%E9%93%BE%7C%E6%B8%B8%E6%88%8F%7C5G%7C%E5%AE%9E%E9%AA%8C&include=%E9%A6%99%E6%B8%AF%7C%E6%96%B0%E5%8A%A0%E5%9D%A1%7C%E6%97%A5%E6%9C%AC%7C%E7%BE%8E%E5%9B%BD&rename=%60%E9%A6%99%E6%B8%AF%E5%AE%B6%E5%AE%BD%5Cs*(%5Cd%2B).*%40Hong%20Kong%20%241%20%5BPre%5D%60%60%E9%A6%99%E6%B8%AF%5Cs*(%5Cd%2B).*%40Hong%20Kong%20%241%60%60%E6%96%B0%E5%8A%A0%E5%9D%A1%E5%AE%B6%E5%AE%BD.*%40Singapore%20%5BPre%5D%60%60%E6%96%B0%E5%8A%A0%E5%9D%A1%5Cs*(%5Cd%2B).*%40Singapore%20%241%60%60%E6%97%A5%E6%9C%AC%E5%AE%B6%E5%AE%BD%5Cs*(%5Cd%2B).*%40Japan%20%241%20%5BPre%5D%60%60%E6%97%A5%E6%9C%AC%5Cs*(%5Cd%2B).*%40Japan%20%241%60%60%E7%BE%8E%E5%9B%BD-%E5%AE%B6%E5%AE%BD%5Cs*(%5Cd%2B).*%40United%20States%20%241%20%5BPre%5D%60%60%E7%BE%8E%E5%9B%BD-%E8%B4%B9%E5%9F%8E.*%40United%20States%20Philadelphia%60%60%E7%BE%8E%E5%9B%BD-%E7%BA%BD%E7%BA%A6%5Cs*(%5Cd%2B).*%40United%20States%20New%20York%20%241%60%60%E7%BE%8E%E5%9B%BD-%E6%B4%9B%E6%9D%89%E7%9F%B6%5Cs*(%5Cd%2B).*%40United%20States%20Los%20Angeles%20%241%60%60%E7%BE%8E%E5%9B%BD-%E7%9B%90%E6%B9%96%E5%9F%8E.*%40United%20States%20Salt%20Lake%20City%60%60%E7%BE%8E%E5%9B%BD-%E5%9C%A3%E4%BD%95%E5%A1%9E.*%40United%20States%20San%20Jose%60%60%E7%BE%8E%E5%9B%BD-%E8%BF%88%E9%98%BF%E5%AF%86.*%40United%20States%20Miami%60%60%E7%BE%8E%E5%9B%BD-%E8%A5%BF%E9%9B%85%E5%9B%BE.*%40United%20States%20Seattle%60%60%E7%BE%8E%E5%9B%BD-%E6%AA%80%E9%A6%99%E5%B1%B1.*%40United%20States%20Honolulu%60%60%E7%BE%8E%E5%9B%BD-%E6%97%A7%E9%87%91%E5%B1%B1.*%40United%20States%20San%20Francisco%60%60%E7%BE%8E%E5%9B%BD-%E5%87%A4%E5%87%B0%E5%9F%8E.*%40United%20States%20Phoenix%60%60%E7%BE%8E%E5%9B%BD-%E8%BE%BE%E6%8B%89%E6%96%AF.*%40United%20States%20Dallas%60%60%E7%BE%8E%E5%9B%BD-%E4%BC%91%E6%96%AF%E9%A1%BF.*%40United%20States%20Houston%60%60%E7%BE%8E%E5%9B%BD-%E8%8A%9D%E5%8A%A0%E5%93%A5.*%40United%20States%20Chicago%60%60%E7%BE%8E%E5%9B%BD-%E5%A4%8F%E6%B4%9B%E7%89%B9.*%40United%20States%20Charlotte%60%60%E7%BE%8E%E5%9B%BD-%E6%96%AF%E6%B3%A2%E5%9D%8E.*%40United%20States%20Spokane%60%60%E7%BE%8E%E5%9B%BD-%E9%98%BF%E4%BB%80%E6%9C%AC.*%40United%20States%20Ashburn%60%60%E7%BE%8E%E5%9B%BD-%E6%8B%89%E6%96%AF%E7%BB%B4%E5%8A%A0%E6%96%AF.*%40United%20States%20Las%20Vegas%60%60%E7%BE%8E%E5%9B%BD-%E5%AE%9E%E9%AA%8C%E8%8A%82%E7%82%B9.*%40United%20States%20Experimental%60';

const providerDefaultParams = {
  primary: primaryProviderParams,
  secondary: secondaryProviderParams,
};

const defaultSettings = {
  converter: {
    url: 'https://sub.dler.io/sub',
    input: 'provider-url',
    templateUrl: '',
    extraParams: 'emoji=true&udp=true&list=false',
  },
  providers: [
    { id: 'primary', name: '机场一', extraParams: primaryProviderParams },
    { id: 'secondary', name: '机场二', extraParams: secondaryProviderParams },
  ],
  profiles: [
    { id: 'clash-ss', name: 'Clash SS', subscriptionUrl: '', path: '/clash-ss.yaml', target: 'clash', providerId: 'primary' },
    { id: 'clash-anytls', name: 'Clash AnyTLS', subscriptionUrl: '', path: '/clash-anytls.yaml', target: 'clash', providerId: 'primary' },
    { id: 'clash-ss-secondary', name: 'Clash SS 2', subscriptionUrl: '', path: '/clash-ss-2.yaml', target: 'clash', providerId: 'secondary' },
  ],
};

// Authoritative client-side copy of the settings, kept in sync with the DOM.
let model = structuredClone(defaultSettings);

let adminToken = localStorage.getItem('adminToken') || '';
tokenInput.value = adminToken;

saveTokenButton.addEventListener('click', () => {
  adminToken = tokenInput.value.trim();
  localStorage.setItem('adminToken', adminToken);
  loadInitial();
});

updateButton.addEventListener('click', () => runUpdate(null));

refreshButton.addEventListener('click', loadState);

addProviderButton.addEventListener('click', () => {
  syncModelFromDom();
  const id = nextProviderId();
  model.providers.push({ id, name: `机场${model.providers.length + 1}`, extraParams: '' });
  renderProviders();
  renderProfilesEditor();
});

saveSettingsButton.addEventListener('click', async () => {
  setSaving(true);
  try {
    syncModelFromDom();
    const saved = await api('/api/settings', { method: 'PUT', body: JSON.stringify(model) });
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
    .filter((value) => value && value !== '-');
  if (!urls.length) return;
  await navigator.clipboard.writeText(urls.join('\n'));
  flashButton(copyAllButton, '已复制', '复制全部');
});

// Device list: copy + per-profile update.
profilesListEl.addEventListener('click', async (event) => {
  const copyButton = event.target.closest('[data-copy-profile]');
  if (copyButton) {
    const row = copyButton.closest('[data-profile-row]');
    const url = row?.querySelector('[data-profile-url]')?.textContent.trim();
    if (!url || url === '-') return;
    await navigator.clipboard.writeText(url);
    flashButton(copyButton, '已复制', '复制');
    return;
  }

  const updateOne = event.target.closest('[data-update-profile]');
  if (updateOne) {
    runUpdate(updateOne.dataset.updateProfile);
  }
});

// Airport cards: reset rules, delete, live rule preview.
providersListEl.addEventListener('click', (event) => {
  const reset = event.target.closest('[data-reset-rules]');
  if (reset) {
    const card = reset.closest('[data-provider-id]');
    const id = card?.dataset.providerId;
    const textarea = card?.querySelector('[data-field="extraParams"]');
    if (!textarea) return;
    textarea.value = providerDefaultParams[id] || '';
    updateRulePreview(card);
    return;
  }

  const remove = event.target.closest('[data-delete-provider]');
  if (remove) {
    const card = remove.closest('[data-provider-id]');
    deleteProvider(card?.dataset.providerId);
  }
});

providersListEl.addEventListener('input', (event) => {
  if (!event.target.closest('[data-field="extraParams"]')) return;
  updateRulePreview(event.target.closest('[data-provider-id]'));
});

converterInputSegmented.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-value]');
  if (!button) return;
  setSegmentedValue(button.dataset.value);
});

// Sidebar navigation: show one view at a time so the page stays short.
const navItems = document.querySelectorAll('.nav-item');
const viewSections = document.querySelectorAll('.view');
const viewTitleEl = document.querySelector('#viewTitle');
const viewSubtitleEl = document.querySelector('#viewSubtitle');
const viewMeta = {
  overview: ['概览', '查看更新状态与设备订阅地址'],
  providers: ['机场', '管理机场名称与筛选 / 重命名规则'],
  settings: ['订阅设置', '转换地址、模板与各订阅的机场归属'],
  logs: ['更新日志', '最近的更新记录'],
};

navItems.forEach((item) => item.addEventListener('click', () => switchView(item.dataset.view)));

function switchView(view) {
  navItems.forEach((item) => item.classList.toggle('active', item.dataset.view === view));
  viewSections.forEach((section) => {
    section.hidden = section.dataset.view !== view;
  });
  const meta = viewMeta[view];
  if (meta) {
    viewTitleEl.textContent = meta[0];
    viewSubtitleEl.textContent = meta[1];
  }
}

setInterval(loadState, 15000);
loadInitial();

async function loadInitial() {
  renderSettings(model);
  if (!adminToken) {
    renderState({ status: 'idle', profiles: [] });
    return;
  }
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
  if (!adminToken) return;
  try {
    const state = await api('/api/state');
    renderState(state);
  } catch (error) {
    showError(error);
  }
}

async function runUpdate(profileId) {
  setBusy(true);
  try {
    const body = profileId ? JSON.stringify({ profileId }) : undefined;
    const result = await api('/api/update', { method: 'POST', ...(body ? { body } : {}) });
    renderState(result.state ? { ...result.state, profiles: result.profiles } : result);
  } catch (error) {
    showError(error);
    await loadState();
  } finally {
    setBusy(false);
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

/* Settings rendering --------------------------------------------------- */

function renderSettings(settings) {
  model = normalizeModel(settings);

  converterUrlInput.value = model.converter.url || '';
  templateUrlInput.value = model.converter.templateUrl || '';
  extraParamsInput.value = model.converter.extraParams || '';
  setSegmentedValue(model.converter.input || 'provider-url');

  renderProviders();
  renderProfilesEditor();
}

function normalizeModel(settings = {}) {
  const providers = Array.isArray(settings.providers) && settings.providers.length
    ? settings.providers.map((provider) => ({
        id: provider.id,
        name: provider.name || provider.id,
        extraParams: provider.extraParams || '',
      }))
    : structuredClone(defaultSettings.providers);

  const providerIds = new Set(providers.map((provider) => provider.id));
  const profiles = (Array.isArray(settings.profiles) ? settings.profiles : defaultSettings.profiles).map((profile) => ({
    id: profile.id,
    name: profile.name || profile.id,
    subscriptionUrl: profile.subscriptionUrl || '',
    path: profile.path || profile.publicPath || `/${profile.id}.yaml`,
    target: 'clash',
    providerId: providerIds.has(profile.providerId) ? profile.providerId : providers[0]?.id || '',
  }));

  return {
    converter: { ...defaultSettings.converter, ...(settings.converter || {}) },
    providers,
    profiles,
  };
}

function renderProviders() {
  providersListEl.innerHTML = model.providers.map(renderProviderCard).join('');
}

function renderProviderCard(provider) {
  return `
    <details class="provider-card" data-provider-id="${escapeHtml(provider.id)}" open>
      <summary>
        <span class="editor-heading">
          <strong data-provider-name>${escapeHtml(provider.name || provider.id)}</strong>
        </span>
        <span class="chevron" aria-hidden="true"></span>
      </summary>
      <div class="editor-body">
        <label class="field">
          <span>机场名称</span>
          <input data-field="name" type="text" value="${escapeHtml(provider.name || '')}" placeholder="例如 机场一" />
        </label>
        <section class="rules-panel">
          <div class="rules-title">
            <span>筛选与重命名规则预览</span>
            <button type="button" class="btn-ghost btn-small" data-reset-rules>恢复默认规则</button>
          </div>
          <div class="rule-preview" data-rule-preview>
            ${renderRulePreview(provider.extraParams || '')}
          </div>
        </section>
        <label class="field">
          <span>原始参数（include / exclude / rename）</span>
          <textarea data-field="extraParams" rows="4" placeholder="例如 include=Premium&rename=...">${escapeHtml(provider.extraParams || '')}</textarea>
        </label>
        <div class="card-actions">
          <button type="button" class="btn-danger btn-small" data-delete-provider>删除机场</button>
        </div>
      </div>
    </details>
  `;
}

function deleteProvider(id) {
  if (!id) return;
  syncModelFromDom();
  if (model.providers.length <= 1) {
    showError(new Error('至少需要保留一个机场。'));
    return;
  }
  const used = model.profiles.filter((profile) => profile.providerId === id);
  if (used.length) {
    const names = used.map((profile) => profile.name || profile.id).join('、');
    showError(new Error(`还有订阅（${names}）属于这个机场，请先改归属再删除。`));
    return;
  }
  model.providers = model.providers.filter((provider) => provider.id !== id);
  renderProviders();
  renderProfilesEditor();
}

function nextProviderId() {
  const existing = new Set(model.providers.map((provider) => provider.id));
  let index = model.providers.length + 1;
  let id = `airport-${index}`;
  while (existing.has(id)) {
    index += 1;
    id = `airport-${index}`;
  }
  return id;
}

function renderProfilesEditor() {
  profilesEditorEl.innerHTML = model.profiles.map(renderProfileEditor).join('');
}

function renderProfileEditor(profile) {
  const options = model.providers
    .map(
      (provider) =>
        `<option value="${escapeHtml(provider.id)}"${provider.id === profile.providerId ? ' selected' : ''}>${escapeHtml(
          provider.name || provider.id,
        )}</option>`,
    )
    .join('');

  return `
    <details class="profile-editor" data-profile-id="${escapeHtml(profile.id)}" open>
      <summary>
        <span class="editor-heading">
          <strong>${escapeHtml(profile.name || profile.id)}</strong>
          <code>${escapeHtml(profile.path || '')}</code>
        </span>
        <span class="chevron" aria-hidden="true"></span>
      </summary>
      <div class="editor-body">
        <div class="settings-grid compact">
          <label class="field">
            <span>显示名称</span>
            <input data-field="name" type="text" value="${escapeHtml(profile.name || '')}" />
          </label>
          <label class="field">
            <span>所属机场</span>
            <select data-field="providerId">${options}</select>
          </label>
        </div>
        <label class="field">
          <span>机场订阅链接</span>
          <textarea data-field="subscriptionUrl" rows="3" placeholder="https://...">${escapeHtml(profile.subscriptionUrl || '')}</textarea>
        </label>
        <label class="field">
          <span>公开路径</span>
          <input data-field="path" type="text" value="${escapeHtml(profile.path || '')}" />
        </label>
      </div>
    </details>
  `;
}

/* Read the DOM back into the model before structural changes or saving. */
function syncModelFromDom() {
  model.converter = {
    url: converterUrlInput.value.trim(),
    input: currentSegmentedValue(),
    templateUrl: templateUrlInput.value.trim(),
    extraParams: extraParamsInput.value.trim(),
  };

  model.providers = [...providersListEl.querySelectorAll('[data-provider-id]')].map((card) => ({
    id: card.dataset.providerId,
    name: fieldValue(card, 'name'),
    extraParams: fieldValue(card, 'extraParams'),
  }));

  model.profiles = [...profilesEditorEl.querySelectorAll('[data-profile-id]')].map((card) => ({
    id: card.dataset.profileId,
    name: fieldValue(card, 'name'),
    subscriptionUrl: fieldValue(card, 'subscriptionUrl'),
    path: fieldValue(card, 'path'),
    target: 'clash',
    providerId: fieldValue(card, 'providerId'),
  }));
}

function fieldValue(card, field) {
  return card.querySelector(`[data-field="${field}"]`)?.value.trim() || '';
}

/* Segmented control ---------------------------------------------------- */

function setSegmentedValue(value) {
  [...converterInputSegmented.querySelectorAll('button')].forEach((button) => {
    button.classList.toggle('active', button.dataset.value === value);
  });
}

function currentSegmentedValue() {
  return converterInputSegmented.querySelector('button.active')?.dataset.value || 'provider-url';
}

/* Rule preview --------------------------------------------------------- */

function updateRulePreview(card) {
  const preview = card?.querySelector('[data-rule-preview]');
  const extraParams = card?.querySelector('[data-field="extraParams"]');
  if (preview && extraParams) {
    preview.innerHTML = renderRulePreview(extraParams.value);
  }
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

  return rows.length ? rows.join('') : '<p>没有筛选或重命名规则。</p>';
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

/* State rendering ------------------------------------------------------ */

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
    ? logs
        .map((item) => `<li><time>${escapeHtml(formatDate(item.at))}</time><span>${escapeHtml(item.message)}</span></li>`)
        .join('')
    : '<li><span>暂无日志。</span></li>';
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

  const updateDisabled = profile.configured ? '' : ' disabled';

  return `
    <article class="profile-row" data-profile-row>
      <div class="profile-main">
        <div class="profile-title">
          <strong>${escapeHtml(profile.name || profile.id)}</strong>
          <span class="badge" data-status="${escapeHtml(status)}">${escapeHtml(statusText(status))}</span>
        </div>
        <p>${escapeHtml(profile.publicPath || '-')}</p>
        <code data-profile-url>${escapeHtml(profile.downloadUrl || '-')}</code>
        <p>${escapeHtml(detail)}</p>
      </div>
      <div class="profile-actions">
        <button type="button" class="btn-soft btn-small" data-update-profile="${escapeHtml(profile.id)}" data-configured="${profile.configured ? 'true' : 'false'}"${updateDisabled}>更新此订阅</button>
        <button type="button" class="btn-ghost btn-small" data-copy-profile>复制</button>
      </div>
    </article>
  `;
}

/* UI helpers ----------------------------------------------------------- */

function setBusy(isBusy) {
  updateButton.disabled = isBusy;
  updateButton.textContent = isBusy ? '更新中...' : '立即更新全部';
  profilesListEl.querySelectorAll('[data-update-profile]').forEach((button) => {
    if (isBusy) {
      button.disabled = true;
    } else if (button.dataset.configured !== 'false') {
      button.disabled = false;
    }
  });
}

function setSaving(isSaving) {
  saveSettingsButton.disabled = isSaving;
  if (isSaving) saveSettingsButton.textContent = '保存中...';
}

function flashButton(button, activeText, restoreText) {
  button.textContent = activeText;
  setTimeout(() => {
    button.textContent = restoreText;
  }, 1200);
}

function showError(error) {
  statusEl.textContent = '需要处理';
  statusEl.dataset.status = 'failed';
  lastMessageEl.textContent = error.message;
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
