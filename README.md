# 订阅更新中转服务

这个项目把现在手动做的几步合成一个小服务：

1. 打开 `/admin/`，填写机场订阅链接、订阅转换地址、分流模板地址。
2. 保存设置后，下次打开仍然保留。
3. 点“立即更新”，服务会拉取多个客户端/协议的原始订阅。
4. 通过 subconverter 分别转换成 Clash、Surge 等客户端配置。
5. 发布为固定地址，例如 `/clash-ss.yaml`、`/clash-anytls.yaml`、`/surge-anytls.conf`。

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

本地测试时先保持 `.env` 里的 `PROVIDER_ADAPTER=manual`。你可以先手动去机场官网点“开启订阅”，再回到本地后台点“立即更新”。确认流程通了以后，再配置自动登录点击。

后台里可以直接编辑：

- 三条机场订阅链接：`Clash SS`、`Clash AnyTLS`、`Surge AnyTLS`
- 订阅转换地址，例如 `https://sub.dler.io/sub`
- 分流模板地址
- 转换输入模式：直接用机场链接，或先下载到 VPS 再转换

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
git remote add origin git@github.com:wyplogin/subscription-hub.git
git push -u origin main
```

## 在 VPS 部署

先安装 Docker 和 Nginx，然后把这个目录放到 VPS，例如：

```bash
/opt/subscription-hub
```

从 GitHub 拉取：

```bash
git clone git@github.com:wyplogin/subscription-hub.git /opt/subscription-hub
cd /opt/subscription-hub
```

初始化并启动：

```bash
bash deploy/bootstrap-vps.sh
```

然后编辑 `.env`，至少填写后台管理口令：

```bash
ADMIN_TOKEN=换成很长的管理口令
```

订阅链接、订阅转换地址、分流模板地址都在 `/admin/` 里填写和保存。

转换输入模式也在后台面板里选择。通常先用“直接使用机场订阅链接”；如果第三方转换器不能访问机场链接，再改为“先下载到 VPS 再转换”。

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
3. 在“订阅设置”里填写订阅链接、转换地址、分流模板地址。
4. 点击“保存设置”。
5. 点击“立即更新”。
6. 设备里使用页面显示的订阅地址。

默认不设置设备下载口令，订阅地址就是干净的固定链接。`/admin/` 仍然需要 `ADMIN_TOKEN`。

## 配置说明

| 变量 | 作用 |
| --- | --- |
| `PUBLIC_BASE_URL` | 可选。设备访问的公网域名；留空时后台用当前域名显示链接 |
| `ADMIN_TOKEN` | 后台和更新 API 的管理口令 |
| `DOWNLOAD_TOKEN` | 可选。留空时设备订阅地址不带口令 |
| `PROVIDER_ADAPTER` | `manual`、`generic-playwright` 或自定义 JS 文件 |
| `PROVIDER_ENABLE_URL` | 登录后打开的订阅管理页面，可选 |
| `PROVIDER_ENABLE_SELECTOR` | “开启订阅”按钮的 CSS 选择器 |
| `PROVIDER_ENABLE_TEXT` | “开启订阅”按钮文字，拿不到选择器时使用 |
| `SUBCONVERTER_URL` | 后台设置的默认值，可以用第三方，也可以自建 |
| `CONVERTER_INPUT` | 后台设置的默认值，`hosted-raw` 或 `provider-url` |
| `RAW_DOWNLOAD_TOKEN` | `hosted-raw` 模式下，转换器读取原始订阅的临时口令 |
| `CONFIG_TEMPLATE_URL` | 后台设置的默认分流模板地址 |
| `KEEP_BACKUPS` | 保留多少份历史配置 |

如果你不想让第三方转换器访问你的 VPS 原始配置，可以把 subconverter 也部署到同一台 VPS，然后把：

```bash
SUBCONVERTER_URL=http://127.0.0.1:25500/sub
```

## 文件位置

服务运行后会写入：

```text
data/settings.json
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

如果你的模板会输出 Surge，请在后台把对应档案的目标格式选成 `Surge`。

第三方 subconverter 无法读取原始订阅：

在后台把转换输入改为“先下载到 VPS 再转换”。如果 `.env` 里没有 `PUBLIC_BASE_URL`，服务会用当前访问域名生成临时原始订阅地址。

多档案模式下，服务会给转换器提供类似 `/raw/clash-ss.yaml` 的临时原始订阅地址。

本地还没配置自动点击：

```bash
PROVIDER_ADAPTER=manual
```

然后先人工去机场官网开启订阅，再回后台点“立即更新”。
