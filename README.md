# 🏈 Flag Football Tournament Manager

A modern web application for managing American Flag Football tournaments with live score updates and real-time schedule management.

## Features

- **Live Schedule View**: Public-facing schedule showing all games with real-time score updates
- **Admin Panel**: Secure interface for updating game scores, status, and live game information
- **Real-time Updates**: Automatic polling every 5 seconds to keep scores current
- **Team Management**: Track team statistics including wins, losses, and points
- **Modern UI**: Beautiful, responsive design with sports-themed styling
- **Game Status Tracking**: Monitor games from scheduled to in-progress to completed

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **Real-time**: Polling-based updates (easily upgradeable to WebSockets)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flag-football-tournament
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize sample data**
   ```bash
   # Start the development server first
   npm run dev
   
   # Then visit this URL to initialize sample data
   http://localhost:3000/api/init-data
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Main schedule: http://localhost:3000
   - Admin panel: http://localhost:3000/admin

## Usage

### Public Schedule View
- View all games organized by date
- See live scores and game status
- Filter games by specific dates
- Real-time updates every 5 seconds

### Admin Panel
- Select any game to update
- Modify scores, game status, quarter, and time remaining
- Update team statistics automatically
- Track wins/losses and points for/against

## Project Structure

```
├── app/
│   ├── admin/           # Admin panel page
│   ├── api/             # API routes
│   │   ├── games/       # Game management endpoints
│   │   └── init-data/   # Sample data initialization
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout with navigation
│   └── page.tsx         # Main schedule page
├── components/
│   ├── Navigation.tsx   # Top navigation bar
│   └── ScheduleView.tsx # Main schedule component
├── lib/
│   ├── database.ts      # Database operations
│   └── sampleData.ts    # Sample tournament data
├── types/
│   └── index.ts         # TypeScript type definitions
└── tournament.db        # SQLite database (created automatically)
```

## API Endpoints

- `GET /api/games` - Fetch all games
- `PUT /api/games/[id]` - Update game scores and status
- `GET /api/init-data` - Initialize sample tournament data

## Database Schema

### Teams
- id, name, color, wins, losses, pointsFor, pointsAgainst

### Games  
- id, homeTeamId, awayTeamId, homeScore, awayScore, scheduledTime, field, status, quarter, timeRemaining

### Tournaments
- id, name, startDate, endDate

## Customization

### Adding New Teams
Use the database operations in `lib/database.ts` or create an admin interface for team management.

### Modifying Game Fields
Update the database schema and corresponding TypeScript types in `types/index.ts`.

### Styling
Modify `tailwind.config.js` and `app/globals.css` to customize the appearance.

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

3. **Database considerations**
   - For production, consider using PostgreSQL or MySQL instead of SQLite
   - Implement proper database migrations
   - Add database connection pooling

## Future Enhancements

- WebSocket integration for true real-time updates
- User authentication and role-based access
- Tournament bracket generation
- Team registration system
- Statistics and analytics dashboard
- Mobile app integration
- Push notifications for score updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
