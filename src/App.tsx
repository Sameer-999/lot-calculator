/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCcw, 
  Copy, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2,
  DollarSign,
  Percent,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants & Types ---

interface CurrencyPair {
  symbol: string;
  pipValue: number; // Value per 1 lot (100,000 units usually)
  description: string;
}

const CURRENCY_PAIRS: CurrencyPair[] = [
  { symbol: 'EURUSD', pipValue: 10, description: 'Euro / US Dollar' },
  { symbol: 'GBPUSD', pipValue: 10, description: 'British Pound / US Dollar' },
  { symbol: 'USDJPY', pipValue: 9.1, description: 'US Dollar / Japanese Yen' },
  { symbol: 'XAUUSD', pipValue: 100, description: 'Gold / US Dollar' },
  { symbol: 'AUDUSD', pipValue: 10, description: 'Australian Dollar / US Dollar' },
  { symbol: 'USDCAD', pipValue: 7.4, description: 'US Dollar / Canadian Dollar' },
  { symbol: 'USDCHF', pipValue: 11.2, description: 'US Dollar / Swiss Franc' },
];

interface CalculationResults {
  riskAmount: number;
  lotSize: number;
  positionUnits: number;
  pipValueUsed: number;
}

interface Inputs {
  balance: string;
  riskPercent: string;
  stopLoss: string;
  pair: string;
}

// --- Components ---

const InputField = ({ 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  placeholder, 
  type = "number",
  suffix
}: { 
  label: string, 
  icon: any, 
  value: string, 
  onChange: (v: string) => void,
  placeholder?: string,
  type?: string,
  suffix?: string
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] uppercase tracking-[1px] text-editorial-text-secondary font-semibold flex items-center gap-2">
      <Icon size={12} />
      {label} {suffix && `(${suffix})`}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-editorial-surface border border-editorial-border rounded-sm px-3 py-2 outline-hidden focus:border-editorial-accent transition-all text-editorial-text-primary font-editorial-sans"
      />
    </div>
  </div>
);

