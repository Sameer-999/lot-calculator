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
    <div className="h-screen bg-editorial-bg text-editorial-text-primary flex flex-col font-editorial-sans overflow-hidden border border-editorial-border">
      
      {/* Editorial Header */}
      <header className="px-10 py-6 border-b border-editorial-border flex justify-between items-baseline">
        <div>
          <h1 className="font-serif text-[32px] font-normal tracking-[-0.5px]">
            Position Size <span className="text-editorial-text-secondary">&mdash;</span> Precise
          </h1>
          <div className="text-[11px] uppercase tracking-[2px] text-editorial-text-secondary">Risk Management Terminal</div>
        </div>
        <div className="text-[11px] uppercase tracking-[2px] text-editorial-text-secondary">V 1.0.4 &middot; Session Active</div>
      </header>

      <main className="flex-1 grid grid-cols-[420px_1fr]">
        
        {/* Left Side: Inputs */}
        <section className="border-r border-editorial-border p-10 flex flex-col gap-6 overflow-y-auto">
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

          <div className="mt-auto space-y-4 pt-10 border-t border-editorial-border">
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
        <section className="p-10 bg-[radial-gradient(circle_at_top_right,#1a150e,#0f0f0f)] flex flex-col justify-center">
          <div className="w-20 h-1 bg-editorial-accent mb-6" />
          
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-2 gap-x-10 gap-y-12"
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

                <div className="col-span-2 border-t border-editorial-border pt-4">
                  <div className="font-serif italic text-sm text-editorial-text-secondary mb-2">Recommended Position Size</div>
                  <div className="text-[72px] font-light tracking-[-2px] text-editorial-accent font-editorial-sans leading-none">
                    {results.lotSize} <span className="text-lg font-sans text-editorial-text-secondary uppercase tracking-wider ml-1">LOTS</span>
                  </div>
                  <div className="mt-4 text-[10px] text-editorial-text-secondary uppercase tracking-[1px] font-medium opacity-50">
                    Units equivalent: <span className="text-editorial-text-primary">{results.positionUnits.toLocaleString()}</span>
                  </div>
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

      {/* Footer Disclaimer */}
      <footer className="px-10 py-5 border-t border-editorial-border flex justify-between text-[10px] text-editorial-text-secondary uppercase tracking-[0.5px]">
        <div>&copy; 2026 FINANCIAL UTILITIES CORP. ALL RIGHTS RESERVED.</div>
        <div>MARKET DATA DELAYED 15 MIN. RISK DISCLOSURE: LEVERAGE CARRIES SIGNIFICANT RISK.</div>
      </footer>
    </div>
  );
}
