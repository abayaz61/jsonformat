# JSON Formatter

A modern, feature-rich JSON formatting and viewing tool built with Next.js 16. Format, beautify, minify, and explore JSON data with an intuitive interface.

🌐 **Live Demo:** [jsonformat.info](https://jsonformat.info/)

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

### Core Functionality
- **JSON Formatting** - Beautify and minify JSON with customizable indentation
- **Syntax Validation** - Real-time JSON syntax error detection
- **JSON Tree View** - Interactive collapsible tree visualization with context menu
- **Monaco Editor** - Professional code editing experience with syntax highlighting

### Export & Conversion
- **Model Generation** - Export JSON structure as type definitions:
  - TypeScript interfaces
  - Python dataclasses
  - Java classes
  - C# classes
  - Go structs
  - Rust structs

### User Experience
- **🌍 Multi-Language Support** - Available in 6 languages:
  - English, Türkçe, Deutsch, Français, Italiano, 中文
- **🎨 Theme Customization** - Multiple color palettes with interactive carousel selector
- **📱 PWA Support** - Install as a native app on any device
- **⌨️ Keyboard Shortcuts** - Full keyboard navigation support

### Technical Features
- **Static Export** - Optimized static site generation
- **SEO Optimized** - Full meta tags, structured data, and sitemap
- **Offline Ready** - Service worker with Serwist for offline functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/abayaz61/json-formatter.git
cd json-formatter

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build for production (static export)
npm run build

# Serve the static build locally
npm run serve
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── components/         # Page-specific components
│   ├── layout.tsx          # Root layout with SEO metadata
│   ├── page.tsx            # Main application page
│   ├── globals.css         # Global styles and theme variables
│   └── sw.ts               # Service worker entry point
├── components/             # Reusable components
│   ├── ExportModal/        # Model export functionality
│   ├── Header/             # App header with theme/language controls
│   ├── JsonEditor/         # Monaco-based JSON editor
│   ├── JsonTree/           # Tree view visualization
│   ├── Toolbar/            # Action toolbar
│   └── ui/                 # Base UI components
├── contexts/               # React contexts (Theme, Language, etc.)
├── hooks/                  # Custom React hooks
├── locales/                # i18n translation files
├── public/                 # Static assets, PWA manifest, icons
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1 |
| Language | TypeScript 5 |
| UI Library | React 19.2 |
| Styling | Tailwind CSS 4 |
| Editor | Monaco Editor |
| Icons | Lucide React |
| PWA | Serwist |
| Image Processing | Sharp |

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build (static export) |
| `npm run serve` | Serve the production build locally |
| `npm run lint` | Run ESLint for code quality |

## 🌐 Supported Languages

| Language | Code | File |
|----------|------|------|
| English | en | `locales/en.json` |
| Türkçe | tr | `locales/tr.json` |
| Deutsch | de | `locales/de.json` |
| Français | fr | `locales/fr.json` |
| Italiano | it | `locales/it.json` |
| 中文 | zh | `locales/zh.json` |

## 🎨 Theming

The application supports multiple color palettes that can be selected via the interactive carousel in the header. Each theme defines a complete color system including:
- Primary and accent colors
- Background and surface colors
- Text and border colors
- Syntax highlighting colors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<p align="center">
  Made with ❤️ using Next.js
</p>
