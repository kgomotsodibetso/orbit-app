'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Scan, Keyboard, Camera, X, ArrowCounterClockwise } from '@phosphor-icons/react';
import Button from '@/components/ui/Button';

interface ISBNScannerProps {
  onScan: (isbn: string) => void;
  placeholder?: string;
}

type Mode = 'hid' | 'camera' | 'manual';
type CameraState = 'idle' | 'starting' | 'active' | 'error';

interface BarcodeDet {
  detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]>;
}

export default function ISBNScanner({
  onScan,
  placeholder = 'Scan barcode or type ISBN…',
}: ISBNScannerProps) {
  const [mode, setMode] = useState<Mode>('hid');
  const [manualValue, setManualValue] = useState('');
  const [buffer, setBuffer] = useState('');
  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [cameraError, setCameraError] = useState('');
  const [lastScanned, setLastScanned] = useState('');

  const inputRef    = useRef<HTMLInputElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDet | null>(null);
  const rafRef      = useRef<number>(0);
  const runningRef  = useRef(false);
  const lastDetectedRef  = useRef('');
  const consecutiveRef   = useRef({ code: '', count: 0 });

  // ── HID barcode scanner ───────────────────────────────────────────────────
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

      if (gap < 50 && /^\d$/.test(e.key)) {
        localBuffer += e.key;
      } else if (gap >= 50) {
        localBuffer = /^\d$/.test(e.key) ? e.key : '';
      }

      setBuffer(localBuffer);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, onScan]);

  // ── Camera / BarcodeDetector ──────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    lastDetectedRef.current = '';
    consecutiveRef.current = { code: '', count: 0 };
    setCameraState('idle');
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera not supported. This requires HTTPS. Use Manual mode instead.');
      setCameraState('error');
      return;
    }

    setCameraState('starting');
    setCameraError('');
    lastDetectedRef.current = '';
    consecutiveRef.current = { code: '', count: 0 };
    runningRef.current = true;

    try {
      // Resolve detector once — native BarcodeDetector on Chrome/Edge/Android,
      // WASM polyfill on Firefox/Safari
      if (!detectorRef.current) {
        if ('BarcodeDetector' in window) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          detectorRef.current = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8'],
          }) as BarcodeDet;
        } else {
          const { BarcodeDetector: Polyfill } = await import('barcode-detector/pure');
          detectorRef.current = new Polyfill({
            formats: ['ean_13', 'ean_8'],
          }) as unknown as BarcodeDet;
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      setCameraState('active');

      const detectLoop = async () => {
        if (!runningRef.current || !detectorRef.current || !videoRef.current) return;

        if (videoRef.current.readyState >= 2) {
          try {
            const results = await detectorRef.current.detect(videoRef.current);
            for (const { rawValue: code } of results) {
              if (!/^\d{13}$/.test(code) && !/^\d{8}$/.test(code)) continue;
              if (code.length === 13 && !code.startsWith('978') && !code.startsWith('979')) continue;

              // EAN-13 check digit
              if (code.length === 13) {
                const sum = code
                  .slice(0, 12)
                  .split('')
                  .reduce((acc, d, i) => acc + parseInt(d) * (i % 2 === 0 ? 1 : 3), 0);
                if ((10 - (sum % 10)) % 10 !== parseInt(code[12])) continue;
              }

              // Require 2 consecutive reads before accepting
              const cons = consecutiveRef.current;
              if (cons.code === code) cons.count += 1;
              else { cons.code = code; cons.count = 1; }
              if (cons.count < 2) continue;

              // Debounce — ignore same code for 3 s after a successful scan
              if (code === lastDetectedRef.current) continue;

              lastDetectedRef.current = code;
              consecutiveRef.current = { code: '', count: 0 };
              const isbn13 = code.length === 13 ? code : code.padStart(13, '0');
              stopCamera();
              setLastScanned(isbn13);
              onScan(isbn13);
              setTimeout(() => { lastDetectedRef.current = ''; }, 3000);
              return;
            }
          } catch { /* frame not yet decodable — skip */ }
        }

        if (runningRef.current) rafRef.current = requestAnimationFrame(detectLoop);
      };

      rafRef.current = requestAnimationFrame(detectLoop);
    } catch (err) {
      runningRef.current = false;
      const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
      setCameraError(
        msg.includes('permission') || msg.includes('denied') || msg.includes('notallowed')
          ? 'Camera permission denied. Please allow camera access and try again.'
          : 'Could not start camera. Try Manual mode instead.'
      );
      setCameraState('error');
    }
  }, [onScan, stopCamera]);

  // Stop camera when switching away from camera mode
  useEffect(() => {
    if (mode !== 'camera') stopCamera();
  }, [mode, stopCamera]);

  // Cleanup on unmount
  useEffect(() => () => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const switchMode = (m: Mode) => {
    setMode(m);
    setBuffer('');
    if (m === 'manual') setTimeout(() => inputRef.current?.focus(), 50);
  };

  // ── Manual submit ─────────────────────────────────────────────────────────
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = manualValue.replace(/\D/g, '');
    if (digits.length >= 10) {
      onScan(digits.length === 13 ? digits : digits.padStart(13, '0'));
      setManualValue('');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border-2 border-dashed border-steel/30 p-6 bg-steel/5">
      {/* Mode tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {([
          { key: 'hid'    as const, icon: Scan,     label: 'Scanner' },
          { key: 'camera' as const, icon: Camera,   label: 'Camera'  },
          { key: 'manual' as const, icon: Keyboard, label: 'Manual'  },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => switchMode(key)}
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mode === key
                ? 'btn-primary'
                : 'bg-white text-slate/60 border border-slate/20 hover:border-steel/40'
            }`}
          >
            <Icon weight="light" className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── HID mode ────────────────────────────────────────────────────── */}
      {mode === 'hid' && (
        <div className="text-center py-4">
          <div className="relative w-48 h-24 mx-auto mb-4 rounded-xl overflow-hidden bg-slate/5 border border-steel/20">
            <div className="absolute left-0 right-0 h-0.5 bg-steel/70 shadow-[0_0_8px_2px_rgba(75,142,186,0.5)] scan-line" />
            <Scan weight="light" className="w-8 h-8 text-steel/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm font-medium text-slate/60">
            {buffer ? (
              <span className="text-steel font-mono text-lg tracking-widest">{buffer}</span>
            ) : (
              'Point USB barcode scanner at the ISBN…'
            )}
          </p>
          {buffer && (
            <button
              type="button"
              onClick={() => setBuffer('')}
              className="mt-2 text-xs text-slate/40 hover:text-slate flex items-center gap-1 mx-auto"
            >
              <X weight="light" className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      )}

      {/* ── Camera mode ─────────────────────────────────────────────────── */}
      {mode === 'camera' && (
        <div>
          <div
            className={`relative w-full rounded-xl overflow-hidden bg-black ${cameraState === 'active' ? 'block' : 'hidden'}`}
            style={{ height: 240 }}
          >
            {/* Native <video> element — no Quagga canvas injection */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {/* Aim guide overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-4/5 h-16 border-2 border-steel/70 rounded relative">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-px h-0.5 bg-steel/80 shadow-[0_0_6px_2px_rgba(75,142,186,0.6)] scan-line" />
              </div>
            </div>
          </div>

          {cameraState === 'active' && (
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-xs text-slate/50">Centre the ISBN barcode in the middle strip</p>
              <button
                type="button"
                onClick={stopCamera}
                className="text-xs text-slate/40 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <X weight="light" className="w-3 h-3" /> Stop
              </button>
            </div>
          )}

          {cameraState === 'idle' && (
            <div className="text-center py-4">
              <Camera weight="light" className="w-10 h-10 text-steel/30 mx-auto mb-3" />
              {lastScanned && (
                <p className="text-xs text-green-600 font-semibold mb-2">
                  ✓ Scanned {lastScanned}
                </p>
              )}
              <p className="text-sm text-slate/60 mb-3">
                {lastScanned
                  ? 'Tap to scan another barcode'
                  : 'Use your phone camera to scan the ISBN barcode'}
              </p>
              <Button type="button" onClick={startCamera} size="sm">
                <Camera weight="light" className="w-3.5 h-3.5 mr-1.5" />
                {lastScanned ? 'Scan Again' : 'Start Camera'}
              </Button>
            </div>
          )}

          {cameraState === 'starting' && (
            <div className="text-center py-6">
              <span className="w-5 h-5 border-2 border-steel/30 border-t-steel rounded-full animate-spin inline-block mb-2" />
              <p className="text-sm text-slate/60">Starting camera…</p>
            </div>
          )}

          {cameraState === 'error' && (
            <div className="text-center py-4">
              <p className="text-sm text-red-500 mb-3">{cameraError}</p>
              <Button type="button" variant="secondary" onClick={startCamera} size="sm">
                <ArrowCounterClockwise weight="light" className="w-3.5 h-3.5 mr-1.5" />
                Try Again
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Manual mode ─────────────────────────────────────────────────── */}
      {mode === 'manual' && (
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
