# TypeCarnival: Arcade Keyboarding & Teacher Dashboard (Grades 2–5)

TypeCarnival is an interactive, gamified elementary keyboarding web application designed for 2nd through 5th graders. It pairs skill-based adaptive typing lessons with retro arcade carnival mini-games, an on-screen color-coded keyboard with finger placement guides, ticket rewards, and an educator dashboard featuring real-time class metrics, goal tracking, struggle-key diagnostics, and gradebook CSV exports.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your preferences from Phase 1, we have aligned the architectural direction and feature set around three confirmed pillars:
>
> - **Confirmed Theme**: **Arcade Carnival** — A vibrant, retro carnival midway aesthetic featuring neon signs, ticket dispensers, carnival mini-games (Balloon Dart, Ticket Roller, Claw Machine), and an unlockable Prize Booth.
> - **Confirmed Scaffolding**: **Skill-Based Adaptive Progression** — Tiered skill progression starting at Home Row foundations and dynamically unlocking higher rows, punctuation, sight words, and fluency sentences as accuracy thresholds ($\ge 90\%$) are mastered, paired with targeted struggle-key remediation drills.
> - **Confirmed Reporting**: **Real-Time Class Dashboard & CSV Export** — Comprehensive teacher console monitoring student WPM, accuracy, time spent, struggle keys, and goal progress, complete with instant one-click CSV export formatted for classroom instruction and gradebooks.

---

## 1. Overview & Core Concept

### Target Audience & Personas
- **Elementary Students (Grades 2–5)**: Young learners who need clear finger-to-key associations, high-contrast visual cues, low cognitive friction, and immediate positive feedback.
- **Elementary Educators & Technology Teachers**: Teachers who need effortless classroom management (switching between students or classes), real-time visibility into who needs help with which keys, and exportable reports for parents and grading.

### Key Value
- Replaces dry, monotonous typing drills with an exciting carnival experience that keeps students motivated.
- Reduces bad habits (e.g., hunt-and-peck) through animated on-screen hands with color-coordinated finger zones.
- Gives teachers actionable diagnostic data: pinpointing whether a student struggles with specific letters (e.g., reaching with the pinky for `P` or left-hand coordination on `B`).

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Student Adventure Mode (Arcade Midway)**:
   - Student selects their avatar and grade level.
   - Enters the **Carnival Midway Map** displaying tiered carnival tents:
     - *Tent 1: Home Row Haven* (`A S D F` & `J K L ;`)
     - *Tent 2: Top Row Trampoline* (`Q W E R T Y` & `U I O P`)
     - *Tent 3: Bottom Row Bumper Cars* (`Z X C V B N M , .`)
     - *Tent 4: Number & Symbol Coaster* (`1–0`, `! ? ' " -`)
     - *Tent 5: Midway Word Master* (Grade-appropriate high-frequency sight words)
     - *Tent 6: Story Spectacular* (Fun carnival sentence stories with punctuation and rhythm)
   - Inside each lesson:
     - Real-time animated keyboard displays which finger to use with left/right hand guides.
     - Live typing target with ghost cursor and immediate non-punitive visual cues.
     - Web Audio procedural sound effects (arcade coin drop, soft typewriter click, celebration fanfares, with global mute).
     - Completion screen awards golden carnival tickets, calculates WPM, net accuracy, and reveals earned prize badges.

2. **Arcade Mini-Games**:
   - **Balloon Dart Pop**: Type falling carnival balloons before they float away.
   - **Ticket Roller Sprint**: Type rolling word tickets in a 60-second burst for high scores.
   - **Claw Machine Word Grab**: Successfully type the target vocabulary word to lower the claw and retrieve plush prizes into the student's personal cabinet.

3. **Prize Booth**:
   - Students spend earned tickets to unlock carnival avatar hats, custom keyboard themes (e.g., Neon Nights, Golden Midway, Cotton Candy, Retro CRT), and collectible carnival plushies.

4. **Teacher Command Center**:
   - **Roster & Performance Matrix**: Filter by grade (Grade 2, 3, 4, 5) or view all students.
   - **Live Metric Indicators**: Average Class WPM, Class Accuracy %, Active Practice Time, and Struggling Keys distribution.
   - **Classroom Goal Tracker**: Set weekly targets (e.g., "Goal: 20 WPM & 92% Accuracy") with a visual class progress thermometer.
   - **Student Diagnostic Drawer**: Click any student to view their accuracy history, lesson completion status, and personal keyboard error heatmap.
   - **Roster Management**: Quick toggle to add students or reset student scores for new classroom trials.
   - **Export Engine**: One-click download of clean CSV performance reports ready for Google Sheets or Excel.

### Visual Identity & Theme
- **Aesthetic Direction**: High-energy, playful retro carnival midway meets clean educational clarity. No generic AI purple gradients or cluttered pill boxes.
- **Color Palette (60-30-10 Rule)**:
  - `60% Neutral Canvas`: Crisp carnival cream / parchment background (`#FFFDF7` light mode) or deep midnight carnival navy (`#0F172A` arcade mode).
  - `30% Structural Surfaces`: Warm amber borders (`#FDE68A`), ticket-paper cards (`#FEF3C7`), and retro arcade slate (`#1E293B`).
  - `10% Vibrant Accents`: Golden Ticket Yellow (`#F59E0B`), Carnival Crimson (`#E11D48`), Electric Teal (`#0D9488`), and Indigo Night (`#4F46E5`).
