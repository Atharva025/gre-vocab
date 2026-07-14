# GRE Vocab Master – Smart Verbal Prep

An interactive, high-fidelity, and fully offline-resilient web application designed to prepare students for the GRE Verbal Reasoning section. Built entirely client-side, the app offers structured study pathways, visual flashcards with Spaced Repetition (SRS), dynamic quizzes, and a comprehensive semantic dictionary.

---

## 🚀 Features

### 1. Unified Study Dashboard
- **Progress Tracking**: Real-time visualization of learning states (Mastered vs. Learning) via clean, colorful progress bars.
- **Daily Streak Tracker**: Tracks active consecutive days to keep you motivated.
- **Word List Progress**: Grid layout of the 13 built-in word lists with list-specific completion stats.
- **Study Guides**: GRE-focused strategy tips covering Sentence Equivalence, Text Completion, and active review concepts.

### 2. Spaced Repetition (SRS) Flashcards
- **Interactive 3D Cards**: Smooth card flip animations (`preserve-3d`) to hide and reveal definitions.
- **SRS Grading Loop**: Grade your recall (Again, Hard, Good, Easy) using mouse clicks or **keyboard shortcuts** (`1`, `2`, `3`, `4`).
- **Flexible Configurations**: Study specific lists, sort cards sequentially or randomly, filter by study status, or study your starred bookmarks only.

### 3. Comprehensive Dictionary & Semantic Explorer
- **Thematic Grouping**: Words are organized by semantic themes (e.g., *Angry/Scold*, *Praise/Honor*, *Intellectual/Know*) to help you spot synonyms—ideal for Sentence Equivalence questions.
- **Dictionary API Integration**: Pulls definition details, phonetics, and audio pronunciations from the public English dictionary.
- **Local Storage Cache**: Automatically saves looked-up definitions so they load instantly next time.
- **Smart Offline Fallback**: Detects internet status (`navigator.onLine`). When offline, it displays warning banners and falls back to offline thematic meanings rather than caching failed/blank responses.

### 4. Adaptive Quiz Center
- **5 GRE Question Formats**:
  - **Theme Match (MCQ)**: Match words to their core semantic theme.
  - **Fill in the Blanks**: Complete contextual sentence completions.
  - **Sentence Equivalence**: Select the *two* synonymous words that complete a blank.
  - **Odd Man Out**: Spot the word that doesn't fit the thematic cluster.
  - **Match the Following**: Interactively connect 4 words to their correct themes.
- **Sourcing Strategies**:
  - *Custom Selection*: Hand-pick the lists to include.
  - *Combined Mega Mix*: Auto-mix words across all 13 lists.
  - *Randomized System Mix*: Let the system select a random mix of 3-6 lists.
- **Time Limits**: Option to run timed quizzes with color-coded countdown bars that shift to rose alerts when time is low.
- **High-Resilience Engine**: Built with bounded retry logic (`MAX_RETRIES = 8`) to completely prevent browser-hanging infinite loops.

---

## 🛠️ Technology Stack
- **Framework**: React (Vite-based)
- **Styling**: Tailwind CSS (White theme, Inter typography, customized transition curves, custom scrollbars)
- **Icons**: Lucide Icons
- **State Management**: React Hooks + Local Storage persistence (zero external database/backend required)

---

## 📦 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Atharva025/gre-vocab.git
   cd gre-vocab
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build the application for production:
   ```bash
   npm run build
   ```

---

## 🔒 Offline & Local Persistence
This application requires **no backend or database**.
- Study progress, starred items, performance stats, and dictionary lookup caches are stored locally inside the user's browser `localStorage`.
- All vocabulary lists and GRE sentence templates are packaged directly inside the application bundle (`src/data/dictionary.json` & `src/data/sentenceTemplates.js`), ensuring complete functionality even with low or zero internet connection.
