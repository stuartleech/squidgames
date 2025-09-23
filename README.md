# Squid Games 2025 - Flag Football Tournament Manager

A professional Next.js application for managing the Margate Krakens Flag Football Tournament with live score updates and real-time timer system.

## 🏈 Features

- **Live Tournament Schedule**: Real-time display of all games with team logos
- **Admin Panel**: Complete score management and game control
- **Real-Time Timer**: 15-minute countdown timers for each half with start/stop controls
- **Live Updates**: Public view updates every 500ms during active games
- **Team Management**: Full team roster with statistics
- **Mobile Responsive**: Optimized for all device sizes

## 🚀 Quick Start

1. **Install Dependencies**:
```bash
npm install
```

2. **Initialize Database**:
```bash
curl http://localhost:3000/api/init-data
curl http://localhost:3000/api/init-timers
```

3. **Start Development Server**:
```bash
npm run dev
```

4. **Access the Application**:
   - **Public View**: [http://localhost:3000](http://localhost:3000)
   - **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)

## 🎯 Tournament Details

- **Tournament**: Squid Games 2025
- **Date**: Saturday, October 11th, 2025
- **Host**: Margate Krakens
- **Teams**: 
  - Margate Krakens
  - Kent Exiles A
  - Kent Exiles B
  - Solent Red Storm
- **Format**: Single pitch, 6 games, 15-minute halves

## ⚡ Timer System

The app features a professional timer system:
- **Server-Side Timers**: Run independently on the server
- **Real-Time Updates**: Frontend polls every 500ms during active games
- **Visual Feedback**: 
  - 🟢 Green + Pulsing = Timer Running
  - 🔴 Red = Timer Stopped/Finished
- **Auto-Stop**: Timers automatically stop at 0:00

## 🎨 Branding

- **Colors**: Margate Krakens Yellow (#f9c413) and Pink (#d80e61)
- **Font**: Orbitron for tournament title
- **Logo**: Margate Krakens transparent logo

## 📱 Admin Panel Features

- **Game Selection**: Choose any game to manage
- **Score Updates**: Real-time score input
- **Timer Controls**: Start/Stop/Reset 15-minute timers
- **Half Management**: Switch between 1st and 2nd half
- **Status Updates**: Change game status (Scheduled/In Progress/Completed)

## 🗄️ Database

- **Type**: SQLite (file-based, no setup required)
- **Auto-Creation**: Database and tables created automatically
- **Sample Data**: Pre-loaded with tournament schedule and teams

## 🛠️ Technical Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Real-Time**: Server-side timers with client polling

## 📁 Project Structure

```
├── app/
│   ├── admin/page.tsx          # Admin panel
│   ├── api/                    # API routes
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Public schedule view
├── components/
│   └── ScheduleView.tsx       # Schedule display component
├── lib/
│   ├── database.ts            # Database operations
│   ├── sampleData.ts          # Tournament data
│   └── timer.ts               # Server-side timer system
├── public/
│   └── Krakens-Logo-transparent.png
└── types/
    └── index.ts               # TypeScript definitions
```

## 🎮 Usage

### For Tournament Day:

1. **Start a Game**:
   - Go to Admin Panel
   - Select the game
   - Click "Start Match"
   - Timer begins countdown

2. **Update Scores**:
   - Enter scores in the admin panel
   - Click "Update Game"
   - Scores appear live on public view

3. **Manage Timer**:
   - Start/Stop timer as needed
   - Switch halves (resets timer to 15:00)
   - Timer shows green when running, red when stopped

### For Public Viewing:
- Visit the main page to see live scores and countdown timers
- Updates automatically every 500ms during active games
- Shows team logos, scores, and game status

## 🔧 Development

- **Hot Reload**: Changes update automatically
- **TypeScript**: Full type safety
- **ESLint**: Code quality checks
- **Tailwind**: Utility-first CSS

## 📄 License

Built for Margate Krakens Flag Football Club - Squid Games 2025 Tournament