// Gold Signal Pro — Serveur relais
// Recoit les donnees reelles depuis l'EA MT5 (POST /update)
// Les sert a l'application web (GET /data)

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Cle secrete partagee avec l'EA (a changer !)
const API_KEY = process.env.API_KEY || 'gold-signal-secret-2026';

let latestData = {
  connected: false,
  lastUpdate: null,
  symbol: 'XAUUSD',
  price: null,
  candles: [],     // dernieres bougies M1 envoyees par l'EA
  rsi: null,
  macd: null,
  macdSignal: null,
  hma19: null,
  hma38: null,
  hma209: null,
  ema: {},          // {30:.., 35:.., 40:.., 45:.., 50:.., 60:..}
  atr: null,
  broker: null,
  spread: null
};

// --- L'EA MT5 pousse les donnees ici toutes les X secondes ---
app.post('/update', (req, res) => {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const body = req.body || {};
  latestData = {
    connected: true,
    lastUpdate: Date.now(),
    symbol: body.symbol || 'XAUUSD',
    price: body.price,
    candles: body.candles || latestData.candles,
    rsi: body.rsi,
    macd: body.macd,
    macdSignal: body.macdSignal,
    hma19: body.hma19,
    hma38: body.hma38,
    hma209: body.hma209,
    ema: body.ema || {},
    atr: body.atr,
    broker: body.broker,
    spread: body.spread
  };
  res.json({ ok: true });
});

// --- L'app web lit les donnees ici ---
app.get('/data', (req, res) => {
  // Si pas de mise a jour depuis 30s, on considere la connexion EA perdue
  const stale = !latestData.lastUpdate || (Date.now() - latestData.lastUpdate > 30000);
  res.json({ ...latestData, connected: latestData.connected && !stale });
});

app.get('/', (req, res) => {
  res.send('Gold Signal Pro relay server is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gold Signal relay listening on port ${PORT}`));
