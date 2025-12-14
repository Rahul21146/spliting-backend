# Deploy Checklist — spliting-backend

This file explains the minimum environment variables and steps to deploy `spliting-backend` to Render while using a managed MySQL database (Railway).

IMPORTANT: Never commit production secrets to the repository. Rotate credentials if they are ever exposed.

1) Preferred: use a single public DB URL

   - In Railway, open your MySQL service and copy the PUBLIC connection string. It looks like:
     mysql://<user>:<password>@containers-xxxx.railway.app:<port>/railway

   - In Render → Your Service → Environment, add ONE of these (preferred):
     - Key: MYSQL_URL
       Value: mysql://<user>:<password>@containers-xxxx.railway.app:<port>/railway
     OR
     - Key: MYSQL_PUBLIC_URL
       Value: (same)

   Our backend `config/database.js` will prefer a full connection URL when present.

2) Alternative: set separate DB_* vars

   If you prefer separate variables, set these (using the PUBLIC host values from Railway):

   - DB_HOST = containers-xxxx.railway.app
   - DB_PORT = <port>
   - DB_USER = <user>
   - DB_PASS (or DB_PASSWORD) = <password>
   - DB_NAME = railway

   The `config/database.js` file also accepts alternative names such as `DB_USER`/`DB_USERNAME`, `DB_PASS`/`DB_PASSWORD`, and `MYSQLHOST`.

3) CORS / Frontend origin

   - Set `FRONTEND_URL` in Render to your frontend origin (provided by you):
     FRONTEND_URL=https://spliting-backend-q4f7.vercel.app/

   The backend reads `FRONTEND_URL` and uses it as the allowed CORS origin in `index.js`.

4) NODE_ENV and migrations

   - Ensure `NODE_ENV=production` on Render so the server does not attempt `sequelize.sync({ alter: true })` on each deploy.
   - If you need schema changes, use a migration tool (recommended) rather than relying on `sync({ alter: true })` in production.

5) Redeploy and verify

   - After saving env vars, trigger a manual deploy in Render.
   - Check logs. Expected DB success message:
     - "Connection to the database has been established successfully."
     - "🚀 Server running on port ..."

6) Security & housekeeping

   - If any `.env` with secrets was ever pushed to a remote repo, rotate the DB password immediately and remove the secret from git history.
   - Keep `.env` in `.gitignore` (already present).

7) Pushing code to GitHub

   - If you want me to push to GitHub, provide the remote URLs (frontend and/or backend). I will add the remotes and push to `main`.

8) Quick local test commands

   - Run locally (example):

     ```powershell
     cd .\spliting-backend
     copy .env.example .env   # then update the values locally (do not commit)
     npm install
     npm run dev              # or node index.js
     ```

9) Need help?

   - Paste Render logs here after redeploy and I’ll confirm success or debug further.

---
Generated automatically by the assistant to help deploy and verify your Render + Railway setup.
