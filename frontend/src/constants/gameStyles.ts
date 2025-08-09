import { 
  Activity,
  Target,
  Shield,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';

export const GAME_STYLES = [
  "football total",
  "jeu de possession",
  "jeu positionnel",
  "jeu direct",
  "pressing intense",
  "defensif",
  "gardien",
];

export const POSITIONS = ["FW", "MF", "DF", "GK"];

export const STYLE_COLORS = {
  "football total": "from-violet-500 via-purple-500 to-indigo-600",
  "jeu de possession": "from-cyan-400 via-blue-500 to-indigo-600",
  "jeu positionnel": "from-slate-500 via-gray-600 to-slate-700",
  "jeu direct": "from-red-500 via-pink-500 to-rose-600",
  "pressing intense": "from-amber-400 via-orange-500 to-red-500",
  "defensif": "from-slate-700 via-gray-800 to-black",
  "gardien": "from-emerald-400 via-green-500 to-teal-600",
};

export const STYLE_ICONS = {
  "football total": Activity,
  "jeu de possession": Target,
  "jeu positionnel": Shield,
  "jeu direct": Zap,
  "pressing intense": TrendingUp,
  "defensif": Shield,
  "gardien": Award,
};