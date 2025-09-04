# Fantasy Card Game

This is a Next.js + Supabase project for a fantasy card game app.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase URL and anon/public key:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Database Setup

- This project uses [Supabase](https://supabase.com/) as the database and authentication provider.
- Create a project on Supabase and set up the `profiles` table with at least these fields:
  - `id` (uuid, primary key, references `auth.users`)
  - `tutorial_complete` (boolean)
  - `username` (text)

You can use the Supabase Table Editor or SQL editor to create these fields.

### 4. Running the App

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 5. Additional Notes

- Make sure your Supabase project has authentication enabled.
- The `.gitignore` is set up to avoid committing sensitive files and build artifacts.
- If you want to deploy, configure your environment variables on the deployment platform as well.

---

Feel free to open issues or submit PRs!


Project is actively being worked on so dependancies may change.