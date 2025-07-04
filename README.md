
# Ascend Arena - Battle for Self-Mastery

A gamified recovery support platform designed to help users overcome destructive habits through daily check-ins, streak tracking, quest completion, and peer accountability.

## 🎯 Project Vision

Ascend Arena transforms habit recovery into an engaging battle for self-mastery. Users track daily victories, complete quests, earn rewards, and support each other through Battle Allies - all while building lasting neural pathways for positive change.

## 🚀 Current Status (Phase 1)

### ✅ Completed Features
- **Authentication System**: Email/password signup and login
- **Profile Management**: Username and timezone onboarding
- **Protected Routing**: Secure access to dashboard features
- **War Room Dashboard**: Overview of user stats and progress
- **Profile Page**: Update user information and view battle statistics

### 🔄 In Development (Next Phase)
- Daily Check-In System with streak tracking
- Token reward system (Valor Shards)
- Quest system with daily missions
- Ally pairing for mutual accountability
- Journey Map visualization
- Social feed among allies

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: TanStack React Query + Jotai
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🏗️ Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Supabase account and project

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ascend-arena
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   Create the following tables in your Supabase database:

   ```sql
   -- Profiles table (extends auth.users)
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
     username TEXT UNIQUE,
     timezone TEXT,
     current_streak INTEGER DEFAULT 0,
     best_streak INTEGER DEFAULT 0,
     token_balance INTEGER DEFAULT 0,
     last_check_in_date DATE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Profiles policies
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);

   CREATE POLICY "Users can insert own profile" ON profiles
     FOR INSERT WITH CHECK (auth.uid() = id);
   ```

5. **Configure Supabase Auth**
   - In your Supabase dashboard, go to Authentication > Settings
   - Set your site URL for redirects
   - Configure any OAuth providers if needed

6. **Start development server**
   ```bash
   npm run dev
   ```

### Additional Setup (Optional)

- **Supabase CLI**: Install for local development
  ```bash
  npm install -g supabase
  supabase init
  supabase start
  ```

## 📱 Usage

1. **Sign Up**: Create a new account with email/password
2. **Onboarding**: Choose your battle username and timezone
3. **Dashboard**: View your current progress and statistics
4. **Profile**: Update your information and view battle stats

## 🎮 Core Concepts

### Battle Terminology
- **War Room**: Main dashboard
- **Battle Username**: Your identity in the arena
- **Valor Shards**: Token currency earned through victories
- **Current Streak**: Consecutive days of victory
- **Battle Allies**: Accountability partners
- **Daily Missions**: Quests to complete

### Gamification Elements
- **Streak System**: Build momentum through consecutive victories
- **Token Economy**: Earn Valor Shards for check-ins and quests
- **Achievement Badges**: Milestone rewards for progress
- **Social Proof**: Share victories with allies
- **Progressive Challenges**: Increasing difficulty over time

## 🔐 Security & Privacy

- Row Level Security (RLS) enabled on all tables
- Minimal data collection - pseudonymous usernames
- Secure authentication via Supabase
- Private by default - data only shared with explicit consent
- HTTPS for all API communications

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Supabase)
- Database and authentication hosted on Supabase
- Edge Functions deployed via Supabase CLI
- Automatic scaling and backups included

## 📈 Roadmap

### Phase 2: Core Gamification
- [ ] Daily check-in system with streak tracking
- [ ] Token reward system implementation
- [ ] Basic quest system
- [ ] Journey map visualization

### Phase 3: Social Features
- [ ] Battle Ally pairing system
- [ ] Commitment contracts and wagers
- [ ] Ally feed and communication
- [ ] Group challenges

### Phase 4: Advanced Features
- [ ] Clan system for team battles
- [ ] Advanced analytics and insights
- [ ] Customizable rewards and cosmetics
- [ ] AI-powered habit coaching

## 🤝 Contributing

This project is in active development. Contributions, suggestions, and feedback are welcome!

## 📞 Support

For questions about setup or development, please check the documentation or create an issue in the repository.

---

**Remember**: This is a journey of self-mastery. Every small step forward is a victory worth celebrating. Your future self will thank you for the courage to begin. 🛡️
