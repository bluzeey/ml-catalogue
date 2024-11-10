# AI/ML Platform Catalog

This project provides a full-stack solution for cataloging and summarizing AI/ML platforms. The backend processes and stores catalog data, uses OpenAI to generate summaries, and fetches Reddit reviews via Google Custom Search. The frontend, built with Next.js, TypeScript, Tailwind CSS, and ShadCN, provides an interface for searching and viewing platform details.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Best Practices Followed](#best-practices-followed)
- [Future Enhancements](#future-enhancements)

## Features

### Backend:
- Catalogs AI/ML platforms using data in CSV format.
- Generates one-page summaries using OpenAI.
- Retrieves Reddit reviews via Google Custom Search API.
- Provides search results as a REST API.

### Frontend:
- User-friendly search interface for AI/ML platforms.
- Responsive design using Tailwind CSS and ShadCN for UI consistency.
- Displays summaries, features, and customer reviews in a card-based layout.

## Technologies Used

### Backend:
- Node.js, Express, TypeScript
- OpenAI API
- Google Custom Search API
- dotenv, fs-extra

### Frontend:
- Next.js, React, TypeScript
- Tailwind CSS, ShadCN for styling
- Axios for API requests

## Project Structure

### Backend
graphql

```backend/
├── src
│   ├── controllers
│   │   └── searchCsvController.ts    # Handles search and summary generation
│   ├── services
│   │   ├── csvService.ts             # CSV data operations
│   │   ├── openaiService.ts          # OpenAI summary generation
│   │   └── redditService.ts          # Reddit reviews fetching
│   ├── app.ts                        # Express app configuration
│   └── server.ts                     # Server setup
├── data
│   └── trustradius-ml.csv            # CSV data file (example)
└── package.json

```

Frontend

```
frontend/
├── components
│   ├── SearchForm.tsx                # Search form component
│   └── PlatformSummary.tsx           # Displays platform summaries
├── pages
│   ├── index.tsx                     # Home page with search interface
├── styles
│   └── globals.css                   # Global styles with Tailwind CSS
├── .env.local                        # Frontend environment variables
└── package.json
```

Getting Started
Prerequisites
Node.js (14.x or above)
npm
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/your-username/ai-ml-platform-catalog.git
cd ai-ml-platform-catalog
Install dependencies for both backend and frontend:

bash
Copy code
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
```
cd ../frontend
npm install
Environment Variables
Backend
Create a .env file in the backend directory with the following variables:
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CUSTOM_SEARCH_CX=your_google_cx_id
SERP_API_KEY=your_google_api_key
PORT=8000
Frontend
Create a .env.local file in the frontend directory with the backend URL:

NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
Running the Application
Backend: Start the backend server by navigating to the backend folder and running:

npm run start
The server should now be running on http://localhost:8000.

Frontend: Start the frontend development server by navigating to the frontend folder and running:

npm run dev
The frontend should now be accessible on http://localhost:3000.

API Endpoints (Backend)
GET /api/search
Searches for a platform by name, fetches relevant data from the CSV file, and generates a summary using OpenAI. If available, includes Reddit reviews.

Query Parameters
query: (string) Name of the platform.
file: (string) CSV file name (e.g., trustradius-ml.csv).
Example Request
http
GET http://localhost:8000/api/search?query=AI21+Jurassic&file=trustradius-ml.csv
```
### Best Practices Followed
Modular Code Structure: Divided responsibilities into separate files for easy maintenance and scalability (e.g., services for OpenAI, CSV, Reddit).
Environment Variables: Used dotenv to secure sensitive information (e.g., API keys).
TypeScript: Provided strict typing for better code readability and reduced runtime errors.
Error Handling: Implemented try-catch blocks to gracefully handle errors, especially with external API requests.
Responsive UI: Used Tailwind CSS for a responsive design that adapts to different screen sizes.
ShadCN: Ensured a consistent and accessible UI experience across components.


## Future Enhancements
Add Pagination: Implement pagination to handle larger datasets more efficiently.
Caching: Cache frequently accessed CSV data to reduce filesystem operations.
Advanced Filtering: Allow users to filter results based on multiple criteria like industry or pricing.
Testing: Add unit and integration tests for improved code reliability.
