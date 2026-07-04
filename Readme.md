# ViewTube

ViewTube is a full-stack video-sharing platform inspired by YouTube. It supports user authentication, video upload and streaming, channel subscriptions, comments, likes, playlists, and short text posts on user profiles.

## Tech Stack

**Frontend**
- React 18 + Vite
- Redux Toolkit with Redux Persist for state management
- React Router for client-side routing
- Material UI (MUI) and Tailwind CSS for styling
- React Hook Form for form handling
- Axios for API communication

**Backend**
- Node.js + Express
- MongoDB with Mongoose (including aggregate pagination)
- JWT-based authentication with bcrypt for password hashing
- Multer for handling file uploads
- Cloudinary for media (video/image) storage and delivery
- Cookie-parser for session/cookie handling

## Core Features

- **Auth:** Signup, login, and secure session handling via JWT stored in HTTP-only cookies
- **Videos:** Upload, stream, update, and delete videos with thumbnail and metadata support
- **Channels:** User channel pages with subscriber counts and subscription management
- **Engagement:** Comments and likes on videos, likes on comments
- **Playlists:** Create and manage playlists of videos
- **Tweets:** Short text-based posts on user profiles, similar to a micro-blog
- **Dashboard:** Channel-level stats for content creators

## Project Structure

```
backend/
  src/
    controllers/   Request handlers for each resource (user, video, comment, like, subscription, tweet)
    routes/         Express route definitions
    models/         Mongoose schemas (user, video, comment, like, playlist, subscription, tweet)
    middleware/     Auth and other Express middleware
    db/             Database connection setup
    utils/          Shared helper utilities

frontend/
  src/              React components, pages, Redux slices, and app entry point
```

## Getting Started

### Prerequisites
- Node.js and npm
- A MongoDB instance (local or Atlas)
- A Cloudinary account for media storage

### Backend Setup
```
cd backend
npm install
npm run dev
```

The backend expects a `.env` file with values such as:
```
PORT=
MONGODB_URI=
CORS_ORIGIN=
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend Setup
```
cd frontend
npm install
npm run dev
```

## Deployment

The project includes a `docker-compose.yml` for containerized deployment of both frontend and backend services. See `deploy.md` for deployment notes and steps.

## Screenshots

![image](https://github.com/user-attachments/assets/63af3533-c4bf-4d3c-973f-7e324d85cdac)

![image](https://github.com/user-attachments/assets/1526c1b6-5686-488b-83cc-d6dc1ef87344)

![image](https://github.com/user-attachments/assets/4fec2be1-8b0c-4138-94ab-a84c406dac6e)

![image](https://github.com/user-attachments/assets/fe8efc60-363a-4e4c-9aa3-05f16aca701d)

![image](https://github.com/user-attachments/assets/8f0aeca3-0cd8-44a7-a5b6-38dfb5927e08)

![image](https://github.com/user-attachments/assets/3d2c9d81-c378-4be2-8ad4-749a70b9542f)
