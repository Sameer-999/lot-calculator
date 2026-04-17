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
      content: "The mathematical formula for position sizing is straightforward: Risk / (Stop Loss * Pip Value). However, the psychological execution of that formula is where most traders fail.\n\nWhen a trader risks too much, the emotional burden of the potential loss often leads to 'revenge trading' or closing winners too early. By calculating your lot size objectively, you remove the guesswork and align your trades with your quantitative edge.\n\nProfessional trading is about longevity. Longevity is a byproduct of math, and math is the antidote to fear."
    },
    {
      id: 2,
      title: "Risk Management in High Volatility Sessions",
      tag: "Strategy",
      date: "Apr 15, 2026",
      excerpt: "Adapting your lot size calculations for NY and London session overlaps where slippage and spreads shift the math.",
      content: "Volatility is a double-edged sword. During session overlaps, the average true range (ATR) of pairs like GBPJPY or EURUSD can spike significantly.\n\nA static 20-pip stop loss might work in the Asian session but is easily hunted in the first hour of London. For SEO-driven strategy, we recommend using Volatility-Adjusted Position Sizing.\n\nIf market volatility doubles, your stop loss distance should likely widen, which in turn means your lot size must decrease to keep your absolute dollar risk the same."
    },
    {
      id: 3,
      title: "AI in Modern Trading Journals",
      tag: "Technology",
      date: "Apr 12, 2026",
      excerpt: "How automated logging and AI pattern recognition are replacing standard spreadsheet journals for professional traders.",
      content: "The era of Excel spreadsheets for trading is coming to an end. Modern tools like Trading Journal AI use advanced pattern matching to show you exactly which setups yield the highest R/R.\n\nBy integrating your position sizing math with an AI-driven journal, you create a feedback loop. You aren't just calculating lot sizes for today; you are building a database of your trading behavior.\n\nStudies show that traders who journal with AI tools reach consistency 3x faster than those who use manual methods."
    },
    {
      id: 4,
      title: "The 1% Rule: The Holy Grail of Longevity",
      tag: "Risk",
      date: "Apr 10, 2026",
      excerpt: "Understanding why professional hedge fund managers rarely risk more than 1% of equity per trade setup.",
      content: "The 1% rule is a simple but profound principle used by professional traders worldwide. It dictates that you never risk more than 1% of your account's total value on any single trade.\n\nWhy 1%? It protects you from the statistical inevitability of a 'losing streak.' Even a streak of 10 losses only reduces your capital by 10%, which is recoverable. If you risk 5% per trade, that same streak would wipe out half your account.\n\nConsistency isn't about giant wins; it's about staying in the game long enough for your edge to manifest."
    },
    {
      id: 5,
      title: "Setting Effective Stop Losses with ATR",
      tag: "Technical",
      date: "Apr 08, 2026",
      excerpt: "Using the Average True Range indicator to set stops that breathe with the market rather than being arbitrary.",
      content: "Arbitrary stop losses—like always using 20 pips—often lead to unnecessary losses. The market's environment changes daily. The Average True Range (ATR) indicator provides a mathematical way to adjust your stops based on current volatility.\n\nA common strategy is using 1.5x to 2x the current ATR value. This ensures your stop is outside the 'noise' of the current session. When volatility is high, your ATR stop will be wider, requiring a smaller lot size to keep your 1% risk intact.\n\nPrecision in stop placement is the first step toward master-level risk management."
    },
    {
      id: 6,
      title: "Trading the News: Scaling Your Position",
      tag: "News",
      date: "Apr 05, 2026",
      excerpt: "How to handle high-impact news releases like NFP and CPI through strategic position sizing and cautious risk.",
      content: "High-impact news events create 'slippage' and 'spread widening.' These two factors can make your stop loss less effective than usual.\n\nWhen trading news, many professionals choose to scale down their position size—often to 0.25% or 0.5% risk. This accounts for the potential of being filled at a worse price than intended. \n\nRemember: In news environments, the market doesn't move in pips; it moves in leaps. Adjusting your lot size down is your primary defense against unexpected price gaps."
    },
    {
      id: 7,
      title: "Drawdown: Understanding the Silent Killer",
      tag: "Management",
      date: "Apr 03, 2026",
      excerpt: "The math of recovery: Why losing 50% of your account requires a 100% gain just to break even again.",
      content: "Risk management is essentially about minimizing drawdown. Drawdown is the peak-to-trough decline during a specific period for an investment. \n\nThe math of loss is non-linear. A 10% loss requires an 11% gain to recover. A 25% loss requires a 33% gain. A 50% loss requires a staggering 100% gain just to get back to where you started.\n\nBy using our Lot Size Calculator for every trade, you ensure that drawdown remains a minor speed bump rather than a career-ending cliff."
    },
    {
      id: 8,
      title: "Confluence Scaling: Increasing Your Edge",
      tag: "Strategy",
      date: "Apr 01, 2026",
      excerpt: "When to risk 0.5% vs 2%. Learning to grade your setups based on technical and fundamental confluence.",
      content: "Not all setups are created equal. A trade with one signal (like a support bounce) is a 'C' setup. A trade with three signals (support, bullish engulfing, and RSI divergence) is an 'A' setup.\n\n'Dynamic Risking' involves adjusting your risk percentage based on the quality of the trade. You might risk 0.5% on 'C' trades and up to 1.5% or 2% on 'A' trades. \n\nBy journaling these confluences in your Trading Journal AI, you can mathematically prove which combinations of signals actually lead to higher profitability."
    },
    {
      id: 9,
      title: "The Compounding Effect in Forex Markets",
      tag: "Finance",
      date: "Mar 28, 2026",
      excerpt: "How small, consistent gains lead to exponential growth through the power of geometric compounding.",
      content: "Compounding is the eighth wonder of the world. In trading, compounding happens when you recalculate your lot size based on your new, higher account balance.\n\nIf you start with $1,000 and grow it by 5% a month, risking 1% per trade, your lot sizes will gradually increase as your equity grows. Over time, this leads to an exponential curve of wealth creation.\n\nThe key is patience. Trying to force compounding by over-leveraging creates the opposite effect: catastrophic loss."
    },
    {
      id: 10,
      title: "Correlation Risk: Pair Selection Strategy",
      tag: "Analysis",
      date: "Mar 25, 2026",
      excerpt: "Why trading EURUSD and GBPUSD simultaneously might double your risk without you realizing it.",
      content: "Diversification in Forex is often a myth. Because the US Dollar is the base or quote for most major pairs, different pairs often move together—this is called Correlation.\n\nIf you buy EURUSD and buy GBPUSD at the same time, you are essentially doubling your risk against the USD. If the USD strengthens, both trades will lose. \n\nTo manage correlation risk, check a correlation matrix before entering multiple positions. Ensure your total open risk across correlated pairs doesn't exceed your maximum total account risk (e.g., 5%)."
    },
    {
      id: 11,
      title: "Backtesting vs. Real-Time Execution",
      tag: "Technical",
      date: "Mar 22, 2026",
      excerpt: "Bridging the gap between a strategy that works on paper and one that works with real money on the line.",
      content: "A strategy that shows 80% win rate in backtesting often drops to 40% in real-time. Why? Because backtesting doesn't account for spread, slippage, and most importantly, human emotion.\n\nThe only way to bridge this gap is through forward-testing with small, calculated lot sizes. Using our calculator during this phase allows you to experience the market's dynamics without risking your entire capital.\n\nOnce your Trading Journal AI shows a consistent equity curve over 50 real-time trades, then you can consider scaling up."
    },
    {
      id: 12,
      title: "Cognitive Biases in Your Trading Journal",
      tag: "Psychology",
      date: "Mar 20, 2026",
      excerpt: "Identifying 'Confirmation Bias' and 'Recency Bias' in your trade logs to improve objective decision-making.",
      content: "Our brains are wired for survival, not for trading. Two major biases destroy traders: Confirmation Bias (only looking for reasons to stay in a trade) and Recency Bias (thinking the next trade will be like the last five).\n\nAn AI-powered journal is the ultimate cure. It doesn't have emotions. It strictly looks at the data of your entries, exits, and lot sizes to tell you the raw truth. \n\nWhen the data says your 'Friday afternoon trades' are always losers, you have to listen to the data, regardless of how you 'feel' about the next setup."
    },
    {
      id: 13,
      title: "Journaling: The Ultimate Performance Engine",
      tag: "Productivity",
      date: "Mar 18, 2026",
      excerpt: "How the simple act of writing down your trades transforms you from a gambler into a professional business owner.",
      content: "Trading is a business, not a hobby. No successful business operates without records. A trading journal is your business's ledger.\n\nBy documenting why you took a trade, the lot size used, and the emotional state you were in, you create a map of your progress. Over months, this map reveals your 'Edge.' \n\nA trader who journals is self-aware. A self-aware trader is a dangerous one in the market."
    },
    {
      id: 14,
      title: "Discipline in Quantitative Trading Environments",
      tag: "Psychology",
      date: "Mar 15, 2026",
      excerpt: "Why staying disciplined with your risk model is more important than finding 'the perfect indicator.'",
      content: "You don't need a 90% win rate to be wealthy. You need a positive expectancy and the discipline to follow your risk model. \n\nDiscipline means using the Lot Size Calculator even when you are on a winning streak and feel 'invincible.' It means taking the stop loss when hit, rather than moving it 'just a few more pips.'\n\nDiscipline is the bridge between goals and accomplishment in the world of financial markets."
    },
    {
      id: 15,
      title: "Leverage vs. Margin: A Detailed Breakdown",
      tag: "Finance",
      date: "Mar 12, 2026",
      excerpt: "Demystifying the technical terms that often lead beginners to over-leverage and blow their accounts.",
      content: "Leverage is a magnifying glass. It makes small price moves into large profits or losses. Margin is the security deposit required by your broker to use that leverage.\n\nHigh leverage (like 1:500) allows you to open large lot sizes with small capital. This is where the danger lies. Beginners often see large leverage as 'more money to play with.' \n\nProfessional traders view leverage as a tool for capital efficiency, always governed by their pre-calculated risk-per-trade. Never use leverage as a substitute for a small account balance."
    },
    {
      id: 16,
      title: "Scaling Out: Managing Your Profit Risk",
      tag: "Strategy",
      date: "Mar 09, 2026",
      excerpt: "When and how to take partial profits to secure your gains while letting your 'runners' catch the big trends.",
      content: "Scaling out is the art of closing part of your position as price moves in your favor. For example, closing 50% of your lots at the 1:1 reward level and moving your stop to break even.\n\nThis creates a 'risk-free' trade. It reduces the stress of holding a winner and ensures that you walk away with profit even if the market reverses. \n\nTrading Journal AI can track your 'Total R/R' vs. your 'Initial R/R' to help you optimize exactly when to scale out for maximum profitability."
    },
    {
      id: 17,
      title: "Identifying High-Quality Setups Automagically",
      tag: "Technology",
      date: "Mar 06, 2026",
      excerpt: "Using AI pattern recognition to identify your personal 'Power Setup' that consistently hits 3:1 reward ratios.",
      content: "Every trader has a 'Power Setup'—a specific set of conditions where they win 70% of the time. For some, it might be the European open breakout; for others, it's the daily support retest.\n\nIdentifying this manually is difficult. AI journals do this automatically by tagging your trades. \n\nOnce discovered, you can focus 100% of your energy and lot size on these high-probability events, effectively 'printing money' by ignoring the low-quality noise."
    },
    {
      id: 18,
      title: "Liquidity and Pips: Session-Based Math",
      tag: "Technical",
      date: "Mar 03, 2026",
      excerpt: "How the choice of session influences spread, slippage, and the overall reliability of your lot size math.",
      content: "The Forex market is open 24/5, but its liquidity isn't constant. The Asian session is often range-bound with higher spreads on crosses. The London and New York sessions offer the highest liquidity and tightest spreads.\n\nYour lot size calculation is only as good as your entry. In low-liquidity environments, you might pay 'hidden costs' through wider spreads. \n\nAlways factor in the session's characteristics. If trading outside major hours, consider widening your stop and reducing your lot size to compensate for the cost of doing business."
    },
    {
      id: 19,
      title: "Profitability: Win Rate vs. Reward Ratio",
      tag: "Analysis",
      date: "Mar 01, 2026",
      excerpt: "Why a 30% win rate can make you a millionaire, provided your reward ratio is consistently above 3:1.",
      content: "Most beginners obsess over win rate. Professionals obsess over Risk-to-Reward (R/R). \n\nIf you win 40% of the time but lose 1 unit on losses and gain 3 units on wins, you are highly profitable. This is the math of 'Expectancy.' \n\nOur integrated R/R Estimator helps you visualize this before you enter. If a setup doesn't offer at least a 2:1 R/R, it's often mathematically better to skip it and wait for a higher-quality opportunity."
    },
    {
      id: 20,
      title: "Protecting Your Capital: Risk Over Profit",
      tag: "Management",
      date: "Feb 26, 2026",
      excerpt: "The fundamental shift in mindset: Thinking like a Risk Manager first and a Trader second.",
      content: "Your final lesson is this: Your job as a trader is not to find winners. Your job is to manage risk. The winners take care of themselves.\n\nWhen you open this Lot Size Calculator, you are performing the most important task of your day. You are deciding how to defend your capital. \n\nIf you protect your downside, the upside will inevitably come. Log every decision, calculate every lot, and join the elite top 5% of traders using Trading Journal AI."
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
