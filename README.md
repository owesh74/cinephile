# 🎬 OnyxMovies

A modern movie discovery and tracking platform built with Next.js, Supabase, PostgreSQL, and Drizzle ORM.

Cinephile lets users discover movies, manage their personal movie library, rate films, build lists, connect with friends, and explore actors, directors, and writers.

---

## ✨ Features

### 🎞️ Movie Discovery
- Discover popular movies
- Browse movies by genre
- View recently added movies
- Explore similar movies
- View detailed movie information
- IMDb and Cinephile ratings

### 👤 People
- Browse actors, directors, and writers
- Search people
- View individual person profiles
- See their movie credits
- Like people

### 📚 Personal Movie Tracking
Logged-in users can:

- Add movies to their watchlist
- Mark movies as watched
- Rate movies from 1–10
- View their ratings
- View watched movies
- Continue watching movies from their watchlist

### 🤝 Social Features
- Add friends
- See friends who watched a movie
- View friend activity
- User profiles
- Personal activity feed

### 📝 Lists
- Create movie lists
- Browse movie lists
- Add movies to lists
- Rank movies inside lists
- System and user-created lists

### 🏆 Achievements
The project includes an achievement system for rewarding user activity.

### 🔐 Authentication
Authentication is handled using Supabase Auth.

Users can:
- Register
- Log in
- Log out
- Verify their email
- Maintain a personal profile

### 📱 Responsive Design
The interface is designed to work across:

- Desktop
- Tablet
- Mobile

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack React framework |
| React | UI |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Supabase | Authentication & PostgreSQL |
| PostgreSQL | Database |
| Drizzle ORM | Database queries & schema |
| Lucide React | Icons |
| Vercel | Deployment |

---

## 📁 Project Structure

```text
cinephile/
│
├── app/
│   ├── activity/
│   ├── add/
│   ├── discover/
│   ├── friends/
│   ├── lists/
│   ├── login/
│   ├── movie/
│   ├── people/
│   ├── profile/
│   ├── ratings/
│   ├── register/
│   ├── search/
│   ├── watched/
│   ├── watchlist/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── nav-bar.tsx
│   ├── mobile-nav.tsx
│   ├── search-box.tsx
│   ├── rating-widget.tsx
│   ├── tracking-buttons.tsx
│   └── movie-poster-grid.tsx
│
├── db/
│   ├── index.ts
│   └── schema.ts
│
├── lib/
│   ├── actions/
│   ├── data/
│   ├── supabase/
│   └── validations/
│
├── public/
│
├── .env.local
├── drizzle.config.ts
├── next.config.ts
├── package.json
└── README.md
````

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/owesh74/cinephile.git
cd cinephile
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create environment variables

Create:

```text
.env.local
```

Add your Supabase and database configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

DATABASE_URL=your_postgresql_connection_string
```

> Never commit `.env.local` or expose your Supabase service-role key.

---

## 🗄️ Database

The project uses PostgreSQL with Drizzle ORM.

The database contains tables for:

* Users
* Movies
* Genres
* Countries
* People
* Movie genres
* Movie countries
* Movie cast
* Watchlist
* Watched movies
* Ratings
* Lists
* List movies
* Friendships
* Activities
* Achievements
* User achievements
* Liked people

The database schema is located at:

```text
db/schema.ts
```

---

## 🔧 Database Configuration

For local development, use your Supabase PostgreSQL connection string in:

```env
DATABASE_URL=...
```

For Vercel production, configure the same variable under:

```text
Vercel
→ Project
→ Settings
→ Environment Variables
```

Make sure the production database URL is available to the **Production** environment.

---

## 🌱 Seeding Movies

The project contains seed scripts for inserting movies, genres, countries, people, and movie relationships.

A seed script can populate:

* Movie metadata
* Genres
* Countries
* Directors
* Writers
* Actors
* Movie/genre relationships
* Movie/country relationships
* Movie cast relationships

Run your configured seed command, for example:

```bash
npm run seed
```

If your project uses a different script, check:

```bash
npm run
```

to see the available commands.

---

## 💻 Development

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

The application can be developed locally while using the Supabase project for authentication and PostgreSQL.

---

## 🏗️ Production Build

Before deploying, run:

```bash
npm run build
```

Then:

```bash
npm start
```

A successful build should finish without TypeScript or Next.js build errors.

---

## 🔐 Supabase Authentication

For local development, configure:

```text
http://localhost:3000
```

For production, add your Vercel domain.

Example:

```text
https://your-project.vercel.app
```

In Supabase:

```text
Authentication
→ URL Configuration
```

Configure your production URL and keep the local URL available for development.

---

## ☁️ Deployment

The application is designed to deploy on Vercel.

### Deploy with Vercel

Connect the GitHub repository to Vercel and configure:

```text
Framework:
Next.js
```

Vercel will automatically run the production build.

Make sure these environment variables are configured in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
```

After changing environment variables, redeploy the application.

---

## 🌐 Local + Production

Cinephile supports both local development and production deployment.

### Local

```text
http://localhost:3000
```

### Production

```text
https://your-domain.vercel.app
```

Both environments can use the same Supabase project while having different application URLs.

---

## 🧩 Main Routes

```text
/
├── /discover
├── /search
├── /movie/[id]
├── /people
├── /people/browse
├── /people/[id]
├── /lists
├── /lists/[id]
├── /lists/create
├── /profile
├── /user/[username]
├── /watchlist
├── /watched
├── /ratings
├── /friends
├── /activity
├── /add
├── /login
└── /register
```

---

## 🎨 Design

Cinephile uses a cinematic interface with an emphasis on:

* Dark visual presentation
* Large movie artwork
* Clean typography
* Rounded cards
* Responsive layouts
* Movie posters and backdrops
* Minimal navigation
* Mobile-friendly interactions

---

## 🧪 Testing

Before pushing changes:

```bash
npm run build
```

For local development:

```bash
npm run dev
```

Recommended manual checks:

* Register
* Email verification
* Login
* Logout
* Movie discovery
* Search
* Movie details
* Watchlist
* Watched
* Ratings
* Friends
* Lists
* People
* Mobile navigation

---

## 🔒 Security

Do not commit sensitive credentials.

Never put these values directly into source code:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
database passwords
private API keys
```

Use environment variables instead.

Your `.gitignore` should include:

```gitignore
.env
.env.local
.env.*.local
```

---

## 🧑‍💻 Author

**Owesh**

Built with Next.js, Supabase, PostgreSQL, and Drizzle ORM.

---

## 📄 License

This project is currently a personal project.

If you plan to make it public or open-source, add your preferred license here.

---

## 🎬 About

Cinephile is built for people who love movies.

Discover films.
Track what you've watched.
Build your collection.
Rate your favorites.
Connect with other movie lovers.

**Made by Owesh.**

```

One thing I'd change before committing this: if you've renamed the app from **Cinephile** to something else, replace the `Cinephile` branding in the README with the new name so your GitHub repository and website branding match.
```
