# F1 Bolão

A Formula 1 betting app with database integration and automatic race results fetching.

## Features

- User registration and authentication
- Place bets on F1 races
- Automatic fetching of race results from Ergast API
- Leaderboard and points system

## Setup

1. Install dependencies: `npm install`
2. Set up MongoDB and update `.env.local` with your `MONGODB_URI`
3. Update `NEXTAUTH_SECRET` in `.env.local` with a random string
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

- `GET /api/races` - Fetch current season races
- `GET /api/results/[round]` - Fetch results for a specific race round
- `POST /api/bets` - Place a bet (requires authentication)
- `GET /api/bets` - Get user's bets (requires authentication)
- `POST /api/register` - Register a new user
- `/api/auth/[...nextauth]` - NextAuth authentication

## Technologies

- Next.js 14
- MongoDB with Mongoose
- NextAuth.js for authentication
- Tailwind CSS for styling
- Ergast F1 API for race data