- **Typography**:
  - Display / Headers: `Outfit` or `Plus Jakarta Sans` (punchy, geometric, friendly).
  - Typing Prompts & Code: Tabular monospace font (`JetBrains Mono` / `font-mono tabular-nums`) for rock-solid vertical character alignment and caret stability.
- **Interactive Feedback & Motion**:
  - Spring-settling keypress animations.
  - Floating confetti/ticket particle bursts on lesson completion.
  - Smooth progress bar transitions without layout shift.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Audio Engine Implementation**
  - *Chosen Approach*: Web Audio API procedural synthesizer for arcade beeps, ticket chimes, and rewarding chimes.
  - *Why*: Eliminates dependencies on external audio files that could fail to load or get blocked by school filters, works 100% offline with zero latency, and provides an instant mute button for quiet classroom environments.
- **Decision 2: State Persistence & Demo Roster**
  - *Chosen Approach*: LocalStorage-backed reactive state initialized with realistic Grade 2–5 classroom roster and real performance histories, with instant switching between Student Mode and Teacher Mode.
  - *Why*: Allows immediate, friction-free demonstration and classroom testing without requiring school district Google OAuth logins or backend database provisioning, while supporting full CRUD (adding students, recording real typing attempts, exporting CSV).
- **Decision 3: Keyboard Scaffolding & Error Handling**
  - *Chosen Approach*: Non-blocking, gentle error model with color-coded key guide. When a student presses an incorrect key, the visual keyboard highlights the correct key and the recommended finger, allowing them to correct without harsh punishment.
  - *Why*: Essential for young elementary learners (Grades 2–5) to prevent frustration and encourage proper muscle memory.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TypeCarnival Architecture                       │
└────────────────────────────────────────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌───────────────────────────────┐           ┌────────────────────────────┐
│         Student View          │           │     Teacher Dashboard      │
├───────────────────────────────┤           ├────────────────────────────┤
│ • Carnival Midway Map         │           │ • Real-time Class Overview │
│ • Interactive Typing Canvas   │           │ • Goal Setting Thermometer │
│ • On-screen Hands & Keyboard  │           │ • Student Heatmap Inspector│
│ • Arcade Minigames (3 games)  │           │ • Roster Manager (Add/Edit)│
│ • Ticket Prize Booth          │           │ • CSV Export Generator     │
└───────────────┬───────────────┘           └──────────────┬─────────────┘
                │                                          │
                └───────────────────┬──────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Unified Classroom State Engine                       │
│  (LocalStorage + Sample Grade 2-5 Roster + Real Typing Session Logs)   │
├────────────────────────────────────────────────────────────────────────┤
│ • Students Roster (ID, Name, Grade, Avatar, TotalTickets, Unlocks)     │
│ • Lesson Curriculum (Home Row -> Top -> Bottom -> Numbers -> Words)    │
│ • Session Results (WPM, Accuracy, Duration, StruggleKeys, Timestamp)  │
│ • Class Goals (Target WPM, Target Accuracy, Target Minutes, Deadline)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Web Audio Sound Synthesizer                     │
│  (Click, Ticket Chime, Level Fanfare, Error Thump, Global Mute)       │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Models & Schema

```typescript
export interface Student {
  id: string;
  name: string;
  grade: 'Grade 2' | 'Grade 3' | 'Grade 4' | 'Grade 5';
  avatar: string;
  totalTickets: number;
  currentLevelId: string;
  unlockedPrizes: string[];
  sessions: TypingSession[];
}

export interface TypingSession {
  id: string;
  lessonId: string;
  lessonTitle: string;
  wpm: number;
  accuracy: number;
  durationSeconds: number;
  ticketsEarned: number;
  struggleKeys: string[];
  completedAt: string;
}

export interface Lesson {
  id: string;
  tier: number;
  title: string;
  subtitle: string;
  category: 'home-row' | 'top-row' | 'bottom-row' | 'numbers' | 'words' | 'sentences';
  targetKeys: string[];
  exercises: string[];
  requiredAccuracy: number;
  minWpm: number;
  ticketReward: number;
}

export interface ClassGoal {
  id: string;
  targetWpm: number;
  targetAccuracy: number;
  targetWeeklyMinutes: number;
  targetDate: string;
}
```

### Export Engine
- Formats performance data into RFC 4180 compliant CSV:
  - `Student Name`, `Grade`, `Current Level`, `Avg WPM`, `Avg Accuracy %`, `Completed Lessons`, `Total Practice Time (Mins)`, `Total Tickets`, `Top Struggle Keys`, `Last Active Date`.
- Generates instant browser download without server roundtrips.

---

## 5. Planned Verification Steps

1. **Typing Engine Verification**: Ensure keystroke interception accurately calculates gross WPM, net WPM, character-level accuracy, and live caret positioning with full backspace and correction support.
2. **Keyboard Visual Sync**: Verify color-coded finger cues and visual hand highlights match the active target character in real time.
3. **Adaptive Progression**: Confirm that lessons unlock upon achieving $\ge 90\%$ accuracy and that struggle keys trigger tailored review drills.
4. **Teacher Export**: Test CSV export generation across filtered grades to confirm complete and accurate data columns.
5. **Applet Compilation**: Run `compile_applet` to guarantee error-free TypeScript build and asset integrity.
