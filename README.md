# PredictiX Frontend

> Front End of PredictiX: AI-Powered Predictive Maintenance & Smart Ticket Categorization for Asset Management

[![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)
- [Branch Status](#branch-status)

## 🎯 About

PredictiX is an intelligent asset management platform that leverages AI for predictive maintenance and smart ticket categorization. This repository contains the frontend application built with modern web technologies to provide a seamless user experience.

## ✨ Features

### Current Features (Master Branch)

- **🎨 Modern UI Components**
  - Reusable components built with React and Tailwind CSS
  - Button, Card, Input, Label, and Select components
  - Consistent design system across the application

- **🌓 Theme Management**
  - Light and dark mode support
  - ThemeProvider for seamless theme switching
  - ThemeToggle component for user preference

- **⚡ Custom Loaders & Animations**
  - PredictiXLoader with custom branding
  - NavigationLoader for smooth transitions
  - BackgroundBlobs for visual effects
  - AntigravityDotsBackground component
  - WaveBackground for enhanced aesthetics

- **🔐 Authentication Interface**
  - Modern login page with visual effects
  - Role selection cards for different user types
  - Secure authentication flow

- **📱 Responsive Design**
  - Mobile-first approach
  - Optimized for all screen sizes
  - Progressive web app capabilities

## 🛠️ Tech Stack

### Core Technologies

- **Framework**: [Next.js 15.1.3](https://nextjs.org/) - React framework with App Router
- **UI Library**: [React 19](https://reactjs.org/) - Component-based UI library
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) - Utility-first CSS framework

### Development Tools

- **Linting**: ESLint with Next.js configuration
- **Code Quality**: TypeScript strict mode
- **Package Manager**: npm
- **Version Control**: Git & GitHub

### UI Components

- Custom component library with shadcn/ui inspiration
- Radix UI primitives for accessibility
- Class variance authority for component variants

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dinusha-Ekanayake/PredictiX-Frontend.git
   cd PredictiX-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
PredictiX-Frontend/
├── src/
│   ├── app/              # Next.js app directory (pages & layouts)
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (Button, Card, etc.)
│   │   ├── theme/       # Theme-related components
│   │   └── loaders/     # Loading components
│   ├── hooks/           # Custom React hooks
│   │   └── useNavRouter.ts
│   └── lib/             # Utility functions
│       └── utils.ts
├── public/              # Static assets
│   ├── logo/           # PredictiX branding
│   └── *.svg           # SVG icons
├── components.json      # shadcn/ui configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── next.config.ts       # Next.js configuration
└── package.json         # Project dependencies
```

## 💻 Development

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper type definitions
- Follow the existing component patterns

### Theme Customization

The application uses a custom theme system. Modify `tailwind.config.ts` to customize:
- Color palette
- Typography
- Spacing
- Breakpoints

### Adding Components

1. Create component in appropriate directory under `src/components/`
2. Use TypeScript for type safety
3. Style with Tailwind CSS utilities
4. Export from index file for clean imports

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📌 Branch Status

### ⚠️ Current Branch: `copilot/pull-and-merge-changes`

This branch is in the process of merging changes from the `master` branch. Due to private repository authentication constraints in the automated environment, the merge requires manual intervention.

**To complete the merge:**

1. **Using the helper script (Recommended):**
   ```bash
   bash complete-merge.sh
   ```

2. **Manual merge:**
   ```bash
   git checkout copilot/pull-and-merge-changes
   git fetch origin
   git merge origin/master
   git push origin copilot/pull-and-merge-changes
   ```

For detailed information, see:
- [`README_MERGE_STATUS.md`](./README_MERGE_STATUS.md) - Quick reference
- [`MERGE_INSTRUCTIONS.md`](./MERGE_INSTRUCTIONS.md) - Technical details
- [`complete-merge.sh`](./complete-merge.sh) - Automated merge script

### Master Branch

The `master` branch contains the complete Next.js application with:
- Full PredictiX branding and UI implementation
- All components, hooks, and utilities
- Complete configuration and build setup
- Login page and authentication flow

## 📄 License

This project is part of PredictiX - AI-Powered Predictive Maintenance & Smart Ticket Categorization Platform.

## 👥 Team

Maintained by [@Dinusha-Ekanayake](https://github.com/Dinusha-Ekanayake)

---

**Note**: This is a private repository. Ensure you have proper authentication configured before cloning or contributing.
