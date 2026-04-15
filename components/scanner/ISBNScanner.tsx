'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ScanLine, Keyboard, Camera, X, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ISBNScannerProps {
  onScan: (isbn: string) => void;
  placeholder?: string;
}

type Mode = 'hid' | 'camera' | 'manual';
type CameraState = 'idle' | 'starting' | 'active' | 'error';

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

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quaggaRef = useRef<any>(null);
  const lastDetectedRef = useRef('');

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

  // ── Camera / Quagga2 ──────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (quaggaRef.current) {
      try { quaggaRef.current.stop(); } catch { /* ignore */ }
      quaggaRef.current = null;
    }
    lastDetectedRef.current = '';
    setCameraState('idle');
  }, []);

  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;

    // Stop any existing instance first
    if (quaggaRef.current) {
      try { quaggaRef.current.stop(); } catch { /* ignore */ }
      quaggaRef.current = null;
    }

    // Camera requires HTTPS (or localhost)
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera not supported. This requires HTTPS. Use Manual mode instead.');
      setCameraState('error');
      return;
    }

    setCameraState('starting');
    setCameraError('');
    lastDetectedRef.current = '';

    try {
      const Quagga = (await import('@ericblade/quagga2')).default;

      await new Promise<void>((resolve, reject) => {
        Quagga.init(
          {
            inputStream: {
              type: 'LiveStream',
              target: videoRef.current!,
              constraints: {
                facingMode: 'environment',
                width: { ideal: 640 },
                height: { ideal: 480 },
              },
              // Crop to a narrow horizontal strip where the barcode will be
              area: {
                top: '25%',
                right: '0%',
                left: '0%',
                bottom: '25%',
              },
            },
            // Process at most 15 frames/sec — reduces CPU without missing scans
            frequency: 15,
            decoder: {
              readers: ['ean_reader', 'ean_8_reader'],
            },
            // locate: false skips the expensive frame-wide barcode search.
            // The user just needs to centre the barcode in the frame.
            locate: false,
            numOfWorkers: 0, // avoids Next.js worker bundling issues
          },
          (err: unknown) => {
            if (err) reject(err instanceof Error ? err : new Error(String(err)));
            else resolve();
          }
        );
      });

      quaggaRef.current = Quagga;
      Quagga.start();
      setCameraState('active');

      Quagga.onDetected((result: { codeResult?: { code?: string | null } }) => {
        const code = result.codeResult?.code;
        if (!code) return;
        // Accept EAN-13 (books) and EAN-8 (older editions)
        if (!/^\d{8}$/.test(code) && !/^\d{13}$/.test(code)) return;
        // Debounce — ignore same code within 3 s
        if (code === lastDetectedRef.current) return;

        lastDetectedRef.current = code;
        const isbn13 = code.length === 13 ? code : code.padStart(13, '0');

        try { Quagga.stop(); } catch { /* ignore */ }
        quaggaRef.current = null;
        setCameraState('idle');
        setLastScanned(isbn13);
        onScan(isbn13);

        setTimeout(() => { lastDetectedRef.current = ''; }, 3000);
      });
    } catch (err) {
      const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
      setCameraError(
        msg.includes('permission') || msg.includes('denied') || msg.includes('notallowed')
          ? 'Camera permission denied. Please allow camera access and try again.'
          : 'Could not start camera. Try Manual mode instead.'
      );
      setCameraState('error');
    }
  }, [onScan]);

  // Stop camera when switching away
  useEffect(() => {
    if (mode !== 'camera') stopCamera();
  }, [mode, stopCamera]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (quaggaRef.current) {
      try { quaggaRef.current.stop(); } catch { /* ignore */ }
    }
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
          { key: 'hid' as const, icon: ScanLine, label: 'Scanner' },
          { key: 'camera' as const, icon: Camera, label: 'Camera' },
          { key: 'manual' as const, icon: Keyboard, label: 'Manual' },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => switchMode(key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === key
                ? 'bg-steel text-white'
                : 'bg-white text-slate/60 border border-slate/20 hover:border-steel/40'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── HID mode ────────────────────────────────────────────────────── */}
      {mode === 'hid' && (
        <div className="text-center py-4">
          <div className="relative w-48 h-24 mx-auto mb-4 rounded-xl overflow-hidden bg-slate/5 border border-steel/20">
            <div
              className="absolute left-0 right-0 h-0.5 bg-steel/70 shadow-[0_0_8px_2px_rgba(75,142,186,0.5)] scan-line"
            />
            <ScanLine className="w-8 h-8 text-steel/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
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
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      )}

      {/* ── Camera mode ─────────────────────────────────────────────────── */}
      {mode === 'camera' && (
        <div>
          {/*
            Quagga injects <video> + <canvas> elements into this div.
            Always keep it in the DOM when in camera mode so Quagga can target it.
            Hide canvases — we just want the clean video feed on mobile.
          */}
          <div className={`relative w-full rounded-xl overflow-hidden bg-black ${cameraState === 'active' ? 'block' : 'hidden'}`} style={{ height: 240 }}>
            <div
              ref={videoRef}
              className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_canvas]:hidden"
            />
            {/* Aim guide — matches the 25%/25% crop area */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-0 right-0" style={{ top: '25%', bottom: '25%' }}>
                <div className="absolute inset-0 border-2 border-steel/70 rounded" />
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
                <X className="w-3 h-3" /> Stop
              </button>
            </div>
          )}

          {cameraState === 'idle' && (
            <div className="text-center py-4">
              <Camera className="w-10 h-10 text-steel/30 mx-auto mb-3" />
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
                <Camera className="w-3.5 h-3.5 mr-1.5" />
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
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
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
