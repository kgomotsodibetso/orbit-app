'use client';

import { useState, useEffect, useRef } from 'react';
import { ScanLine, Keyboard, X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ISBNScannerProps {
  onScan: (isbn: string) => void;
  placeholder?: string;
}

export default function ISBNScanner({ onScan, placeholder = 'Scan barcode or type ISBN…' }: ISBNScannerProps) {
  const [mode, setMode] = useState<'hid' | 'manual'>('hid');
  const [manualValue, setManualValue] = useState('');
  const [buffer, setBuffer] = useState('');
  const [lastKey, setLastKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // HID barcode scanner: listens for rapid keystrokes ending with Enter
  useEffect(() => {
    if (mode !== 'hid') return;

    let localBuffer = '';
    let lastTimestamp = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const gap = now - lastTimestamp;
      lastTimestamp = now;

      if (e.key === 'Enter') {
        if (localBuffer.length >= 10 && /^\d+$/.test(localBuffer)) {
          const isbn = localBuffer.length === 13 ? localBuffer : localBuffer.padStart(13, '0');
          onScan(isbn);
        }
        localBuffer = '';
        return;
      }

      // HID scanners type very fast (<30ms between keys)
      if (gap < 50 && /^\d$/.test(e.key)) {
        localBuffer += e.key;
      } else if (gap >= 50) {
        localBuffer = /^\d$/.test(e.key) ? e.key : '';
      }

      setBuffer(localBuffer);
      setLastKey(now);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, onScan]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = manualValue.replace(/\D/g, '');
    if (digits.length >= 10) {
      onScan(digits.length === 13 ? digits : digits.padStart(13, '0'));
      setManualValue('');
    }
  };

  return (
    <div className="rounded-2xl border-2 border-dashed border-steel/30 p-6 bg-steel/5">
      {/* Mode toggle */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setMode('hid')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mode === 'hid' ? 'bg-steel text-white' : 'bg-white text-slate/60 border border-slate/20'
          }`}
        >
          <ScanLine className="w-3.5 h-3.5" />
          Scanner
        </button>
        <button
          onClick={() => { setMode('manual'); setTimeout(() => inputRef.current?.focus(), 50); }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mode === 'manual' ? 'bg-steel text-white' : 'bg-white text-slate/60 border border-slate/20'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" />
          Manual
        </button>
      </div>

      {mode === 'hid' ? (
        <div className="text-center py-4">
          {/* Animated scan line */}
          <div className="relative w-48 h-24 mx-auto mb-4 rounded-xl overflow-hidden bg-slate/5 border border-steel/20">
            <div
              className="absolute left-0 right-0 h-0.5 bg-steel/70 shadow-[0_0_8px_2px_rgba(75,142,186,0.5)] scan-line"
              style={{ position: 'absolute' }}
            />
            <ScanLine className="w-8 h-8 text-steel/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm font-medium text-slate/60">
            {buffer ? (
              <span className="text-steel font-mono text-lg tracking-widest">{buffer}</span>
            ) : (
              'Point barcode scanner at the ISBN…'
            )}
          </p>
          {buffer && (
            <button onClick={() => setBuffer('')} className="mt-2 text-xs text-slate/40 hover:text-slate flex items-center gap-1 mx-auto">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value.replace(/\D/g, '').slice(0, 13))}
            placeholder={placeholder}
            maxLength={13}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate/20 bg-white text-sm font-mono text-slate focus:outline-none focus:ring-2 focus:ring-steel"
          />
          <Button type="submit" disabled={manualValue.replace(/\D/g, '').length < 10}>
            Look Up
          </Button>
        </form>
      )}
    </div>
  );
}
