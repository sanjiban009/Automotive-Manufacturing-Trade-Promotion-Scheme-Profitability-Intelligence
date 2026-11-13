# GitHub Pages — Publishing This Offline BI Portfolio

## Upload

1. In GitHub, create a **public** repository; a useful name is `automotive-trade-roi-dashboard`.
2. Click **Add file → Upload files** and upload the **contents** of this project folder. `index.html` must be at the repository root (not inside an extra nested directory). To preserve folder structure, GitHub Desktop or `git` is simpler:

```bash
git init
git add .
git commit -m "Launch automotive trade promotion BI portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/automotive-trade-roi-dashboard.git
git push -u origin main
```

3. Open the repository → **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)` and **Save**.
5. Your URL will usually be `https://YOUR_USERNAME.github.io/automotive-trade-roi-dashboard/`, once Pages publishes the branch. This is a URL pattern, **not a claim of live deployment**.

## Live quality checks

- Open the website in a private browser window.
- Confirm the eight KPI cards and three main overview visuals render.
- Switch from `FY2025–26` (1,728 records) to `FY2026–27` (1,008 records, YTD).
- Use Region / Product / Scheme slicers and confirm values change.
- Open all sidebar pages, including Region heatmap and ROI Scenario Lab.
- Test **Export CSV**: downloaded file should include only selected FY rows.
- Verify `data/dataset.js` loads and chart labels are readable at desktop width.
- Add the live link and GitHub repository link to the LinkedIn post and LinkedIn project description before sharing.

## Notes

No deployment workflow, npm install or web-service backend is necessary. The app also works by opening the root `index.html` offline, because dataset data are loaded as a regular local script rather than via a `fetch()` of a `file://` CSV. If browsing through a GitHub Pages base path, keep all relative `assets/` and `data/` paths unchanged.
