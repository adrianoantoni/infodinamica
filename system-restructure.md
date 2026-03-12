# System Restructuring Plan

## Overview
The user downloaded a generated application (likely from v0 or a similar AI tool) that contains a disorganized structure. The goal is to set up a standard, clean, and scalable folder structure for this React + Vite online store (infodinamica), separating concerns, moving types and constants to appropriate locations, and organizing components by domain/layout.

## Project Type
**WEB** (React, Vite, TypeScript)

## Success Criteria
- All application code is moved inside a `src/` directory.
- Components are categorized (e.g., `layout`, `ui`, `features`).
- Pages are organized inside `src/pages`.
- Global types and constants have designated folders (`src/types`, `src/constants` or `src/lib`).
- The application builds and runs without import errors.
- The structure supports future scalability and feature additions without becoming messy.

## Tech Stack
- **React 19** with **Vite**
- **TypeScript** for type safety
- **Tailwind CSS** (assumed, typical for v0/Lucide-react inputs)
- **Lucide React** for icons
- **Recharts** for Admin dashboard features

## File Structure (Target)

```
/
├── public/                 # Static assets
├── src/                    # Main application code
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable UI components
│   │   ├── layout/         # Header, Footer, Navbar, Sidebar
│   │   ├── ui/             # Buttons, inputs, modals
│   │   └── features/       # Domain-specific components
│   ├── context/            # Global state (AppContext.tsx)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions, API clients
│   ├── pages/              # Route components (Home, Shop, Admin)
│   ├── types/              # TypeScript declarations (types.ts)
│   ├── constants/          # Static data (constants.tsx)
│   ├── App.tsx             # Root component and router
│   └── main.tsx (or index.tsx) # Application entry point
├── index.html              # Vite HTML entry
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Task Breakdown

### Task 1: Initialize the `src/` directory and basic scaffolding
- **Agent:** `bash-linux` (or simply `orchestrator` performing FS operations)
- **Skills:** `clean-code`, `bash-linux`
- **Priority:** P0
- **Dependencies:** None
- **INPUT:** Current flat root directory.
- **OUTPUT:** New `src/` folder with subdirectories: `components/layout`, `components/ui`, `pages`, `context`, `types`, `constants`, `hooks`, `lib`.
- **VERIFY:** `ls src` successfully lists the folders.

### Task 2: Migrate Core Configs and Entry Points
- **Agent:** `frontend-specialist`
- **Skills:** `clean-code`, `frontend-design`
- **Priority:** P1
- **Dependencies:** Task 1
- **INPUT:** `App.tsx`, `index.tsx`, `types.ts`, `constants.tsx`
- **OUTPUT:** Moved to `src/`. Need to update `index.html` import path to `/src/index.tsx`.
- **VERIFY:** `cat index.html` shows `/src/index.tsx`.

### Task 3: Migrate and Organize Components
- **Agent:** `frontend-specialist`
- **Skills:** `clean-code`, `frontend-design`
- **Priority:** P1
- **Dependencies:** Task 2
- **INPUT:** Flat `components/` folder (`Header.tsx`, `Footer.tsx`, etc.)
- **OUTPUT:** Moved to `src/components/layout/` and updated internal imports.
- **VERIFY:** Build check passes for components.

### Task 4: Migrate Pages and Context
- **Agent:** `frontend-specialist`
- **Skills:** `clean-code`, `frontend-design`
- **Priority:** P1
- **Dependencies:** Task 2, Task 3
- **INPUT:** Flat `pages/` and `context/` folders.
- **OUTPUT:** Moved to `src/pages/` and `src/context/` respectively. Import paths updated across all files (pages referencing components and context).
- **VERIFY:** `npm run build` succeeds without path resolution errors.

## Phase X: Verification
- [ ] **Lint & Type Check:** Run `npm run lint` and `npx tsc --noEmit` to ensure no broken imports remain.
- [ ] **Build:** Run `npm run build` to ensure the project bundles successfully.
- [ ] **Runtime:** Run `npm run dev` and verify the app loads.
- [ ] **Security/Audit:** Not strictly necessary for a folder restructure, but run `python .agent/scripts/checklist.py .` if available.
