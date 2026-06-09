# Mariokart Tournament Full-Stack Upgrade

## What changed
- Node.js + Express backend
- MongoDB persistence
- Signup / login with JWT
- Hardcoded admin login
- CRUD for tournament registrations
- Admin panel for users and registrations
- MongoDB-backed players and leaderboard endpoints

## Run it
1. Install MongoDB and open MongoDB Compass.
2. Create a database named `mariokart_tournament_db`.
3. Copy `.env.example` to `.env` and set the values if needed.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the server:
   ```bash
   npm start
   ```
6. Open:
   - `http://localhost:3000/login.html`
   - `http://localhost:3000/admin.html`

## Hardcoded admin credentials
- Username: `admin`
- Password: `Admin@123`

## Collections
- `users`
- `registrations`
- `players`
- `leaderboardentries`
