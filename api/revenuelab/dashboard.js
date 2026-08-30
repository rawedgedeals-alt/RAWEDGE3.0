const TOKEN_URL = 'https://aff.revenuelab.biz/api/v1/user-service/get-token/api';
const EARNINGS_URL = 'https://aff.revenuelab.biz/publisher/finance/earnings/by-traffic-source';

function send(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.end(JSON.stringify(body));
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '');
}

function authHeader(prefix, token) {
  return `${prefix} ${token}`;
}

async function getToken() {
  const username = process.env.REVENUELAB_USERNAME;
  const password = process.env.REVENUELAB_PASSWORD;
  if (!username || !password) throw new Error('RevenueLab credentials are not configured.');

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id_token) {
    throw new Error(`RevenueLab token request failed (${response.status}).`);
  }
  return data.id_token;
}

async function getEarnings(token, startOfPeriod, endOfPeriod, currency) {
  const body = {
    startOfPeriod,
    endOfPeriod,
    isShowZero: false,
    totalsCurrency: currency,
    responseCurrency: currency
  };

  const response = await fetch(EARNINGS_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authHeader(process.env.REVENUELAB_EARNINGS_AUTH_PREFIX || 'Bearer', token)
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`RevenueLab earnings request failed (${response.status}).`);
  return data;
}

async function getStats(token, dateFrom, dateTo, currency, groupBy) {
  const base = process.env.REVENUELAB_STATS_URL;
  if (!base) return null;

  const url = new URL(base);
  url.searchParams.set('dateFrom', dateFrom);
  url.searchParams.set('dateTo', dateTo);
  url.searchParams.set('currency', currency);
  url.searchParams.set('groupBy', groupBy);
  url.searchParams.set('sources', 'yes');
  url.searchParams.set('withFullSources', 'yes');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authHeader(process.env.REVENUELAB_STATS_AUTH_PREFIX || 'id_token', token)
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`RevenueLab statistics request failed (${response.status}).`);
  return data;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed.' });

  const adminKey = process.env.RAWEDGE_ADMIN_KEY;
  if (adminKey && req.headers['x-rawedge-admin-key'] !== adminKey) {
    return send(res, 401, { error: 'Unauthorized.' });
  }

  const now = new Date();
  const defaultTo = now.toISOString().slice(0, 10);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const defaultFrom = monthStart.toISOString().slice(0, 10);

  const dateFrom = req.query?.dateFrom || defaultFrom;
  const dateTo = req.query?.dateTo || defaultTo;
  const currency = String(req.query?.currency || 'USD').toUpperCase();
  const groupBy = req.query?.groupBy === 'M' ? 'M' : 'D';

  if (!validDate(dateFrom) || !validDate(dateTo)) {
    return send(res, 400, { error: 'dateFrom and dateTo must use YYYY-MM-DD.' });
  }

  try {
    // RevenueLab allows a maximum of 3 requests/second. This request uses:
    // 1 token call + 1 reconciled earnings call + 1 optional statistics call.
    const token = await getToken();
    const earnings = await getEarnings(token, dateFrom, dateTo, currency);
    const statistics = await getStats(token, dateFrom, dateTo, currency, groupBy);

    return send(res, 200, {
      source: 'RevenueLab',
      generatedAt: new Date().toISOString(),
      dateFrom,
      dateTo,
      currency,
      groupBy,
      statistics,
      earnings
    });
  } catch (error) {
    console.error('RevenueLab integration error:', error);
    return send(res, 502, { error: error.message || 'RevenueLab request failed.' });
  }
};
