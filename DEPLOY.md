# 部署到 Vercel（24 小时在线）

按下面步骤做完后，会得到一个可随时访问的网址（手机、电脑都能用）。

---

## 第一步：把代码推到 GitHub

在项目根目录执行（已初始化过 Git 可跳过 1）：

```bash
# 1. 初始化 Git（若还没有）
git init

# 2. 添加所有文件（.env.local 已被 .gitignore 忽略，不会上传）
git add .
git commit -m "准备部署"

# 3. 在 GitHub 网页新建一个仓库（不要勾选 README），然后执行（把 YOUR_USERNAME/YOUR_REPO 换成你的仓库地址）：
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## 第二步：在 Vercel 部署

1. 打开 **https://vercel.com**，用 GitHub 账号登录。
2. 点击 **Add New… → Project**，选择你刚推送的 **school-advisor** 仓库，点 **Import**。
3. **Environment Variables（环境变量）** 里添加（和本地 `.env.local` 一致）：
   - `SUPABASE_URL` = `https://lnxqekiwmdsanvjkmzno.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = 你的 service_role 密钥（从 Supabase 后台复制）
4. 点击 **Deploy**，等一两分钟。

---

## 第三步：访问线上地址

- 部署成功后，Vercel 会给你一个地址，例如：**https://school-advisor-xxx.vercel.app**
- 用手机或电脑浏览器打开这个地址，即可 24 小时使用学校匹配结果页。

---

## 注意

- **不要**把 `.env.local` 或密钥提交到 GitHub；已在 `.gitignore` 里忽略。
- 若以后改了环境变量，在 Vercel 项目 **Settings → Environment Variables** 里改，然后 **Redeploy** 一次。
