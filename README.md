# Luxury Escapes - Trip Planner

A modern, interactive travel itinerary planner built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- **Interactive Map**: Visualize all your trip locations on an interactive Leaflet map
- **Day-by-Day Itinerary**: Organize activities by day with detailed information
- **Activity Cards**: Each activity includes time, duration, location, and descriptions
- **Trip Summary**: View total costs, status credits, and points earned
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Location Highlighting**: Click on activity locations to focus them on the map

## Tech Stack

- **Next.js 15.5**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **Leaflet & React-Leaflet**: Interactive maps
- **OpenStreetMap**: Map tiles

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
luxury-escapes/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Trip header with stats
│   ├── ItinerarySidebar.tsx # Sidebar container
│   ├── DaySection.tsx      # Day grouping component
│   ├── ActivityCard.tsx    # Individual activity card
│   ├── TripMap.tsx         # Interactive map
│   └── SummaryFooter.tsx   # Trip cost summary
├── lib/
│   ├── types.ts            # TypeScript types
│   └── mockData.ts         # Sample trip data
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── next.config.js          # Next.js configuration
```

## Customization

### Adding Your Own Trip Data

Edit `lib/mockData.ts` to customize the trip information:

- Update trip title, location, and creator
- Modify the itinerary days and activities
- Adjust coordinates for map markers
- Update pricing and points in the summary

### Styling

The app uses Tailwind CSS for styling. You can:

- Customize colors in `tailwind.config.ts`
- Modify component styles in individual component files
- Add global styles in `app/globals.css`

## Features Explained

### Interactive Map

- Color-coded markers for different days
- Click on location links in activities to zoom to that location
- Popup information on marker click
- "View on device" button for mobile directions

### Activity Management

- Activities organized by day
- Time and duration tracking
- Location information with map integration
- Added-by user attribution
- Links to more information

### Summary Footer

- Real-time cost calculation
- Status credits tracking
- Loyalty points display

## License

ISC
