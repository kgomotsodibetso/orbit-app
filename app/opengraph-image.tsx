import { ImageResponse } from 'next/og';

export const alt = 'Orbit Tech · Mission Control';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          background: '#2C3A47',
          padding: '72px 80px',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #4B8EBA, #A29FEC)',
          }}
        />

        {/* Logo mark — simplified ring */}
        <div
          style={{
            position: 'absolute',
            top: '64px',
            left: '80px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: '4px solid #4B8EBA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#4B8EBA',
            }}
          />
        </div>

        {/* Wordmark */}
        <div
          style={{
            position: 'absolute',
            top: '72px',
            left: '156px',
            fontSize: '28px',
            fontWeight: 800,
            color: '#F0E5DF',
            letterSpacing: '-0.5px',
          }}
        >
          Orbit Tech
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 900,
            color: '#F0E5DF',
            lineHeight: 1.05,
            letterSpacing: '-2px',
            marginBottom: '24px',
          }}
        >
          Library management
          <br />
          <span style={{ color: '#4B8EBA' }}>built for schools.</span>
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: '28px',
            color: 'rgba(240,229,223,0.6)',
            fontWeight: 400,
          }}
        >
          Scan, track, and inspire readers — South Africa
        </div>
      </div>
    ),
    { ...size }
  );
}
