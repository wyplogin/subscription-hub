# 订阅更新中转服务

这个项目把现在手动做的几步合成一个小服务：

1. 登录机场网站并点击“开启订阅”。
2. 在 10 分钟窗口内拉取多个客户端/协议的原始订阅。
3. 通过 subconverter 分别转换成 Clash、Surge 等客户端配置。
4. 发布为固定地址，例如 `/clash-ss.yaml`、`/clash-anytls.yaml`、`/surge-anytls.conf`。
5. 更新失败时保留上一版可用配置。

## 推荐结构

```text
你的设备
  -> https://sub.example.com/clash-ss.yaml
  -> https://sub.example.com/clash-anytls.yaml
  -> https://sub.example.com/surge-anytls.conf
      -> VPS 上的 subscription-hub
          -> 机场订阅链接
          -> subconverter
```

后台页面：

```text
https://sub.example.com/admin/
```

## 本地先跑起来

安装 Node.js 20 或更新版本后，在项目目录执行：

```bash
npm install
npm run init
```

然后编辑 `.env`：

```bash
SUBCONVERTER_URL=https://sub.dler.io/sub
CONFIG_TEMPLATE_URL=你的分流模板地址
```

复制多订阅档案示例：

```bash
cp profiles.example.json data/profiles.json
```

然后编辑 `data/profiles.json`，把三条 `subscriptionUrl` 改成机场提供的真实链接：

```json
[
  {
    "id": "clash-ss",
    "name": "Clash SS",
    "subscriptionUrl": "机场 clash-ss 链接",
    "path": "/clash-ss.yaml",
    "target": "clash"
  },
  {
    "id": "clash-anytls",
    "name": "Clash AnyTLS",
    "subscriptionUrl": "机场 clash-anytls 链接",
    "path": "/clash-anytls.yaml",
    "target": "clash"
  },
  {
    "id": "surge-anytls",
    "name": "Surge AnyTLS",
    "subscriptionUrl": "机场 surge-anytls 链接",
    "path": "/surge-anytls.conf",
    "target": "surge"
  }
]
```

本地测试时建议先用：

```bash
PROVIDER_ADAPTER=manual
CONVERTER_INPUT=provider-url
PUBLIC_BASE_URL=http://localhost:3000
```

这样你可以先手动去机场官网点“开启订阅”，再回到本地后台点“立即更新”。确认流程通了以后，再配置自动登录点击。

启动：

```bash
npm run dev
```

打开：

```text
http://localhost:3000/admin/
```

设备订阅地址会显示在后台页面里。

## 自动登录并点击“开启订阅”

如果机场网站只是普通账号密码登录，可以用通用适配器：

```bash
PROVIDER_ADAPTER=generic-playwright
PROVIDER_LOGIN_URL=https://机场域名/login
PROVIDER_USERNAME=你的账号
PROVIDER_PASSWORD=你的密码
PROVIDER_USERNAME_SELECTOR=input[name="email"]
PROVIDER_PASSWORD_SELECTOR=input[name="password"]
PROVIDER_SUBMIT_SELECTOR=button[type="submit"]
```

如果开启按钮在登录后的当前页面，二选一填写：

```bash
PROVIDER_ENABLE_SELECTOR=#reset-subscribe
```

或：

```bash
PROVIDER_ENABLE_TEXT=开启订阅
```

如果开启按钮在另一个页面，再加：

```bash
PROVIDER_ENABLE_URL=https://机场域名/user
```

如果机场页面有验证码、二次验证或复杂跳转，复制 `src/provider/custom-example.js`，写一个专用适配器，然后设置：

```bash
PROVIDER_ADAPTER=./src/provider/your-provider.js
```

## 放到 GitHub

`.env` 和 `data/` 里的真实订阅内容已被 `.gitignore` 排除，不要把它们传到公开仓库。

第一次上传：

```bash
git init
git add .
git commit -m "Initial subscription hub"
git branch -M main
git remote add origin git@github.com:你的用户名/你的仓库.git
git push -u origin main
```

## 在 VPS 部署

先安装 Docker 和 Nginx，然后把这个目录放到 VPS，例如：

```bash
/opt/subscription-hub
```

从 GitHub 拉取：

```bash
git clone git@github.com:你的用户名/你的仓库.git /opt/subscription-hub
cd /opt/subscription-hub
```

初始化并启动：

```bash
bash deploy/bootstrap-vps.sh
```

然后编辑 `.env`，至少填写：

```bash
PUBLIC_BASE_URL=https://sub.example.com
SUBCONVERTER_URL=https://sub.dler.io/sub
CONFIG_TEMPLATE_URL=你的分流模板地址
```

再创建 VPS 上的真实档案文件：

```bash
cp profiles.example.json data/profiles.json
```

