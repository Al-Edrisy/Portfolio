import { ImageResponse } from 'next/og'

// Image metadata
// Image metadata
export const alt = 'Salih Ben Otman - Full Stack Software Developer Portfolio'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Open Graph image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #000000 100%)',
          padding: '60px',
        }}
      >
        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: '25%',
              background: 'linear-gradient(135deg, #ffffff 0%, #e5e5e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 120,
              fontWeight: 'bold',
              color: '#1a1a1a',
              marginBottom: 40,
              boxShadow: '0 20px 60px rgba(255, 255, 255, 0.2)',
            }}
          >
            S
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 20,
              textAlign: 'center',
              background: 'linear-gradient(90deg, #ffffff 0%, #e5e5e5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Salih Ben Otman
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 28,
              color: '#999999',
              textAlign: 'center',
              maxWidth: 900,
            }}
          >
            Full Stack Software Developer | UI/UX Engineer | AI Systems Builder
          </div>

          {/* Tech Stack */}
          <div
            style={{
              display: 'flex',
              gap: 20,
              marginTop: 40,
              fontSize: 20,
              color: '#666666',
            }}
          >
            <div style={{ padding: '10px 20px', background: '#222222', borderRadius: '8px' }}>
              React
            </div>
            <div style={{ padding: '10px 20px', background: '#222222', borderRadius: '8px' }}>
              Next.js
            </div>
            <div style={{ padding: '10px 20px', background: '#222222', borderRadius: '8px' }}>
              TypeScript
            </div>
            <div style={{ padding: '10px 20px', background: '#222222', borderRadius: '8px' }}>
              Node.js
            </div>
            <div style={{ padding: '10px 20px', background: '#222222', borderRadius: '8px' }}>
              AI
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