export default function App() {
  // Inputs State
  const [inputs, setInputs] = useState<Inputs>(() => {
    const saved = localStorage.getItem('forex_cal_inputs');
    return saved ? JSON.parse(saved) : {
      balance: '10000',
      riskPercent: '1.0',
      stopLoss: '20',
      pair: 'EURUSD'
    };
  });

  // Risk/Reward Calculator State
  const [rrInputs, setRrInputs] = useState({ entry: '', sl: '', tp: '' });
  const [rrRatio, setRrRatio] = useState<number | null>(null);

  // Results State
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [copied, setCopied] = useState(false);

  // Blog State
  const [selectedPost, setSelectedPost] = useState<number | null>(null);

  const blogPosts = [
    {
      id: 1,
      title: "The Psychology of Position Sizing",
      tag: "Psychology",
      date: "Apr 17, 2026",
      excerpt: "Why the math behind your lot size is only half the battle. Learn to manage the emotional weight of your trade capital.",
      content: `
        The mathematical formula for position sizing is straightforward: Risk / (Stop Loss * Pip Value). However, the psychological execution of that formula is where most traders fail. 
        
        When a trader risks too much, the emotional burden of the potential loss often leads to "revenge trading" or closing winners too early. By calculating your lot size objectively, you remove the guesswork and align your trades with your quantitative edge. 
        
        Professional trading is about longevity. Longevity is a byproduct of math, and math is the antidote to fear.
      `
    },
    {
      id: 2,
      title: "Risk Management in High Volatility Sessions",
      tag: "Strategy",
      date: "Apr 15, 2026",
      excerpt: "Adapting your lot size calculations for NY and London session overlaps where slippage and spreads shift the math.",
      content: `
        Volatility is a double-edged sword. During session overlaps, the average true range (ATR) of pairs like GBPJPY or EURUSD can spike significantly. 
        
        A static 20-pip stop loss might work in the Asian session but is easily hunted in the first hour of London. For SEO-driven strategy, we recommend using Volatility-Adjusted Position Sizing. 
        
        If market volatility doubles, your stop loss distance should likely widen, which in turn means your lot size must decrease to keep your absolute dollar risk the same.
      `
    },
    {
      id: 3,
      title: "AI in Modern Trading Journals",
      tag: "Technology",
      date: "Apr 12, 2026",
      excerpt: "How automated logging and AI pattern recognition are replacing standard spreadsheet journals for professional traders.",
      content: `
        The era of Excel spreadsheets for trading is coming to an end. Modern tools like Trading Journal AI use advanced pattern matching to show you exactly which setups yield the highest R:R. 
        
        By integrating your position sizing math with an AI-driven journal, you create a feedback loop. You aren't just calculating lot sizes for today; you are building a database of your trading behavior. 
        
        Studies show that traders who journal with AI tools reach consistency 3x faster than those who use manual methods.
      `
    }
  ];

  // Persistence
  useEffect(() => {
    localStorage.setItem('forex_cal_inputs', JSON.stringify(inputs));
  }, [inputs]);

  // Logic
  const calculate = useCallback(() => {
    const balance = parseFloat(inputs.balance);
    const riskPercent = parseFloat(inputs.riskPercent);
    const stopLoss = parseFloat(inputs.stopLoss);
    const pairData = CURRENCY_PAIRS.find(p => p.symbol === inputs.pair);

    if (isNaN(balance) || isNaN(riskPercent) || isNaN(stopLoss) || !pairData || balance <= 0 || riskPercent <= 0 || stopLoss <= 0) {
      setResults(null);
      return;
    }

    const riskAmount = (balance * riskPercent) / 100;
    const lotSize = riskAmount / (stopLoss * pairData.pipValue);
    const positionUnits = Math.round(lotSize * 100000);

    setResults({
      riskAmount,
      lotSize: Math.max(0, Math.round(lotSize * 100) / 100),
      positionUnits,
      pipValueUsed: pairData.pipValue
    });
  }, [inputs]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Risk/Reward Logic
  useEffect(() => {
    const entry = parseFloat(rrInputs.entry);
    const sl = parseFloat(rrInputs.sl);
    const tp = parseFloat(rrInputs.tp);

    if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp)) {
      const risk = Math.abs(entry - sl);
      const reward = Math.abs(entry - tp);
      if (risk !== 0) {
        setRrRatio(Math.round((reward / risk) * 100) / 100);
      } else {
        setRrRatio(null);
      }
    } else {
      setRrRatio(null);
    }
  }, [rrInputs]);

  const handleCopy = () => {
    if (!results) return;
    const text = `Forex Trade Plan:
Currency: ${inputs.pair}
Balance: $${inputs.balance}
Risk: ${inputs.riskPercent}% ($${results.riskAmount})
Stop Loss: ${inputs.stopLoss} pips
Lot Size: ${results.lotSize}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInputs({
      balance: '',
      riskPercent: '',
      stopLoss: '',
      pair: 'EURUSD'
    });
  };

  return (
    <div className="min-h-screen bg-editorial-bg text-editorial-text-primary flex flex-col font-editorial-sans border border-editorial-border selection:bg-editorial-accent selection:text-black">
      
      {/* Editorial Header */}
      <header className="px-10 py-6 border-b border-editorial-border flex justify-between items-baseline sticky top-0 bg-editorial-bg/90 backdrop-blur-sm z-50">
        <div>
          <h1 className="font-serif text-[32px] font-normal tracking-[-0.5px]">
            Position Size <span className="text-editorial-text-secondary">&mdash;</span> Precise
          </h1>
          <div className="text-[11px] uppercase tracking-[2px] text-editorial-text-secondary">Risk Management Terminal</div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-6 mr-6 border-r border-editorial-border pr-6">
            <a href="#calculator" className="text-[10px] uppercase tracking-[2px] text-editorial-text-secondary hover:text-white transition-colors">Terminal</a>
            <a href="#insights" className="text-[10px] uppercase tracking-[2px] text-editorial-text-secondary hover:text-white transition-colors">Market Insights</a>
          </nav>
          <a 
            href="https://sameer-999.github.io/Trading-Journal-AI/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-[2px] text-editorial-accent hover:text-white transition-colors border border-editorial-accent/30 px-4 py-2 rounded-sm"
          >
            Launch Trading Journal &rarr;
          </a>
          <div className="hidden md:block text-[11px] uppercase tracking-[2px] text-editorial-text-secondary">V 1.0.4 &middot; Session Active</div>
        </div>
      </header>

      <main id="calculator" className="grid grid-cols-1 lg:grid-cols-[420px_1fr] border-b border-editorial-border">
        
        {/* Left Side: Inputs */}
        <section className="border-r border-editorial-border p-10 flex flex-col gap-6">
          <div className="space-y-6">
            <InputField 
              label="Account Balance" 
              icon={DollarSign}
              value={inputs.balance}
              onChange={(v) => setInputs({...inputs, balance: v})}
              placeholder="e.g. 10000"
              suffix="USD"
            />
            <InputField 
              label="Risk Percentage" 
              icon={Percent}
              value={inputs.riskPercent}
              onChange={(v) => setInputs({...inputs, riskPercent: v})}
              placeholder="e.g. 1.0"
              suffix="%"
            />
            <InputField 
              label="Stop Loss" 
              icon={ShieldCheck}
              value={inputs.stopLoss}
              onChange={(v) => setInputs({...inputs, stopLoss: v})}
              placeholder="e.g. 20"
              suffix="PIPS"
            />
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[1px] text-editorial-text-secondary font-semibold flex items-center gap-2">
                <Target size={12} /> Instrument Pair
              </label>
              <select 
                value={inputs.pair}
                onChange={(e) => setInputs({...inputs, pair: e.target.value})}
                className="w-full bg-editorial-surface border border-editorial-border rounded-sm px-3 py-2 outline-hidden focus:border-editorial-accent transition-all text-editorial-text-primary font-editorial-sans"
              >
                {CURRENCY_PAIRS.map(p => (
                  <option key={p.symbol} value={p.symbol}>{p.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 space-y-4 pt-10 border-t border-editorial-border">
            <h3 className="text-[10px] uppercase tracking-[1px] text-editorial-text-secondary font-bold flex items-center gap-2">
              <TrendingUp size={12} /> R:R Estimator
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <input 
                placeholder="Entry" 
                value={rrInputs.entry} 
                onChange={(e) => setRrInputs({...rrInputs, entry: e.target.value})}
                className="bg-editorial-surface border border-editorial-border p-2 text-xs rounded-sm outline-hidden focus:border-editorial-accent"
              />
              <input 
                placeholder="SL" 
                value={rrInputs.sl} 
                onChange={(e) => setRrInputs({...rrInputs, sl: e.target.value})}
                className="bg-editorial-surface border border-editorial-border p-2 text-xs rounded-sm outline-hidden focus:border-editorial-accent"
              />
              <input 
                placeholder="TP" 
                value={rrInputs.tp} 
                onChange={(e) => setRrInputs({...rrInputs, tp: e.target.value})}
                className="bg-editorial-surface border border-editorial-border p-2 text-xs rounded-sm outline-hidden focus:border-editorial-accent"
              />
            </div>
            {rrRatio !== null && (
              <div className="text-[10px] text-editorial-accent uppercase tracking-wider font-bold">
                RATIO: {rrRatio}:1
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6">
            <button 
              onClick={handleReset}
              className="flex-1 py-3 border border-editorial-border text-[11px] uppercase tracking-[1px] font-semibold hover:bg-white/5 transition-colors"
            >
              Reset Data
            </button>
            <button 
              onClick={handleCopy}
              className="flex-1 py-3 bg-editorial-accent text-black text-[11px] uppercase tracking-[1px] font-bold hover:opacity-90 transition-colors"
            >
              {copied ? 'Copied' : 'Share Plan'}
            </button>
          </div>
        </section>

        {/* Right Side: Results */}
        <section className="p-10 bg-[radial-gradient(circle_at_top_right,#1a150e,#0f0f0f)] flex flex-col justify-center min-h-[500px]">
          <div className="w-20 h-1 bg-editorial-accent mb-6" />
          
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12"
              >
                <div className="border-t border-editorial-border pt-4">
                  <div className="font-serif italic text-sm text-editorial-text-secondary mb-2 whitespace-nowrap">Capital at Risk</div>
                  <div className="text-[48px] font-light tracking-[-1px] text-editorial-accent font-editorial-sans">
                    ${results.riskAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="border-t border-editorial-border pt-4">
                  <div className="font-serif italic text-sm text-editorial-text-secondary mb-2 whitespace-nowrap">Pip Value (Standard)</div>
                  <div className="text-[48px] font-light tracking-[-1px] text-editorial-accent font-editorial-sans">
                    ${results.pipValueUsed.toFixed(2)}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 border-t border-editorial-border pt-4">
                  <div className="font-serif italic text-sm text-editorial-text-secondary mb-2">Recommended Position Size</div>
                  <div className="text-[72px] font-light tracking-[-2px] text-editorial-accent font-editorial-sans leading-none">
                    {results.lotSize} <span className="text-lg font-sans text-editorial-text-secondary uppercase tracking-wider ml-1">LOTS</span>
                  </div>
                  <div className="mt-4 text-[10px] text-editorial-text-secondary uppercase tracking-[1px] font-medium opacity-50">
                    Units equivalent: <span className="text-editorial-text-primary">{results.positionUnits.toLocaleString()}</span>
                  </div>
                </div>

                {/* Cross-Promotion for Trading Journal */}
                <div className="col-span-1 md:col-span-2 mt-8 p-6 border border-editorial-accent/20 bg-editorial-accent/5 rounded-sm">
                  <h4 className="text-[10px] uppercase tracking-[2px] text-editorial-accent font-bold mb-2">Next Step: Log your Trade</h4>
                  <p className="text-sm text-editorial-text-secondary leading-relaxed mb-4">
                    Maintaining a journal is critical for growth. Record this {inputs.pair} trade in your AI-powered trading journal to track performance and improve your edge.
                  </p>
                  <a 
                    href="https://sameer-999.github.io/Trading-Journal-AI/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block text-[11px] uppercase tracking-[1px] font-bold text-editorial-text-primary hover:text-editorial-accent underline underline-offset-4 transition-all"
                  >
                    Open Trading Journal AI &rarr;
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="text-editorial-text-secondary font-serif italic text-lg opacity-40">
                Awaiting market input configuration...
              </div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Blogs / Insights Section for SEO */}
      <section id="insights" className="max-w-7xl mx-auto px-10 py-24 w-full">
        <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-editorial-border pb-8 mb-16">
          <h2 className="font-serif text-[48px] font-light tracking-[-1px]">Market Insights <span className="text-editorial-text-secondary">&mdash;</span> Strategy</h2>
          <div className="text-[11px] uppercase tracking-[2px] text-editorial-text-secondary">Official Trade Analysis & Education</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {blogPosts.map((post) => (
            <article 
              key={post.id} 
              className="group cursor-pointer"
              onClick={() => setSelectedPost(post.id)}
            >
              <div className="text-[10px] uppercase tracking-[2px] text-editorial-accent font-bold mb-4 flex items-center gap-4">
                {post.tag} <span>&middot;</span> <span className="text-editorial-text-secondary font-medium">{post.date}</span>
              </div>
              <h3 className="font-serif text-2xl mb-4 group-hover:text-editorial-accent transition-colors leading-tight">{post.title}</h3>
              <p className="text-sm text-editorial-text-secondary leading-relaxed mb-6">
                {post.excerpt}
              </p>
              <div className="h-[1px] w-full bg-editorial-border group-hover:bg-editorial-accent transition-colors" />
            </article>
          ))}
        </div>

        <div className="mt-20 p-12 border border-editorial-border text-center bg-editorial-surface/30">
          <h4 className="font-serif text-3xl mb-4 italic">Elevate your trading edge.</h4>
          <p className="text-editorial-text-secondary max-w-2xl mx-auto mb-8">
            The Lot Size Calculator is the first step. The second is consistent journaling. Join thousands of traders using our AI-driven journal to find their profitable patterns.
          </p>
          <a 
            href="https://sameer-999.github.io/Trading-Journal-AI/" 
            className="px-10 py-4 bg-editorial-accent text-black font-bold text-[11px] uppercase tracking-[2px] hover:opacity-90 transition-all inline-block"
          >
            Start Your Journey &rarr;
          </a>
        </div>
      </section>

      {/* Blog Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-editorial-bg border border-editorial-border max-w-2xl w-full max-h-[80vh] overflow-y-auto p-12 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-8 right-8 text-[11px] uppercase tracking-[2px] text-editorial-text-secondary hover:text-editorial-accent transition-colors"
              >
                Close &times;
              </button>
              
              {blogPosts.find(p => p.id === selectedPost) && (
                <>
                  <div className="text-[10px] uppercase tracking-[2px] text-editorial-accent font-bold mb-4">
                    {blogPosts.find(p => p.id === selectedPost)?.tag}
                  </div>
                  <h2 className="font-serif text-4xl mb-8 leading-tight">
                    {blogPosts.find(p => p.id === selectedPost)?.title}
                  </h2>
                  <div className="h-1 w-20 bg-editorial-accent mb-10" />
                  <div className="prose prose-invert prose-sm leading-relaxed text-editorial-text-secondary">
                    {blogPosts.find(p => p.id === selectedPost)?.content.split('\n\n').map((para, i) => (
                      <p key={i} className="mb-6">{para.trim()}</p>
                    ))}
                  </div>
                  <div className="mt-12 pt-10 border-t border-editorial-border">
                    <p className="text-[11px] uppercase tracking-[2px] text-editorial-text-secondary mb-6">Master your execution:</p>
                    <a 
                      href="https://sameer-999.github.io/Trading-Journal-AI/" 
                      className="inline-block py-4 px-8 border border-editorial-accent text-editorial-accent text-[11px] uppercase tracking-[2px] font-bold hover:bg-editorial-accent hover:text-black transition-all"
                    >
                      Log this strategy in AI Journal &rarr;
                    </a>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Disclaimer */}
      <footer className="px-10 py-10 border-t border-editorial-border flex flex-col md:flex-row justify-between gap-6 text-[10px] text-editorial-text-secondary uppercase tracking-[0.5px] bg-black/20">
        <div>&copy; 2026 FINANCIAL UTILITIES CORP. ALL RIGHTS RESERVED.</div>
        <div className="flex gap-8">
          <span>Terms of Analysis</span>
          <span>Risk Policy</span>
          <span>Financial Conduct</span>
        </div>
        <div>MARKET DATA DELAYED 15 MIN. RISK DISCLOSURE: LEVERAGE CARRIES SIGNIFICANT RISK.</div>
      </footer>
    </div>
  );
}
