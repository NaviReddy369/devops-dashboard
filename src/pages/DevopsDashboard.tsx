import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Sparkles, Heart, TrendingUp, Users, Briefcase, Star, Moon, Sun } from 'lucide-react';

interface FormData {
  fullName: string;
  birthDate: string;
}

interface LifePathInfo {
  trait: string;
  desc: string;
  strengths: string[];
  challenges: string[];
}

interface Results {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  lifePathInfo: LifePathInfo;
  name: string;
  date: string;
}

const DevopsDashboard = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    birthDate: ''
  });
  const [results, setResults] = useState<Results | null>(null);

  const calculateLifePath = (dateStr: string): number => {
    const date = new Date(dateStr);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    const reduceToSingle = (num: number): number => {
      while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
        num = num.toString().split('').reduce((sum: number, digit: string) => sum + parseInt(digit), 0);
      }
      return num;
    };

    day = reduceToSingle(day);
    month = reduceToSingle(month);
    year = reduceToSingle(year);

    let lifePath = day + month + year;
    return reduceToSingle(lifePath);
  };

  const calculateExpression = (name: string): number => {
    const letterValues: { [key: string]: number } = {
      a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
      j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
      s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8
    };

    const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
    let sum = 0;
    
    for (let char of cleanName) {
      sum += letterValues[char] || 0;
    }

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum;
  };

  const calculateSoulUrge = (name: string): number => {
    const vowels = 'aeiou';
    const letterValues: { [key: string]: number } = {
      a: 1, e: 5, i: 9, o: 6, u: 3
    };

    const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
    let sum = 0;
    
    for (let char of cleanName) {
      if (vowels.includes(char)) {
        sum += letterValues[char] || 0;
      }
    }

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum;
  };

  const calculatePersonality = (name: string): number => {
    const vowels = 'aeiou';
    const letterValues: { [key: string]: number } = {
      b: 2, c: 3, d: 4, f: 6, g: 7, h: 8,
      j: 1, k: 2, l: 3, m: 4, n: 5, p: 7, q: 8, r: 9,
      s: 1, t: 2, v: 4, w: 5, x: 6, y: 7, z: 8
    };

    const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
    let sum = 0;
    
    for (let char of cleanName) {
      if (!vowels.includes(char)) {
        sum += letterValues[char] || 0;
      }
    }

    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    }

    return sum;
  };

  const getNumberMeaning = (num: number, type: 'lifePath'): LifePathInfo => {
    const meanings: { [key: string]: { [key: number]: LifePathInfo } } = {
      lifePath: {
        1: { trait: "Leader", desc: "Independent, ambitious, and innovative. Natural born leaders who pave their own path.", strengths: ["Leadership", "Innovation", "Determination"], challenges: ["Ego", "Stubbornness", "Impatience"] },
        2: { trait: "Peacemaker", desc: "Diplomatic, cooperative, and sensitive. Excel at creating harmony and partnerships.", strengths: ["Diplomacy", "Cooperation", "Intuition"], challenges: ["Over-sensitivity", "Indecisiveness", "Dependency"] },
        3: { trait: "Creative", desc: "Expressive, artistic, and social. Natural communicators with creative flair.", strengths: ["Creativity", "Communication", "Optimism"], challenges: ["Scattered Energy", "Superficiality", "Self-doubt"] },
        4: { trait: "Builder", desc: "Practical, disciplined, and hardworking. Master builders who create lasting foundations.", strengths: ["Discipline", "Organization", "Reliability"], challenges: ["Rigidity", "Stubbornness", "Limited Vision"] },
        5: { trait: "Adventurer", desc: "Freedom-loving, versatile, and progressive. Seekers of experience and change.", strengths: ["Adaptability", "Freedom", "Resourcefulness"], challenges: ["Restlessness", "Irresponsibility", "Inconsistency"] },
        6: { trait: "Nurturer", desc: "Responsible, caring, and protective. Natural caregivers focused on home and family.", strengths: ["Compassion", "Responsibility", "Harmony"], challenges: ["Worry", "Self-righteousness", "Interference"] },
        7: { trait: "Seeker", desc: "Analytical, spiritual, and introspective. Deep thinkers seeking truth and wisdom.", strengths: ["Analysis", "Spirituality", "Wisdom"], challenges: ["Isolation", "Skepticism", "Secrecy"] },
        8: { trait: "Powerhouse", desc: "Ambitious, authoritative, and material-focused. Natural executives and achievers.", strengths: ["Ambition", "Authority", "Efficiency"], challenges: ["Materialism", "Workaholism", "Domination"] },
        9: { trait: "Humanitarian", desc: "Compassionate, idealistic, and generous. Old souls with universal love.", strengths: ["Compassion", "Idealism", "Generosity"], challenges: ["Martyrdom", "Disconnection", "Escapism"] },
        11: { trait: "Illuminator", desc: "Intuitive, inspirational, and idealistic. Master number with spiritual insights.", strengths: ["Intuition", "Inspiration", "Vision"], challenges: ["Nervousness", "Impracticality", "Overwhelm"] },
        22: { trait: "Master Builder", desc: "Visionary, practical, and powerful. Can turn dreams into reality on a grand scale.", strengths: ["Vision", "Manifestation", "Leadership"], challenges: ["Pressure", "Self-doubt", "Burnout"] }
      }
    };

    return meanings[type][num] || meanings[type][1] || { trait: "Unknown", desc: "", strengths: [], challenges: [] };
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.birthDate) {
      alert('Please fill in all fields');
      return;
    }

    const lifePath = calculateLifePath(formData.birthDate);
    const expression = calculateExpression(formData.fullName);
    const soulUrge = calculateSoulUrge(formData.fullName);
    const personality = calculatePersonality(formData.fullName);

    const lifePathInfo = getNumberMeaning(lifePath, 'lifePath');

    setResults({
      lifePath,
      expression,
      soulUrge,
      personality,
      lifePathInfo,
      name: formData.fullName,
      date: formData.birthDate
    });
  };

  const COLORS = ['#a855f7', '#ec4899', '#8b5cf6', '#d946ef'];

  const coreNumbersData = results ? [
    { name: 'Life Path', value: results.lifePath, color: '#a855f7' },
    { name: 'Expression', value: results.expression, color: '#ec4899' },
    { name: 'Soul Urge', value: results.soulUrge, color: '#8b5cf6' },
    { name: 'Personality', value: results.personality, color: '#d946ef' }
  ] : [];

  const personalityTraits = results ? [
    { trait: 'Leadership', value: results.lifePath * 10 },
    { trait: 'Creativity', value: results.expression * 9 },
    { trait: 'Intuition', value: results.soulUrge * 11 },
    { trait: 'Communication', value: results.personality * 8 },
    { trait: 'Ambition', value: (results.lifePath + results.expression) * 5 }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-12 h-12 text-purple-300 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Numerology Insights
            </h1>
            <Moon className="w-12 h-12 text-pink-300 animate-pulse" />
          </div>
          <p className="text-purple-200 text-lg">Discover the hidden meanings in your name and birth date</p>
        </div>

        {/* Input Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-300/30 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-purple-200 mb-2 font-medium">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Enter your full name"
                  className="w-full px-6 py-4 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white placeholder-purple-300/50 text-lg"
                />
              </div>
              
              <div>
                <label className="block text-purple-200 mb-2 font-medium">Date of Birth</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  className="w-full px-6 py-4 rounded-xl bg-white/5 border border-purple-300/30 focus:border-purple-400 focus:outline-none text-white text-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Calculate My Numbers
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-8 animate-fade-in">
            {/* Main Life Path */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-300/30 shadow-2xl">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Your Life Path Number</h2>
                <div className="text-8xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent my-6">
                  {results.lifePath}
                </div>
                <div className="text-2xl text-purple-200 mb-4">"{results.lifePathInfo.trait}"</div>
                <p className="text-lg text-purple-100 max-w-2xl mx-auto">{results.lifePathInfo.desc}</p>
              </div>
            </div>

            {/* Core Numbers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/30">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-6 h-6 text-purple-300" />
                  <h3 className="text-xl font-semibold">Expression Number</h3>
                </div>
                <div className="text-5xl font-bold text-purple-300 mb-2">{results.expression}</div>
                <p className="text-purple-200">Your natural talents and abilities</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-pink-300/30">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-6 h-6 text-pink-300" />
                  <h3 className="text-xl font-semibold">Soul Urge Number</h3>
                </div>
                <div className="text-5xl font-bold text-pink-300 mb-2">{results.soulUrge}</div>
                <p className="text-pink-200">Your inner desires and motivations</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-indigo-300/30">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-6 h-6 text-indigo-300" />
                  <h3 className="text-xl font-semibold">Personality Number</h3>
                </div>
                <div className="text-5xl font-bold text-indigo-300 mb-2">{results.personality}</div>
                <p className="text-indigo-200">How others perceive you</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/30">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-yellow-300" />
                  Core Numbers Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={coreNumbersData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {coreNumbersData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-300/30">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-300" />
                  Personality Traits
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={personalityTraits}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="trait" stroke="#e9d5ff" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#e9d5ff" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" fill="#a855f7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strengths & Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-500/20 backdrop-blur-lg rounded-xl p-6 border border-green-300/30">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-green-300" />
                  Your Strengths
                </h3>
                <ul className="space-y-3">
                  {results.lifePathInfo.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                      <span className="text-lg">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-500/20 backdrop-blur-lg rounded-xl p-6 border border-orange-300/30">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-orange-300" />
                  Growth Areas
                </h3>
                <ul className="space-y-3">
                  {results.lifePathInfo.challenges.map((challenge, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                      <span className="text-lg">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-lg rounded-xl p-8 border border-purple-300/30 text-center">
              <h3 className="text-3xl font-bold mb-3">Want Your Full Numerology Report?</h3>
              <p className="text-purple-100 mb-6 text-lg max-w-2xl mx-auto">
                Get detailed insights about your destiny number, karmic lessons, life cycles, and personalized guidance for love, career, and life purpose.
              </p>
              <button className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/50">
                Get Full Report ($19.99)
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!results && (
          <div className="text-center py-16">
            <Sparkles className="w-24 h-24 text-purple-300 mx-auto mb-6 opacity-50 animate-pulse" />
            <h3 className="text-3xl font-semibold mb-3 text-purple-200">Unlock Your Cosmic Blueprint</h3>
            <p className="text-purple-300 text-lg">Enter your details above to discover your numerological profile</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevopsDashboard;


