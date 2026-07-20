import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles.css';

const root = createRoot(document.getElementById('root')!);

// FyzLab (sdílení scén, worker) potřebuje CompressionStream/DecompressionStream
// (Safari ≥16.4, Chrome ≥80, Firefox ≥113) — bez nich by appka spadla hluboko
// uvnitř bootstrapu s nesrozumitelnou chybou. Radši čitelná hláška hned.
const isSupported = 'CompressionStream' in window && 'DecompressionStream' in window;

if (isSupported) {
  root.render(<App />);
} else {
  root.render(
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Prohlížeč není podporován
        </h1>
        <p style={{ color: '#475569', maxWidth: '28rem' }}>
          FyzLab potřebuje novější prohlížeč (Chrome/Edge 80+, Safari 16.4+, Firefox 113+).
          Zkuste prohlížeč aktualizovat nebo použít jiné zařízení.
        </p>
      </div>
    </div>,
  );
}
