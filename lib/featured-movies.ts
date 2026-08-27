// Curate the homepage hero slider here.
//
// Add real movie IDs (copy the UUID from a /movie/[id] URL or your DB)
// paired with a landscape image URL for that slide's background.
// The movie's title, rating, year, genres, and description still come
// from the real database row — only the image (and optional trailer
// link / badge label below) are overridden here.
//
// Works for upcoming movies too — just add their ID + a landscape
// image. If the movie's release date is in the future, the slide
// automatically shows a "Coming Soon" badge instead of "Popular Now".
//
// Leave this array empty to fall back to the most-watched movies,
// using their existing backdropUrl/posterUrl automatically.

export type FeaturedMovie = {
  movieId: string;
  image: string;
  trailerUrl?: string; // optional — e.g. a YouTube link. Adds a "Watch Trailer" button.
  badge?: string; // optional — overrides the auto "Popular Now" / "Coming Soon" label.
};

export const FEATURED_MOVIES: FeaturedMovie[] = [
  {
    movieId: "91231328-7f4a-4e2a-baba-e48c3ecc516f",
    image: "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e81c3666-def3-4919-86b8-6e673b87031d/djey0hq-9dd216fc-03e3-4dc3-9d30-7b503a2bc399.jpg/v1/fill/w_1192,h_670,q_70,strp/avengers_doomsday_4k_wallpaper_by_gravelord78_djey0hq-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MjE2MCIsInBhdGgiOiIvZi9lODFjMzY2Ni1kZWYzLTQ5MTktODZiOC02ZTY3M2I4NzAzMWQvZGpleTBocS05ZGQyMTZmYy0wM2UzLTRkYzMtOWQzMC03YjUwM2EyYmMzOTkuanBnIiwid2lkdGgiOiI8PTM4NDAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.DrZN5axRnh1tfvDexgOnYjsQwlD0lHp5pJ8IWJbBV58",
    trailerUrl: "https://www.youtube.com/watch?v=irVNGjRFZGk",
  },
  {
    movieId: "465c9341-8fa3-4f42-9f40-9515e39cc2e0",
    image: "https://images5.alphacoders.com/131/thumb-1920-1315822.jpg",
    // trailerUrl: "https://www.youtube.com/watch?v=sY1S34973zA",
  },
   {
    movieId: "9ee68e64-7a48-4e0e-a786-3562bd58c078",
    image: "https://wallpaperaccess.com/full/25731512.jpg",
    // trailerUrl: "https://www.youtube.com/watch?v=sY1S34973zA",
  },
   {
    movieId: "07604496-d135-434d-af48-03d4f16315ad",
    image: "https://www.shutterstock.com/shutterstock/videos/1062699187/thumb/1.jpg?ip=x480",
    // trailerUrl: "https://www.youtube.com/watch?v=sY1S34973zA",
  },
  
];