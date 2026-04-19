import React, { useState, useEffect, useRef } from 'react';
import { Brain, Lightbulb, Target, MessageSquare, Puzzle, Scale, AlertCircle, GitBranch, Edit3, MessageCircle, Star } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import InputField from '../../components/UI/InputField';
import { Loader2 } from 'lucide-react';

const BASE_URL = 'http://localhost:3000';

const getToken = () => localStorage.getItem('token');

const apiGet = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

const apiPost = async (path, body) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
};

const TYPE_MAP = {
  'daily-question': 'DAILY_BRAIN_QUESTION',
  'case-study':     'CASE_STUDY',
  'why-how':        'WHY_HOW_QUESTION',
  'debate':         'DEBATE_CORNER',
  'puzzle':         'PUZZLE_LOGIC',
  'compare':        'COMPARE_ANALYZE',
  'mistake':        'MISTAKE_FINDER',
  'decision':       'DECISION_SCENARIO',
  'reflection':     'REFLECTION',
  'ai-feedback':    null,
};

const CriticalThinking = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState({});
  const [userInputs, setUserInputs] = useState({});
  const [questions, setQuestions] = useState({});
  const [stats, setStats] = useState({ total: 0, avgScore: null });
  const [dailyQuestion, setDailyQuestion] = useState(null);
  const pollRefs = useRef({});

  const sections = [
    {
      id: 'daily-question',
      title: 'Daily Brain Question',
      desc: 'Challenge your thinking with one profound question per day',
      icon: Brain,
      content: 'What if gravity worked in reverse? How would society adapt?',
      inputPlaceholder: 'Your deep thought...',
    },
    {
      id: 'case-study',
      title: 'Case Study Challenges',
      desc: 'Real-world scenarios requiring strategic analysis',
      icon: Target,
      content: 'Tech startup losing 30% market share in 6 months.',
      inputPlaceholder: 'Your analysis...',
    },
    {
      id: 'why-how',
      title: 'Why/How Questions',
      desc: 'Dig deeper with fundamental questioning techniques',
      icon: Lightbulb,
      content: "Why do successful companies fail? How can you prevent it?",
      inputPlaceholder: 'Your insights...',
    },
    {
      id: 'debate',
      title: 'Debate Corner',
      desc: 'Practice structured argumentation',
      icon: MessageSquare,
      content: 'AI will replace 50% of jobs in 10 years - Debate both sides',
      inputPlaceholder: 'Your position...',
    },
    {
      id: 'puzzle',
      title: 'Puzzle & Logic Games',
      desc: 'Sharpen pattern recognition and logical reasoning',
      icon: Puzzle,
      content: '3 houses, 3 utilities - classic puzzle (no crossing lines)',
      inputPlaceholder: 'Your solution...',
    },
    {
      id: 'compare',
      title: 'Compare & Analyze',
      desc: 'Develop comparative analysis skills',
      icon: Scale,
      content: 'Compare Tesla vs Ford innovation strategies (2000-2024)',
      inputPlaceholder: 'Key differences...',
    },
    {
      id: 'mistake',
      title: 'Mistake Finder',
      desc: 'Spot logical fallacies and errors',
      icon: AlertCircle,
      content: "Everyone loves it → Must be good (find fallacy)",
      inputPlaceholder: 'Identified errors...',
    },
    {
      id: 'decision',
      title: 'Decision Scenarios',
      desc: 'Practice decision matrix thinking',
      icon: GitBranch,
      content: '$1M budget: Product dev, marketing, or hiring?',
      inputPlaceholder: 'Your decision + reasoning...',
    },
    {
      id: 'reflection',
      title: 'Reflection Box',
      desc: 'Daily meta-cognition practice',
      icon: Edit3,
      content: 'What did you learn today that changed your perspective?',
      inputPlaceholder: 'Your reflection...',
    },
    {
      id: 'ai-feedback',
      title: 'AI Feedback',
      desc: 'Get instant critical analysis',
      icon: MessageCircle,
      content: 'Submit any answer for structured feedback',
      inputPlaceholder: 'Enter your answer/response...',
    },
  ];

  useEffect(() => {
    loadDailyQuestion();
    loadAllQuestions();
    loadStats();
    return () => {
      Object.values(pollRefs.current).forEach(clearInterval);
    };
  }, []);

  const loadDailyQuestion = async () => {
    try {
      const res = await apiGet('/api/critical-thinking/daily');
      if (res.success && res.data) setDailyQuestion(res.data);
    } catch (_) {}
  };

  const loadAllQuestions = async () => {
    const fetched = {};
    await Promise.all(
      sections.map(async (section) => {
        try {
          const type = TYPE_MAP[section.id];
          const path = type
            ? `/api/critical-thinking?type=${type}&limit=1`
            : `/api/critical-thinking?limit=1`;
          const res = await apiGet(path);
          if (res.success && res.data?.length > 0) {
            fetched[section.id] = res.data[0];
          }
        } catch (_) {}
      })
    );
    setQuestions(fetched);
  };

  const loadStats = async () => {
    try {
      const res = await apiGet('/api/critical-thinking/my-responses?limit=100');
      if (res.success) {
        const total = res.pagination?.total || 0;
        const scores = (res.data || [])
          .map((r) => r.aiScore)
          .filter((s) => typeof s === 'number');
        const avg = scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null;
        setStats({ total, avgScore: avg });
      }
    } catch (_) {}
  };

  const startPolling = (sectionId, responseId) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await apiGet(`/api/critical-thinking/my-responses/${responseId}`);
        if (res.success && res.data?.aiFeedback) {
          clearInterval(interval);
          delete pollRefs.current[sectionId];

          let fb;
          try {
            fb = typeof res.data.aiFeedback === 'string'
              ? JSON.parse(res.data.aiFeedback)
              : res.data.aiFeedback;
          } catch {
            fb = { score: null, summary: res.data.aiFeedback || 'No feedback available' };
          }

          const parts = [
            fb.score != null ? `Score: ${fb.score}/100.` : '',
            fb.summary || '',
            fb.strengths?.length ? `Strengths: ${fb.strengths.join(', ')}.` : '',
            fb.improvements?.length ? `To improve: ${fb.improvements.join(', ')}.` : '',
            fb.deeperThinking ? `Deeper question: ${fb.deeperThinking}` : '',
          ].filter(Boolean);

          setResponses((prev) => ({ ...prev, [sectionId]: parts.join(' ') }));
          setLoading(false);
          loadStats();
        }
      } catch (_) {}

      if (attempts >= 20) {
        clearInterval(interval);
        delete pollRefs.current[sectionId];
        setResponses((prev) => ({
          ...prev,
          [sectionId]: 'AI feedback is taking longer than expected. Please check My Responses later.',
        }));
        setLoading(false);
      }
    }, 2000);

    pollRefs.current[sectionId] = interval;
  };

  const handleSubmit = async (sectionId) => {
    const userAnswer = userInputs[sectionId]?.trim();
    if (!userAnswer) return;

    const question =
      sectionId === 'daily-question' && dailyQuestion
        ? dailyQuestion
        : questions[sectionId];

    if (!question) {
      setResponses((prev) => ({
        ...prev,
        [sectionId]: 'No question available from server right now. Please try again later.',
      }));
      return;
    }

    setLoading(true);
    setActiveCard(sectionId);

    try {
      const res = await apiPost(`/api/critical-thinking/${question.id}/submit`, {
        userAnswer,
      });

      if (!res.success) {
        setResponses((prev) => ({
          ...prev,
          [sectionId]: `Error: ${res.message || 'Submission failed'}`,
        }));
        setLoading(false);
        setActiveCard(null);
        return;
      }

      const responseId = res.data?.id;
      if (responseId) {
        startPolling(sectionId, responseId);
      } else {
        setResponses((prev) => ({
          ...prev,
          [sectionId]: 'Answer submitted! AI feedback will appear shortly.',
        }));
        setLoading(false);
        setActiveCard(null);
      }
    } catch (_) {
      setResponses((prev) => ({
        ...prev,
        [sectionId]: 'Network error. Please check your connection.',
      }));
      setLoading(false);
      setActiveCard(null);
    }
  };

  const handleTryAnother = async (sectionId) => {
    if (pollRefs.current[sectionId]) {
      clearInterval(pollRefs.current[sectionId]);
      delete pollRefs.current[sectionId];
    }
    setResponses((prev) => { const n = { ...prev }; delete n[sectionId]; return n; });
    setUserInputs((prev) => { const n = { ...prev }; delete n[sectionId]; return n; });

    try {
      const type = TYPE_MAP[sectionId];
      const res = await apiGet(
        type
          ? `/api/critical-thinking?type=${type}&limit=5`
          : `/api/critical-thinking?limit=5`
      );
      if (res.success && res.data?.length > 0) {
        const pick = res.data[Math.floor(Math.random() * res.data.length)];
        setQuestions((prev) => ({ ...prev, [sectionId]: pick }));
      }
    } catch (_) {}
  };

  const getContent = (section) => {
    if (section.id === 'daily-question' && dailyQuestion) {
      return dailyQuestion.description || dailyQuestion.content || section.content;
    }
    const q = questions[section.id];
    if (q) return q.description || q.content || section.content;
    return section.content;
  };

  const statsBar = [
    {
      label: 'Challenges',
      value: stats.total > 0 ? String(stats.total) : '10',
      icon: Target,
      color: 'bg-blue-500',
    },
    { label: 'Active Streak', value: '7 days', icon: Star, color: 'bg-yellow-500' },
    {
      label: 'Avg Score',
      value: stats.avgScore != null ? `${stats.avgScore}%` : '87%',
      icon: Brain,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl shadow-2xl">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent mb-3">
              Critical Thinking
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl">
              Sharpen your mind with daily challenges, AI feedback, and structured thinking exercises
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {statsBar.map((stat, i) => (
            <Card key={i} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-white/80 to-slate-50/50 backdrop-blur-sm">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-slate-600 font-medium">{stat.label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {sections.map((section) => {
          const Icon = section.icon;
          const hasResponse = responses[section.id];
          const isThisLoading = loading && activeCard === section.id;

          return (
            <Card
              key={section.id}
              className="group relative overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer border-0 hover:border-teal-200/50 backdrop-blur-sm hover:bg-white/90"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative p-8 h-full flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${
                    section.id.includes('ai')
                      ? 'from-purple-500/10 border-purple-200/50'
                      : 'from-teal-500/10 border-teal-200/50'
                  } group-hover:scale-110 transition-all duration-300`}>
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">{section.title}</h3>
                <p className="text-slate-600 mb-6 flex-1 min-h-[100px]">{getContent(section)}</p>

                {hasResponse ? (
                  <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200/50 rounded-2xl p-6 mb-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 mb-2">
                          <Star className="w-4 h-4" />
                          AI Feedback
                        </div>
                        <p className="text-sm text-slate-800 leading-relaxed">
                          {responses[section.id]}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <InputField
                    placeholder={section.inputPlaceholder}
                    value={userInputs[section.id] || ''}
                    onChange={(e) =>
                      setUserInputs(prev => ({ ...prev, [section.id]: e.target.value }))
                    }
                    className="mb-4"
                  />
                )}

                <Button
                  variant="primary"
                  size="large"
                  onClick={(e) => {
                    e.stopPropagation();
                    hasResponse
                      ? handleTryAnother(section.id)
                      : handleSubmit(section.id);
                  }}
                  className="w-full group-hover:shadow-xl hover:shadow-teal-500/25 transition-all duration-300 font-semibold"
                  disabled={
                    isThisLoading ||
                    !!pollRefs.current[section.id] ||
                    (!hasResponse && !userInputs[section.id]?.trim())
                  }
                >
                  {isThisLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : hasResponse ? (
                    'Try Another'
                  ) : (
                    'Get AI Feedback →'
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CriticalThinking;