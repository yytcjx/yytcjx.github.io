<pre align="center">  
一个革新性的静态博客模板！🚀 基于 Astro 5.0+ & Tailwind CSS 开发  
<br>✨ 支持在线发布文章 · 可视化配置管理 · 无需本地开发环境  
</pre>  


<div align="center">  
<img alt="Ryuchan Logo" src="https://picbed.xiaozhangya.xin/blog/logo.png" width="280px">  
</div>  


[![license](https://badgen.net/github/license/kobaridev/RyuChan)](https://github.com/kobaridev/RyuChan/blob/main/LICENSE)&nbsp;&nbsp;&nbsp;[![release](https://badgen.net/github/release/kobaridev/RyuChan)](https://github.com/kobaridev/RyuChan/releases)  

[**🖥️ Ryuchan Demo**](https://demo.131714.xyz)  

## 📷 预览  

![preview](https://picbed.xiaozhangya.xin/blog/ryuchan_preview.png)  

## ✨ 核心亮点  

### 🚀 革命性的在线管理体验  

- ✅ **📝 在线发布文章** - 浏览器中直接编写、预览、发布文章，支持Markdown编辑、图片上传、实时预览  
- ✅ **⚙️ 可视化配置管理** - Web界面管理网站配置，无需编辑YAML文件，支持实时预览和一键保存  
- ✅ **🔐 GitHub集成** - 基于GitHub App的安全认证，所有变更直接提交到仓库，保持版本控制


![preview](https://picbed.xiaozhangya.xin/blog/ryuchan_online_demo1.png)
![preview](https://picbed.xiaozhangya.xin/blog/ryuchan_online_demo2.png)

### 🎨 优雅的设计与功能  

- ✅ **白天** / **黑夜** 模式可用  
- ✅ 极速的访问速度与优秀的 SEO  
- ✅ 视图过渡动画（使用 ClientRouter）  
- ✅ 支持文章全文搜索（Pagefind）  
- ✅ 移动端优先的响应式设计（优化卡片布局、网格导航）  
- ✅ 高度可配置的 Banner（支持随机图、打字机效果、高度自定义）  
- ✅ 使用 [Tailwind CSS](https://tailwindcss.com/) 与 [daisyUI](https://daisyui.com/) 构建自适应页面  
- ✅ RSS 订阅支持  
- ✅ 追番管理（集成 TMDB API，支持动漫追踪和评分）  
- ✅ 网站导航（分类资源导航，支持搜索和筛选）  
- ✅ 静态页面（About、Friends、Projects 页面）  
- ✅ 文章增强功能（阅读统计、赞赏、分享）  

---

## 📝 在线发布文章  

RyuChan 提供了强大的在线文章发布功能，让你无需本地开发环境即可直接在浏览器中编写、预览和发布文章。  

### 🚀 核心功能  

- **📝 富文本编辑器**: 支持Markdown语法，提供快捷键操作（Ctrl+B加粗、Ctrl+I斜体、Ctrl+K链接）  
- **🖼️ 图片管理**: 支持本地上传和URL链接，拖拽操作，自动生成Markdown引用  
- **🎨 封面设置**: 拖拽或上传图片作为文章封面  
- **👀 实时预览**: 边写边预览，所见即所得的渲染效果  
- **📊 元信息管理**: 标签、分类、发布时间、草稿状态等  
- **📥 Markdown导入**: 支持导入本地.md文件继续编辑  

### 🔐 认证与安全  

使用 GitHub App 私钥（`.pem` 文件）进行身份验证，确保只有授权用户可以发布内容。  

> [!IMPORTANT]
>
> `/write` 和 `/config` 页面里导入的 `*.pem`，是 **GitHub App 的私钥**，不是 GitHub Pages 的部署密钥，也不是 SSH deploy key。
> GitHub Pages 只负责部署静态站点，不会自动帮你生成这个 `.pem` 文件。  

### 📱 使用流程  

1. **访问写作页面**: 浏览器打开 `/write`  
2. **导入私钥**: 点击"导入密钥"按钮，选择GitHub App的.pem私钥文件  
3. **编写文章**:   
   - 输入标题和内容  
   - 设置封面图片  
   - 添加标签和分类  
   - 使用快捷键提升编辑效率  
4. **预览确认**: 点击"预览"查看最终效果  
5. **发布文章**: 点击"发布"按钮，文章将自动提交到GitHub仓库  

### ✏️ 编辑模式  

通过 `/write?slug=文章slug` 可以编辑已发布的文章，编辑模式下提供：  

- 更新按钮替代发布按钮  
- 删除文章功能  
- 取消编辑选项  

### 🔑 如何获取导入的 `.pem` 私钥  

如果你要使用 `/write` 或 `/config` 的在线写作 / 在线配置功能，需要自己创建一个 **GitHub App**，然后下载它的私钥。流程如下：

1. 打开 GitHub：
   `Settings` -> `Developer settings` -> `GitHub Apps` -> `New GitHub App`
2. 创建一个新的 GitHub App，建议最少配置为：
   - `GitHub App name`：自定义，例如 `ryuchan-writer`
   - `Homepage URL`：你的博客地址，或者仓库地址
   - `Webhook`：如果你没有后端服务，可以先关闭
   - `Repository permissions`：
     - `Contents`: `Read and write`
     - `Metadata`: `Read-only`
3. `Where can this GitHub App be installed?`
   - 建议选择 `Only on this account`
4. 创建完成后，进入这个 App 的 `General` 页面：
   - 记下 `App ID`
   - 在 `Private keys` 区域点击 `Generate a private key`
5. GitHub 会自动下载一个 `.pem` 文件：
   - 这个文件就是 `/write` 页面里需要导入的密钥
   - GitHub 不会再次完整展示这个私钥，请妥善保存
6. 点击 `Install App`，把这个 GitHub App 安装到你的博客仓库上：
   - 建议只授权当前博客仓库
7. 打开博客的 `/write` 或 `/config` 页面，点击“导入密钥”，选择刚下载的 `.pem` 文件即可

### 🧭 如果你现在用的是 `用户名.github.io`

如果你的仓库就是这种形式：

- 仓库名：`yytcjx.github.io`
- 访问地址：`https://yytcjx.github.io`
- 部署方式：`.github/workflows/deploy.yml` + GitHub Pages

那么你可以直接按下面这组值理解配置：

```yaml
github:
  owner: yytcjx
  repo: yytcjx.github.io
  branch: main
  appId: "你的 GitHub App ID"
  encryptKey: "你自定义的一段字符串"
```

对应关系是：

- `owner`：你的 GitHub 用户名
- `repo`：你的 Pages 仓库名，通常就是 `用户名.github.io`
- `branch`：你的发布源码分支，通常是 `main`
- `appId`：你创建的 GitHub App 的 `App ID`
- `.pem`：GitHub App 的私钥，保存在你本地，进入 `/write` 时手动导入

> [!NOTE]
>
> `https://用户名.github.io` 这个域名本身不会提供任何密钥。
> 它只是 GitHub Pages 的默认访问域名。  

### 📄 GitHub Pages 部署时要注意什么  

如果你当前是通过 **GitHub Pages + GitHub Actions** 部署，这里有一个关键点：

- GitHub Pages 部署 **不提供** `.pem`
- `.pem` 是你在 **GitHub App 设置页** 里自己生成并下载的
- 这个 `.pem` **不要提交到仓库**
- 一般只需要在你自己的浏览器本地导入使用

当前仓库的在线写作认证逻辑是：

1. 使用导入的 `.pem`
2. 配合 `App ID`
3. 在浏览器里签发 GitHub App JWT
4. 再向 GitHub 换取 installation token
5. 用 installation token 直接提交文章和配置改动

也就是说，**GitHub Pages 负责“展示站点”，GitHub App 负责“在线写回仓库”**。这两件事是分开的。

### ⚙️ GitHub Pages 部署时如何配置 `App ID`  

这个项目在前端会读取以下 GitHub 配置：

- `owner`
- `repo`
- `branch`
- `appId`

最简单的方式，是直接在 `ryuchan.config.yaml` 里填上你的 `appId`：

```yaml
github:
  owner: your-github-name
  repo: your-repo-name
  branch: main
  appId: "123456"
  encryptKey: "change-this-key"
```

说明：

- `appId` 是 GitHub App 的 `App ID`，不是私钥
- `encryptKey` 只是前端缓存 `.pem` 时使用的加密字符串，不是 GitHub 提供的密钥
- 真正敏感的是 `.pem` 文件本身，不要上传到仓库

如果你不想把 `appId` 写进仓库，也可以在 GitHub Actions 构建时注入环境变量，例如：

```yaml
env:
  PUBLIC_GITHUB_OWNER: ${{ vars.PUBLIC_GITHUB_OWNER }}
  PUBLIC_GITHUB_REPO: ${{ vars.PUBLIC_GITHUB_REPO }}
  PUBLIC_GITHUB_BRANCH: ${{ vars.PUBLIC_GITHUB_BRANCH }}
  PUBLIC_GITHUB_APP_ID: ${{ vars.PUBLIC_GITHUB_APP_ID }}
  PUBLIC_GITHUB_ENCRYPT_KEY: ${{ vars.PUBLIC_GITHUB_ENCRYPT_KEY }}
```

然后在 GitHub 仓库里配置这些 `Actions Variables`。

### 🛠️ 你现在这份 `deploy.yml` 应该如何配

如果你用的是当前仓库里的 `.github/workflows/deploy.yml`，建议把这些值配置到：

`GitHub Repository` -> `Settings` -> `Secrets and variables` -> `Actions` -> `Variables`

需要创建的变量如下：

- `PUBLIC_GITHUB_OWNER`
- `PUBLIC_GITHUB_REPO`
- `PUBLIC_GITHUB_BRANCH`
- `PUBLIC_GITHUB_APP_ID`
- `PUBLIC_GITHUB_ENCRYPT_KEY`

如果你的仓库就是 `yytcjx.github.io`，可以直接参考下面这个例子：

- `PUBLIC_GITHUB_OWNER = yytcjx`
- `PUBLIC_GITHUB_REPO = yytcjx.github.io`
- `PUBLIC_GITHUB_BRANCH = main`
- `PUBLIC_GITHUB_APP_ID = 你的 GitHub App ID`
- `PUBLIC_GITHUB_ENCRYPT_KEY = 任意一段你自己定义的字符串`

当前仓库的 `deploy.yml` 已经支持在构建阶段读取这些变量，因此你不需要把它们硬编码到工作流里。

### 🚨 如果你看到 `actions/jekyll-build-pages@v1` 报错

如果 Actions 日志里出现类似下面的信息：

```txt
Run actions/jekyll-build-pages@v1
Invalid YAML front matter in /src/components/...astro
```

这通常说明：

- GitHub Pages 还在使用 **默认 Jekyll 构建模式**
- 它正在尝试直接构建你的源码仓库
- 它没有使用 `.github/workflows/deploy.yml` 产出的 `dist/` 静态站点

而 Astro 项目源码里包含很多 `.astro`、`.tsx`、`.mdx` 文件，Jekyll 会误判这些文件，从而出现 `Invalid YAML front matter` 或 `YAML Exception`。

#### 正确修复方式

去你的仓库页面操作：

`Settings` -> `Pages` -> `Build and deployment`

把这里的 `Source` 改成：

`GitHub Actions`

不要继续使用：

- `Deploy from a branch`

因为 `Deploy from a branch` 会触发 GitHub Pages 的默认 Jekyll 构建，它适合纯静态 HTML 仓库，不适合这个 Astro 源码仓库。

#### 你当前这个项目的正确部署链路

应该是：

1. 你 push 到 `main`
2. `.github/workflows/deploy.yml` 运行
3. Astro 构建生成 `dist/`
4. `actions/upload-pages-artifact` 上传构建产物
5. `actions/deploy-pages` 发布到 GitHub Pages

也就是说，GitHub Pages 应该接收的是 **构建后的 `dist`**，不是你的仓库源码。

#### 一句话判断是否配置对了

- 如果日志里看到 `actions/jekyll-build-pages@v1`
  - 说明你还在走错误的 Jekyll 模式
- 如果日志里看到 `.github/workflows/deploy.yml` 里的 `Build Astro site` 和 `Deploy to GitHub Pages`
  - 说明你已经切到正确的 GitHub Actions 模式

### 📋 GitHub App 创建时，字段怎么填更稳妥

注册 GitHub App 时，如果你只是为了这个博客的在线写作功能，建议这样填写：

- `GitHub App name`
  - 自定义，例如 `yytcjx-blog-writer`
- `Homepage URL`
  - 填你的博客地址，例如 `https://yytcjx.github.io`
- `Callback URL`
  - 这个项目当前不是走 OAuth 用户登录流程，可以先留空
- `Setup URL`
  - 可留空
- `Webhook`
  - 如果你没有额外后端服务，可以先取消勾选 `Active`
- `Permissions`
  - `Contents: Read and write`
  - `Metadata: Read-only`
- `Where can this GitHub App be installed?`
  - 个人博客场景建议选 `Only on this account`

创建后，GitHub Docs 可参考：

- 注册 GitHub App：https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app
- 管理 GitHub App 私钥：https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps
- 安装自己的 GitHub App：https://docs.github.com/apps/installing-github-apps
- GitHub Pages 自定义工作流：https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

### 🔒 `.pem` 应该放哪里，不应该放哪里

建议：

- 保存在你自己的电脑上
- 放到密码管理器或安全的私有存储里
- 需要写作时，在浏览器里手动导入

不要这样做：

- 不要提交到 Git 仓库
- 不要放到 `public/`
- 不要写进 `README.md`
- 不要直接塞进 GitHub Pages 构建产物
- 不要误当成 SSH deploy key 使用

因为这个 `.pem` 一旦泄露，别人就可能以这个 GitHub App 的身份向你的仓库写入内容。  

> [!TIP]
>
> 如果你的 `main` 分支开启了 branch protection 或 ruleset，请把这个 GitHub App 加到允许推送 / bypass 的列表里，否则在线发布文章时可能会提交失败。  

---

## ⚙️ 在线配置网站  

RyuChan 提供了革命性的可视化配置编辑器，让你通过Web界面轻松管理网站的所有设置，无需手动编辑YAML文件。  

### 🎯 核心功能  

- **🎨 可视化界面**: 直观的表单控件替代复杂的YAML语法 [4-cite-0](#4-cite-0)   
- **📸 图片上传**: 直接上传网站图标、头像等图片资源 [4-cite-1](#4-cite-1)   
- **🔗 社交链接管理**: 可视化添加、删除、排序社交媒体链接 [4-cite-2](#4-cite-2)   
- **⚡ 实时预览**: 配置更改即时生效，支持可视化/代码模式切换 [4-cite-3](#4-cite-3)   
- **🔒 安全保存**: 基于GitHub API的安全认证，配置变更直接提交到仓库 [4-cite-4](#4-cite-4)   

### 📋 支持的配置项  

- **网站基本信息**: 标题、描述、图标、头像等  
- **主题设置**: 浅色/深色主题、代码高亮样式  
- **Banner配置**: 随机图API、高度设置、打字机效果  
- **功能集成**: TMDB追番、Bilibili追番、评论系统、统计工具  
- **菜单导航**: 动态添加、删除、排序菜单项  
- **社交媒体**: 侧边栏和页脚社交链接管理  

### 🚀 快速开始  

1. **访问配置页面**: 浏览器打开 `/config` [4-cite-5](#4-cite-5)   
2. **身份验证**: 导入GitHub App的.pem私钥文件  
3. **可视化编辑**:   
   - 在表单中修改各项设置  
   - 上传图片资源  
   - 配置功能集成  
4. **实时预览**: 切换预览模式查看效果  
5. **一键保存**: 点击保存按钮，配置自动提交到GitHub  

### 💡 特色优势  

- **零学习成本**: 无需学习YAML语法，通过直观的界面完成所有配置  
- **即时反馈**: 配置更改可以立即预览效果  
- **版本控制**: 所有配置变更都有Git版本记录  
- **安全可靠**: 基于GitHub App的安全认证机制  

---

## ✒️ 文章信息  

|    名称     |   含义   | 是否必要 |
| :---------: | :------: | :------: |
|    title    | 文章标题 |    是    |
| description | 文章简介 |    是    |
|   pubDate   | 文章日期 |    是    |
|    image    | 文章封面 |    否    |
| categories  | 文章分类 |    否    |
|    tags     | 文章标签 |    否    |
|    badge    | 文章徽标 |    否    |
|    draft    | 草稿状态 |    否    |

> [!TIP]  
>
> - 你可以通过把 `badge` 属性设置为 `Pin` 来置顶你的文章  
> - 设置 `draft: true` 可将文章标记为草稿，草稿文章不会在列表显示  

## ⬇️ 使用方法  

1. 安装 pnpm 包管理器（如果你没有安装过的话）  

```sh  
npm i -g pnpm
```

1. 克隆项目

```
git clone https://github.com/kobaridev/RyuChan.git Ryuchan
```

1. 进入项目文件夹

```
cd Ryuchan
```

1. 安装依赖

```
pnpm i
```

1. 调试、运行项目

**首次运行或更新内容后**，请先执行 `search:index` 来生成搜索索引：

```
# 生成搜索索引以供开发时使用  [2](#header-2)
pnpm run search:index  
  
pnpm run dev
```

## 🔧 配置

Ryuchan 使用 `ryuchan.config.yaml` 作为配置文件，你可以通过在线配置编辑器或直接编辑此文件来管理网站设置。

### GitHub 配置（在线写作 / 在线配置必需）

```yaml
github:
  owner: your-github-name
  repo: your-repo-name
  branch: main
  appId: "123456"
  encryptKey: "change-this-key"
```

- `owner`：仓库所有者
- `repo`：仓库名
- `branch`：在线写作要提交到的分支，通常是 `main`
- `appId`：GitHub App 的 `App ID`
- `encryptKey`：浏览器缓存 `.pem` 时使用的加密字符串

> [!NOTE]
>
> `appId` 可以写在 `ryuchan.config.yaml`，也可以通过 `PUBLIC_GITHUB_APP_ID` 环境变量注入。
> 但 `.pem` 私钥本身不要写进环境变量、不要提交到仓库、不要放进 GitHub Pages。  

### 网站基本信息 (site)

```
site:  
  tab: Ryuchan # 浏览器标签栏上显示的文本  
  title: Ryuchan # 网站的主标题  
  description: A clean, elegant, and fast static blog template! # 网站描述，用于SEO  
  language: zh # 网站的语言代码，如"en"表示英文，"zh"表示中文  
  favicon: /favicon.ico # 网站图标路径
```

### 主题设置 (theme)

```
theme:  
  light: winter # 浅色模式的主题，基于daisyUI的主题  
  dark: dracula # 深色模式的主题，基于daisyUI的主题  
  code: github-dark # 代码块的主题样式
```

- 主题基于 [daisyUI](https://daisyui.com/docs/themes/) 提供的主题选项
- 代码块主题使用 [Shiki](https://shiki.style/themes) 提供的样式

### TMDB 配置 (追番功能)

```
tmdb:  
  apiKey: "your-tmdb-api-key" # TMDB API Key (v3 auth)  
  listId: "your-list-id" # TMDB List ID
```

### Bilibili 配置 (追番功能)

```
bilibili:  
  uid: "your-bilibili-uid" # Bilibili 用户 ID
```

### 菜单配置 (menu)

```
menu:  
  - id: home # 菜单项唯一标识符  
    text: 首页 # 菜单显示的文本  
    href: / # 链接地址  
    svg: "material-symbols:home-outline-rounded" # 图标  
    target: _self # 链接打开方式  
  - id: write  
    text: 写作  
    href: /write  
    svg: "material-symbols:edit-outline"  
    target: _self  
  - id: config  
    text: 配置  
    href: /config  
    svg: "material-symbols:settings-outline"  
    target: _self
```

## 📄 其他页面功能

### 追番页面

- 集成 TMDB API 获取动漫元数据
- 支持 Bilibili 追番列表同步
- 实时搜索和筛选功能
- 按类型、评分排序

### 导航页面

- 分类资源导航
- 支持搜索和分类筛选
- 响应式卡片布局

### 静态页面

- **About 页面**: 个人简介、技术栈展示
- **Friends 页面**: 友链展示和站点展示
- **Projects 页面**: 个人项目展示

## 🙏 致谢

本项目基于以下优秀的博客模板开发：

- **Frosti**: 项目的核心基础，由 [EveSunMaple](https://github.com/EveSunMaple/Frosti) 开发
- **Yukina**: 部分设计巧思参考自 [WhitePaper233](https://github.com/WhitePaper233/yukina) 开发的模板
- **Mizuki**: 部分功能实现借鉴了 [matsuzaka-yuki](https://github.com/matsuzaka-yuki/Mizuki) 开发的模板
- **2025-blog-public**: 在线编辑文章，配置站点等功能借鉴了 [yysuni](https://github.com/YYsuni/2025-blog-public) 开发的项目

感谢所有开源社区的贡献者们！

## 📝 许可证

本项目采用 [MIT 许可证](https://app.devin.ai/search/LICENSE)。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

------
