# Authority Admin Login (React + Vite)

Minimal React scaffold containing an admin-style login page.

Getting started (Windows PowerShell):

```powershell
cd "c:\Users\VINAY\OneDrive\Pictures\Saved Pictures\Desktop\authority"
npm install
npm run dev
```

Open the dev server URL printed by Vite (usually `http://localhost:5173`).

What’s included:
- `src/components/Login.jsx` — login form component
- `src/styles.css` — basic styling
- `index.html`, `src/main.jsx`, `src/App.jsx`
Next steps you might want:
- Wire the form to a real auth API
- Add form validation and error handling
- Make styling pixel-perfect to your reference site

This project has been simplified to contain only the single login page that matches your provided screenshot. No routing or dashboard pages are included.

Dashboard access
- The dashboard is only provided after a successful login. Direct visits to `/dashboard.html` will redirect to the login page if you are not signed in.

Quick test (dev server):
```powershell
cmd /c "npm run dev"
# then open http://localhost:5173 and sign in using demo credentials to reach the dashboard
```

Login behavior
- The app accepts any email/username and password — signing in will always succeed and store a small `mockAuth` entry in `localStorage` to persist the demo session. The dashboard is only accessible after signing in; direct visits to `/dashboard.html` will redirect to `/` if not signed in.

To test locally without a backend:

```powershell
# start dev server
npm run dev
# open http://localhost:5173 and submit any email/password — you'll be redirected to /admin
```

Routes added
- `/` — Home page with a "Sign In" button
- `/login` — Login page
- `/dashboard` — Dashboard shown after successful sign-in

Note: in dev the app accepts any email/password and redirects to `/dashboard` for convenience.
