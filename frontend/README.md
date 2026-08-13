# Stitch Maintenance Wizard - Industrial Dashboard

An advanced AI-powered industrial dashboard built with React and Vite. This application provides comprehensive fleet overviews, equipment exploration, data quality monitoring, and an integrated AI assistant for maintenance workflows.

## Features

- **Fleet Overview**: High-level dashboard for monitoring fleet status and performance metrics.
- **Equipment Explorer**: Detailed catalog and search for industrial equipment.
- **Equipment Details**: Deep dive into individual equipment health, maintenance history, and specifications.
- **AI Assistant**: Integrated Gemini AI assistant to help diagnose issues and recommend maintenance actions.
- **Data Quality**: Monitor and ensure the integrity of sensor data and maintenance logs.
- **User Authentication**: Secure login, signup, and profile management.

## Tech Stack

- **Frontend Framework**: React 19, Vite
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI Integration**: Google Gemini API (`@google/genai`)

## Prerequisites

- Node.js (v18+ recommended)
- A Google Gemini API Key

## Getting Started

1. **Navigate to the project directory**:
   Ensure you are in the project root directory.

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root of the project and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Previews the production build locally.
- `npm run clean`: Removes the `dist` and build artifacts.