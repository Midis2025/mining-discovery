# Local Testing Guide for Mining Discovery

## The Problem

Your site uses Vercel's rewrite rules to create clean URLs:
- `/magazine` → serves `/magzin.html`
- `/page/ceo-profiles` → serves `/page/ceo-profiles.html`
- `/page/gold-news` → serves `/page/gold-news.html`

**These rewrites only work on Vercel, NOT on local dev servers like Live Server.**

---

## Solution 1: Direct File Access (Quick & Easy)

Use the actual `.html` file paths during local development:

### Root Files:
```
✅ http://127.0.0.1:5500/index.html
✅ http://127.0.0.1:5500/magzin.html
✅ http://127.0.0.1:5500/service.html
✅ http://127.0.0.1:5500/newss.html
```

### Page Folder Files:
```
✅ http://127.0.0.1:5500/page/ceo-profiles.html
✅ http://127.0.0.1:5500/page/about-us.html
✅ http://127.0.0.1:5500/page/contact-us.html
✅ http://127.0.0.1:5500/page/gold-news.html
✅ http://127.0.0.1:5500/page/latest-news.html
✅ http://127.0.0.1:5500/page/evening-chatter.html
```

### Article Pages:
```
✅ http://127.0.0.1:5500/page/article/index.html?id=YOUR_ARTICLE_ID
```

---

## Solution 2: Vercel CLI (Production-Like Testing)

Install and use Vercel CLI to test with actual rewrites:

### Installation:
```bash
npm install -g vercel
```

### Usage:
```bash
cd /Users/purujitvij/Documents/BrewingCode/vanilla-js/mining-discovery
vercel dev
```

This starts a local server on `http://localhost:3000` with **full Vercel rewrite support**.

### Test URLs (with Vercel CLI):
```
✅ http://localhost:3000/magazine
✅ http://localhost:3000/page/ceo-profiles
✅ http://localhost:3000/page/gold-news
✅ http://localhost:3000/page/about-us
```

---

## Solution 3: Production URLs (On Vercel)

After deployment, all these URLs work perfectly:

```
✅ https://yourdomain.com/magazine
✅ https://yourdomain.com/page/ceo-profiles
✅ https://yourdomain.com/page/gold-news
✅ https://yourdomain.com/page/latest-news
✅ https://yourdomain.com/page/article/some-article-id
```

---

## URL Mapping Reference

| Clean URL                     | Actual File Path                    |
|-------------------------------|-------------------------------------|
| `/`                           | `/index.html`                       |
| `/magazine`                   | `/magzin.html`                      |
| `/page/ceo-profiles`          | `/page/ceo-profiles.html`           |
| `/page/about-us`              | `/page/about-us.html`               |
| `/page/contact-us`            | `/page/contact-us.html`             |
| `/page/gold-news`             | `/page/gold-news.html`              |
| `/page/latest-news`           | `/page/latest-news.html`            |
| `/page/evening-chatter`       | `/page/evening-chatter.html`        |
| `/page/article/article-slug`  | `/page/article/index.html`          |

---

## Redirects (Work on Vercel Only)

Old URLs automatically redirect to new ones:
- `/ceo.html` → `/page/ceo-profiles`
- `/newss.html` → `/page/latest-news`
- `/about.html` → `/page/about-us`

---

## Recommendation

**For Development:** Use direct file paths (Solution 1)
**For Testing:** Use Vercel CLI (Solution 2)
**For Production:** Deploy to Vercel (Solution 3)

---

## Quick Command Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Start Vercel dev server
vercel dev

# Deploy to Vercel
vercel --prod
```

---

## Common Errors

### Error: "Cannot GET /magazine"
**Cause:** Live Server doesn't understand rewrites
**Fix:** Use `http://127.0.0.1:5500/magzin.html` instead

### Error: "Cannot GET /page/ceo-profiles"
**Cause:** Live Server doesn't understand rewrites
**Fix:** Use `http://127.0.0.1:5500/page/ceo-profiles.html` instead

### Error: Assets not loading in page folder
**Cause:** Incorrect relative paths
**Fix:** Already fixed! All paths use `../` correctly

---

## File Structure

```
/
├── index.html
├── magzin.html
├── service.html
├── newss.html
├── page/
│   ├── about-us.html
│   ├── ceo-profiles.html
│   ├── contact-us.html
│   ├── gold-news.html
│   ├── latest-news.html
│   ├── evening-chatter.html
│   ├── article/
│   │   └── index.html
│   └── ... (24 more pages)
├── js/
├── image/
└── vercel.json
```

---

**Last Updated:** October 22, 2024
