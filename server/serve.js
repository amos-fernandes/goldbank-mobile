const http = require('http');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.private' });

const {
  ASAAS_API_KEY,
  ASAAS_BASE_URL,
  ASAAS_WALLET_ID,
  ENCRYPTION_KEY,
  PORT = 8081
} = process.env;

const asaas = axios.create({
  baseURL: ASAAS_BASE_URL,
  headers: {
    'access_token': ASAAS_API_KEY,
    'Content-Type': 'application/json'
  }
});

const db = { users: [], transactions: [] };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  console.log(`[REQ] ${req.method} ${pathname}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      if (pathname === '/api/auth/register') {
        const payload = JSON.parse(body);
        console.log('[ASAAS] Registrando:', payload.email);
        
        try {
          const asaasCustomer = await asaas.post('/customers', {
            name: payload.name,
            email: payload.email,
            cpfCnpj: payload.cpfCnpj,
            mobilePhone: payload.phone,
            notificationDisabled: true
          });

          const newUser = {
            id: asaasCustomer.data.id,
            name: payload.name,
            email: payload.email,
            asaasStatus: 'ACTIVE',
            walletId: ASAAS_WALLET_ID,
            token: 'jwt_mock_' + Date.now()
          };
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newUser));
        } catch (err) {
          console.error('[ASAAS ERROR]', err.response?.data || err.message);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.response?.data?.errors?.[0]?.description || 'Erro no Asaas' }));
        }
      } 
      else if (pathname === '/api/auth/login') {
        const payload = JSON.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          id: 'cus_mock',
          name: 'Usuário Teste',
          email: payload.email,
          asaasStatus: 'ACTIVE',
          walletId: ASAAS_WALLET_ID,
          token: 'jwt_mock'
        }));
      }
      else if (pathname === '/api/pix/deposit') {
        const payload = JSON.parse(body);
        console.log('[PIX] Solicitando:', payload.amount, 'para cliente:', payload.customerId);
        
        try {
          const payment = await asaas.post('/payments', {
            customer: payload.customerId || 'cus_default_123',
            billingType: 'PIX',
            value: payload.amount,
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            description: payload.description || 'Depósito GoldBank'
          });
          
          console.log('[PIX] Pagamento criado ID:', payment.data.id);

          const qrCode = await asaas.get(`/payments/${payment.data.id}/pixQrCode`);
          console.log('[PIX] QR Code gerado com sucesso');

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            qrCodeBase64: qrCode.data.encodedImage,
            qrCodePayload: qrCode.data.payload,
            value: payment.data.value,
            chargeId: payment.data.id
          }));
        } catch (err) {
          console.error('[PIX ERROR]', err.response?.data || err.message);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: err.response?.data?.errors?.[0]?.description || 'Erro ao gerar PIX no Asaas' 
          }));
        }
      }
      else if (pathname === '/api/wallet/balance') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ balance: 0, availableBalance: 0, totalTransferValue: 0 }));
      }
      else if (pathname === '/api/dashboard/summary') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ totalBalanceBRL: 0, bankBalanceBRL: 0, cryptoBalanceBRL: 0, accountsCount: 1, monthlyInflow: 0, monthlyOutflow: 0 }));
      }
      else if (pathname === '/api/crypto/mb/prices') {
        try {
          const mbRes = await axios.get('https://www.mercadobitcoin.net/api/BTC/ticker/');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([{
            coin: 'BTC',
            last: parseFloat(mbRes.data.ticker.last),
            open: parseFloat(mbRes.data.ticker.open)
          }]));
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([{ coin: 'BTC', last: 350000, open: 345000 }]));
        }
      }
      else if (pathname === '/api/crypto/binance/prices') {
        try {
          const bRes = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([{ symbol: 'BTCUSDT', price: parseFloat(bRes.data.price) }]));
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([{ symbol: 'BTCUSDT', price: 65000 }]));
        }
      }
      else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } catch (e) {
      console.error('[SERVER ERR]', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Error' }));
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`💎 Backend Production Ativo na porta ${PORT} 💎`);
});
