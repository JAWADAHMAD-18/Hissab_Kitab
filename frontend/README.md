This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## PWA

Hisab Kitab is an installable Progressive Web App. The service worker (`public/sw.js`) is plain JavaScript with no build step or third-party libraries.

### How to test

The service worker is only registered in **production**. To test locally:

```bash
npm run build && npm run start
```

Then open DevTools → **Application → Service Workers** and **Application → Manifest** to inspect registration and installability. Use **Application → Cache Storage** to verify only `/offline` and icons are cached — never API responses or authenticated HTML.

### How to bump `CACHE_VERSION`

Open `public/sw.js` and increment the constant at the top:

```js
const CACHE_VERSION = "hk-v2"; // was "hk-v1"
```

On the user's next page load the browser will fetch the new `sw.js` (it is served with `no-cache`), install the new worker, and the `activate` handler will delete all caches whose name does not match the new version.

### No-private-data-caching rule

The service worker **never** caches:

- `/api/*` routes (financial data lives here)
- Navigation HTML (authenticated pages, RSC payloads)
- Anything with an `RSC`, `Next-Router-State-Tree`, or `_rsc` header/param

Only `/offline` (a generic static page) and icon/static assets are cached. Logout calls `clearAllCaches()` to wipe Cache Storage so nothing from one account can be read by the next person on a shared device.
