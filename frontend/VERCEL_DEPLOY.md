Frontend Vercel deployment guide

1) Connect the repository to Vercel
   - In Vercel dashboard, choose "Import Project" and select this repository (branch `feature/redux-protected` or whichever branch you want to deploy).

2) Build settings (Vercel will usually detect Create React App):
   - Framework Preset: Create React App
   - Build Command: npm run build
   - Output Directory: build

3) Environment variables (set these in the Vercel project settings):
   - REACT_APP_API_BASE_URL = https://your-api.example.com/api  (include the /api suffix)

4) SPA routing:
   - `vercel.json` is included to ensure single-page app fallback to `index.html`.

5) Deploy
   - Trigger a deploy from Vercel dashboard or push to the connected branch. After the build completes, Vercel will provide a URL like `https://your-project.vercel.app`.

6) Verify
   - Open the Vercel URL and test login using the API backend you configured. Use browser DevTools network tab to confirm requests go to the `REACT_APP_API_BASE_URL`.

Notes & troubleshooting
- If your API is hosted elsewhere and requires CORS, ensure the API allows requests from the Vercel domain.
- If the API is on the same repository under a `backend/` folder, you must deploy it separately or use a separate Vercel project for the API.
- For local testing, create a `.env.local` with:
    REACT_APP_API_BASE_URL=http://localhost:5002/api

