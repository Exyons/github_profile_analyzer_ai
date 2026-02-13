# GitHub Profile Analyzer AI 🚀

An intelligent, AI-powered tool that analyzes GitHub profiles to provide actionable insights for developers, recruiters, and engineering managers. Built with Next.js and powered by **Ollama** for secure, local AI analysis.

## 📹 Live Demo

>> *[Link to video](https://drive.google.com/file/d/1eklisS9kD8AhTSOazaE-BfZXqX85wI-j/view?usp=sharing)*

---

## ✨ Key Features

### 🔍 Deep Profile Analysis
- **Hiring Score & Recruiters Impressions**: Get a 0-100 hireability score with a breakdown of professionalism, documentation, technical breadth, and code quality.
- **AI-Driven Insights**: Uses Llama 3 (via Ollama) to generate bio improvements, identify top skills, and suggest portfolio enhancements.
- **Resume Compatibility**: Analyzes profile data to suggest how well it matches specific job roles.

### 📈 Growth Roadmap
- **Career Pathing**: Generates a personalized learning roadmap based on current repositories and PR history.
- **Skill Gap Analysis**: Identifies missing skills and suggests open-source contributions to build them.
- **Project Ideas**: Proposes specific project ideas to fill portfolio gaps.

### 📊 Rich Visualizations
- **Language Distribution**: Interactive charts showing coding language proficiency.
- **Commit Activity**: Visual timeline of contribution history.
- **Repository Impact**: "Portfolio Health" analysis separating high-impact repos from clutter.

### 🔒 Secure & Private
- **Local AI First**: Designed to run with a local or private Ollama instance. Your data never leaves your control if you don't want it to.
- **No Database**: Analyses are performed on-the-fly and cached locally in-memory.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) for animations.
- **AI Backend**: [Ollama](https://ollama.com/) (Custom `ai-provider.ts` integration).
- **GitHub API**: Octokit.
- **UI Components**: Lucide React, Sonner (Toasts), Chart.js.

---

## 🚀 Getting Started

### Prerequisites

1.  **Node.js**: Version 18.17 or higher.
2.  **Ollama**: A running instance of Ollama (local or remote).
    *   Download from [ollama.com](https://ollama.com/).
    *   Pull a model: `ollama pull llama3` (or your preferred optimized model).

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/github-profile-analyzer-ai.git
    cd github-profile-analyzer-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Configure Environment Variables**
    Copy the sample configuration file:
    ```bash
    cp .env.sample .env.local
    ```
    
    Edit `.env.local` and add your details:
    ```env
    # Optional: GitHub Token for higher rate limits (highly recommended)
    GITHUB_TOKEN=your_github_token_here

    # Ollama Configuration
    OLLAMA_API_URL=http://localhost:11434/api/generate  # Or your secure server URL
    OLLAMA_MODEL=llama3
    OLLAMA_API_KEY=your_key_if_using_auth_proxy
    ```

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```

5.  **Open the App**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

To run the type checker and build verification:

```bash
npx tsc --noEmit
npm run build
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
