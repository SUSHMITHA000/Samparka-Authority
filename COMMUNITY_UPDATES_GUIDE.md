# Community Updates Feature Guide

## Overview
The "Community Updates" section has been added to the sidebar, replacing "Authorities". This feature allows you to display community events with dates, times, and descriptions that notify users in real-time.

## Features Implemented

✅ **Sidebar Navigation**: Changed "Authorities" button to "Community Updates"

✅ **Community Updates Page**: Full page view with event cards displaying:
- Event name
- Date
- Time
- Description

✅ **Real-time Notifications**: Community updates appear in the dashboard notifications panel with UPDATE badge

✅ **Responsive Design**: Works on all screen sizes with beautiful card layout

✅ **Interactive Cards**: Click on notifications to navigate to the Community Updates page

## How to Add Community Updates

### 1. Using Firebase Console
1. Go to Firebase Console
2. Select your Samparka project
3. Go to Firestore Database
4. Create a new collection called `communityUpdates`
5. Add documents with the following structure:

```json
{
  "eventName": "Community Cleanup Drive",
  "date": "2025-01-15",
  "time": "09:00 AM",
  "description": "Join us for a community cleanup drive at the central park. We'll be cleaning the premises and making it beautiful. All are welcome!",
  "createdAt": 1704067200000
}
```

### 2. Example Document Structure

**Collection Name**: `communityUpdates`

**Document Fields**:
- `eventName` (string): Name of the event
- `date` (string): Date in format YYYY-MM-DD
- `time` (string): Time in format HH:MM AM/PM
- `description` (string): Detailed description of the event
- `createdAt` (timestamp): When the update was created (automatically set)

### 3. Sample Events

```json
{
  "eventName": "Health Camp 2025",
  "date": "2025-02-01",
  "time": "10:00 AM",
  "description": "Free health checkup camp for all community members. Expert doctors will be available. Please bring any necessary medical documents.",
  "createdAt": 1704067200000
}
```

```json
{
  "eventName": "Independence Day Celebration",
  "date": "2025-02-26",
  "time": "06:00 PM",
  "description": "Join us in celebrating our cultural heritage. Event includes cultural performances, food stalls, and games for all age groups.",
  "createdAt": 1704067200000
}
```

## How It Works

### Dashboard Notifications
- Up to 3 recent community updates appear in the notifications panel on the dashboard
- Click on any notification to navigate to the Community Updates page
- Each notification shows the event name, date, and time

### Community Updates Page
- Access via the "Community Updates" button in the sidebar
- Displays all community events in a beautiful card grid layout
- Each card shows:
  - Event name (with UPDATE badge)
  - Date and Time
  - Full description
  - Posted date
- Responsive design works on mobile, tablet, and desktop

## Styling

The community updates have been styled with:
- Blue accent color (`#206bc4`) for brand consistency
- Hover effects for interactivity
- Gradient backgrounds
- Responsive grid layout
- Clean, modern card design

## Firebase Query
The component uses real-time Firestore queries ordered by date (descending) to automatically fetch and display the latest community updates:

```javascript
const q = query(
  collection(db, "communityUpdates"),
  orderBy("date", "desc")
);
```

This ensures new updates appear automatically without needing to refresh the page.

## Next Steps (Optional Enhancements)

- Add ability for authorities to create/edit community updates from the dashboard
- Add event location information
- Add event category (Health, Culture, Sports, etc.)
- Add RSVP/registration functionality
- Add email notifications for new community updates
- Add event images/banners
