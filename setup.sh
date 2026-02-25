#!/bin/bash
# SkillSmith — One-command setup for a new machine
# Usage: ./setup.sh

set -e

echo "🔧 SkillSmith Setup"
echo "──────────────────────────────"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Installing via Homebrew..."
  if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew first..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  brew install node
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required (found v$(node -v)). Run: brew upgrade node"
  exit 1
fi
echo "✅ Node.js $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local if missing
if [ ! -f .env.local ]; then
  echo ""
  echo "⚙️  Creating .env.local — you'll need your API keys:"
  echo ""

  cat > .env.local << 'ENVEOF'
# Supabase (hosted instance)
NEXT_PUBLIC_SUPABASE_URL=https://ptxhkvblqizemgfsidqf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eGhrdmJscWl6ZW1nZnNpZHFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NDM3NDEsImV4cCI6MjA4NzMxOTc0MX0.F7V3BEIbqsRIgB9U2X4FYUj1Yn0kKwiUVrWgiElj7-8

# GitHub Models API (get a token at https://github.com/settings/tokens)
GITHUB_TOKEN=your_github_pat_here
AI_MODEL=gpt-4.1
ENVEOF

  echo "📝 Created .env.local with Supabase credentials pre-filled."
  echo "   → Edit .env.local and replace 'your_github_pat_here' with your GitHub PAT"
  echo "   → Token needs NO special scopes — just a fine-grained PAT with default permissions"
else
  echo "✅ .env.local already exists"
fi

echo ""
echo "──────────────────────────────"
echo "✅ Setup complete!"
echo ""
echo "To start developing:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000"
