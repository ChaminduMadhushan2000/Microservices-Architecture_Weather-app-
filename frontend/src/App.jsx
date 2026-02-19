import { useState, useEffect, useRef } from 'react';
import './App.css';

/* ── helpers ────────────────────────────────────────────── */

const QUICK_CITIES = ['Colombo', 'Kandy', 'Galle', 'London', 'Tokyo', 'New York'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function conditionIcon(text = '') {
  const t = text.toLowerCase();
  if (t.includes('clear') || t.includes('sunny')) return '☀️';
  if (t.includes('partly')) return '⛅';
  if (t.includes('cloud') || t.includes('overcast')) return '☁️';
  if (t.includes('rain') || t.includes('drizzle')) return '🌧️';
  if (t.includes('thunder') || t.includes('storm')) return '⛈️';
  if (t.includes('snow') || t.includes('sleet')) return '❄️';
  if (t.includes('fog') || t.includes('mist') || t.includes('haze')) return '🌫️';
  if (t.includes('wind')) return '💨';
  return '🌤️';
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ── component ──────────────────────────────────────────── */

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [displayedCity, setDisplayedCity] = useState('');
  const [fetchedAt, setFetchedAt] = useState('');
  const [cardVisible, setCardVisible] = useState(false);
  const inputRef = useRef(null);

  /* auto-focus on mount */
  useEffect(() => { inputRef.current?.focus(); }, []);

  const fetchWeather = async (searchCity) => {
    const q = (searchCity ?? city).trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setWeather(null);
    setDisplayedCity('');
    setCardVisible(false);

    try {
      const locRes = await fetch(`http://localhost:8080/api/location?city=${q}`);
      if (!locRes.ok) throw new Error(`City "${q}" not found`);
      const loc = await locRes.json();

      const wxRes = await fetch(`http://localhost:8080/api/weather?lat=${loc.lat}&lon=${loc.lon}`);
      const wx = await wxRes.json();

      setWeather(wx);
      setDisplayedCity(loc.city);
      setFetchedAt(formatTime());

      /* trigger entrance animation on next frame */
      requestAnimationFrame(() => setCardVisible(true));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const pickCity = (name) => {
    setCity(name);
    fetchWeather(name);
  };

  return (
    <div className="shell">
      {/* floating ambient blobs */}
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <div className="blob blob-3" aria-hidden="true" />

      <main className="glass-panel">
        {/* ── hero ─────────────────────────── */}
        <header className="hero">
          <span className="badge">LIVE METEOROLOGY</span>
          <h1>{getGreeting()},<br />check the&nbsp;sky.</h1>
          <p className="subtitle">
            Real-time weather insights — powered by <strong>ChaminduCode</strong>
          </p>
        </header>

        {/* ── search ───────────────────────── */}
        <div className="search-row">
          <div className="search-field">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search any city…"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchWeather()}
            />
            {city && (
              <button className="clear-btn" onClick={() => { setCity(''); inputRef.current?.focus(); }} type="button" aria-label="Clear">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          <button className="fetch-btn" onClick={() => fetchWeather()} disabled={loading} type="button">
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <span>Get Weather</span>
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* ── quick picks ──────────────────── */}
        <div className="chips">
          {QUICK_CITIES.map((c) => (
            <button key={c} className={`chip ${city === c ? 'chip-active' : ''}`} onClick={() => pickCity(c)} type="button">
              {c}
            </button>
          ))}
        </div>

        {/* ── error ────────────────────────── */}
        {error && (
          <div className="alert">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ── loading skeleton ─────────────── */}
        {loading && (
          <div className="skeleton-card">
            <div className="skel skel-line w60" />
            <div className="skel skel-big" />
            <div className="skel-row">
              <div className="skel skel-box" />
              <div className="skel skel-box" />
              <div className="skel skel-box" />
            </div>
          </div>
        )}

        {/* ── weather card ─────────────────── */}
        {weather && (
          <section className={`wx-card ${cardVisible ? 'wx-card-in' : ''}`} aria-live="polite">
            <div className="wx-header">
              <div className="wx-location">
                <p className="wx-label">Current weather</p>
                <h2>{displayedCity}</h2>
              </div>
              <div className="live-dot">
                <span className="dot-ping" />
                <span className="dot-core" />
                <span className="live-text">Live</span>
              </div>
            </div>

            <div className="wx-hero-row">
              <span className="wx-emoji">{conditionIcon(weather.condition)}</span>
              <div>
                <span className="wx-temp">{weather.temperature}</span>
                <p className="wx-condition">{weather.condition}</p>
              </div>
            </div>

            <div className="wx-details">
              <div className="detail-tile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <p className="detail-label">Wind</p>
                <p className="detail-value">{weather.wind_speed}</p>
              </div>
              <div className="detail-tile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <p className="detail-label">Feels like</p>
                <p className="detail-value">{weather.feels_like ?? '—'}</p>
              </div>
              <div className="detail-tile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <p className="detail-label">Humidity</p>
                <p className="detail-value">{weather.humidity ?? '—'}</p>
              </div>
            </div>

            <p className="wx-updated">Updated at {fetchedAt}</p>
          </section>
        )}

        {/* ── placeholder ──────────────────── */}
        {!weather && !loading && !error && (
          <div className="empty-state">
            <span className="empty-icon">🌍</span>
            <p>Search or tap a city above to see a live forecast card.</p>
          </div>
        )}

        {/* ── footer ───────────────────────── */}
        <footer className="foot">
          <span>Built with microservices</span>
          <span className="foot-dot">·</span>
          <span>ChaminduCode</span>
        </footer>
      </main>
    </div>
  );
}

export default App;