编辑 `data/profiles.json`，填入 `clash-ss`、`clash-anytls`、`surge-anytls` 三条真实订阅链接。这个文件只保留在 VPS，不上传 GitHub。

如果使用第三方 subconverter，并且希望保持旧流程“先把原始配置放到 VPS，再让转换器读取”，使用：

```bash
CONVERTER_INPUT=hosted-raw
```

如果确认可以把机场订阅 URL 直接交给转换器，使用：

```bash
CONVERTER_INPUT=provider-url
```

改完后重启：

```bash
docker compose up -d --build
```

然后把 `deploy/nginx.conf` 里的 `sub.example.com` 改成你的域名，放到 Nginx 配置目录，申请 HTTPS 证书。

后续代码更新：

```bash
bash deploy/update-app.sh
```

## 定时更新

如果希望每天自动更新，把这两个文件复制到 VPS：

```bash
sudo cp deploy/subscription-hub-update.service /etc/systemd/system/
sudo cp deploy/subscription-hub-update.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now subscription-hub-update.timer
```

默认每天 05:10 左右更新一次。你也可以只用网页里的“立即更新”按钮。

也可以在 VPS 手动触发一次：

```bash
./deploy/refresh-now.sh
```

## 日常使用

1. 打开 `/admin/`。
2. 输入 `.env` 里的 `ADMIN_TOKEN`。
3. 点击“立即更新”。
4. 设备里使用页面显示的订阅地址。

默认不设置设备下载口令，订阅地址就是干净的固定链接。`/admin/` 仍然需要 `ADMIN_TOKEN`。

## 配置说明

| 变量 | 作用 |
| --- | --- |
| `PUBLIC_BASE_URL` | 设备访问的公网域名 |
| `ADMIN_TOKEN` | 后台和更新 API 的管理口令 |
| `DOWNLOAD_TOKEN` | 可选。留空时设备订阅地址不带口令 |
| `PROVIDER_SUBSCRIPTION_URL` | 单订阅兼容模式下的机场原始订阅链接 |
| `PROFILES_FILE` | 多订阅档案文件，默认 `data/profiles.json` |
| `PROVIDER_ADAPTER` | `manual`、`generic-playwright` 或自定义 JS 文件 |
| `PROVIDER_ENABLE_URL` | 登录后打开的订阅管理页面，可选 |
| `PROVIDER_ENABLE_SELECTOR` | “开启订阅”按钮的 CSS 选择器 |
| `PROVIDER_ENABLE_TEXT` | “开启订阅”按钮文字，拿不到选择器时使用 |
| `SUBCONVERTER_URL` | subconverter 地址，可以用第三方，也可以自建 |
| `CONVERTER_INPUT` | `hosted-raw` 或 `provider-url` |
| `RAW_DOWNLOAD_TOKEN` | `hosted-raw` 模式下，转换器读取 `configraw.yaml` 的临时口令 |
| `CONFIG_TEMPLATE_URL` | 你的分流模板地址，可选 |
| `KEEP_BACKUPS` | 保留多少份历史配置 |

`data/profiles.json` 支持的常用字段：

| 字段 | 作用 |
| --- | --- |
| `id` | 档案 ID，例如 `clash-ss` |
| `name` | 后台显示名称 |
| `subscriptionUrl` | 机场给这个客户端/协议的原始订阅链接 |
| `path` | 设备访问的固定路径 |
| `target` | subconverter 目标格式，例如 `clash` 或 `surge` |
| `templateUrl` | 这个档案单独使用的分流模板，可选 |
| `extraParams` | 这个档案单独追加的转换参数，可选 |

如果你不想让第三方转换器访问你的 VPS 原始配置，可以把 subconverter 也部署到同一台 VPS，然后把：

```bash
SUBCONVERTER_URL=http://127.0.0.1:25500/sub
```

## 文件位置

服务运行后会写入：

```text
data/profiles.json
data/state.json
data/profiles/clash-ss.raw.yaml
data/profiles/clash-ss.yaml
data/backups/
```

## 排错

后台显示 `Converted subscription does not look like a Clash YAML file`：

```bash
TARGET=clash
```

如果你的模板会输出 Surge 或其他格式，需要对应修改 `TARGET`，并且当前 `/config.yaml` 的校验逻辑也要放宽。

如果某个档案输出 Surge，请在 `data/profiles.json` 里给它设置：

```json
"target": "surge"
```

第三方 subconverter 无法读取原始订阅：

```bash
PUBLIC_BASE_URL=https://sub.example.com
CONVERTER_INPUT=hosted-raw
RAW_DOWNLOAD_TOKEN=换成很长的随机口令
```

多档案模式下，服务会给转换器提供类似 `/raw/clash-ss.yaml` 的临时原始订阅地址。

本地还没配置自动点击：

```bash
PROVIDER_ADAPTER=manual
```

然后先人工去机场官网开启订阅，再回后台点“立即更新”。
