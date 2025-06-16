# 🔄 **GUÍA DE MIGRACIÓN API - MT5 Frontend**

## **MAPEO DE ENDPOINTS: OLD vs NEW**

### **🔗 URL Base**
```javascript
// OLD (hardcoded)
'https://62.171.177.212:5000'
'https://62.171.177.212'

// NEW (via environment variable)
process.env.REACT_APP_MT5_API_URL // 'https://your-vps-domain.com'
```

### **📊 ENDPOINTS MIGRADOS**

| Funcionalidad | OLD Endpoint | NEW Endpoint | Método | Autenticación |
|---------------|--------------|--------------|---------|---------------|
| **Account Info** | `GET /api/accounts/{login}` | `GET /accounts/info/{login}` | GET | JWT Bearer |
| **Account History** | `POST /accounts/history` | `POST /accounts/history` | POST | JWT Bearer |
| **Create Account** | `POST /api/accounts` | `POST /accounts/create` | POST | JWT Bearer |
| **Deposit Funds** | `POST /api/accounts/{login}/deposit` | `POST /accounts/deposit` | POST | JWT Bearer |
| **Health Check** | `GET /api/health` | `GET /` | GET | None |
| **Financial Data** | ❌ No existía | `GET /fetch_financial_data` | GET | JWT Bearer |
| **Strategies** | ❌ No existía | `GET /detect_strategies` | GET | JWT Bearer |
| **Account List** | ❌ No existía | `GET /accounts/list` | GET | JWT Bearer |

### **📋 ESTRUCTURA DE RESPUESTA ACTUALIZADA**

#### **Account Info Response**
```javascript
// OLD Format
{
  balance: 10000,
  profit: 500,
  equity: 10500,
  margin: 1000
}

// NEW Format  
{
  login: 12345,
  name: "John Doe",
  email: "john@example.com",
  group: "challenge\\level1",
  leverage: 100,
  balance: 10000.00,
  equity: 10500.00,
  margin: 1000.00,
  free_margin: 9500.00,
  profit: 500.00,
  created: 1642680000,
  last_access: 1642680000,
  status: "active"
}
```

#### **Account History Response**
```javascript
// OLD Format
[{
  ticket: "123456",
  openTime: "2024-01-15T10:00:00Z",
  // ... otros campos
}]

// NEW Format
{
  success: true,
  operations: [{
    ticket: 123456,
    openTime: "2024-01-15T10:00:00Z",
    closeTime: "2024-01-15T11:00:00Z",
    type: "BUY",
    volume: 0.10,
    symbol: "EURUSD",
    openPrice: 1.1050,
    closePrice: 1.1070,
    stopLoss: 1.1030,
    takeProfit: 1.1080,
    profit: 20.00
  }]
}
```

### **🔐 AUTENTICACIÓN ACTUALIZADA**

#### **Token Management**
```javascript
// OLD Method
const token = await currentUser.getIdToken();

// NEW Method (same, but verified)
const token = await currentUser.getIdToken();
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### **🌐 HTTPS CONFIGURATION**

#### **Environment Variables**
```bash
# .env file
REACT_APP_MT5_API_URL=https://your-secure-vps.com
REACT_APP_API_VERSION=v1
REACT_APP_ENVIRONMENT=production
```

#### **Security Headers**
```javascript
const config = {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'include' // For HTTPS with cookies if needed
};
```

### **⚠️ BREAKING CHANGES**

1. **URL Structure**: Removed `/api` prefix from most endpoints
2. **Response Wrapping**: Some responses now wrapped in `{success: true, data: ...}`
3. **Date Formats**: Timestamps now in Unix format instead of ISO strings
4. **Field Names**: Some field names changed (e.g., `Balance` → `balance`)
5. **Error Format**: New standardized error response format

### **🔄 MIGRATION CHECKLIST**

- [ ] Update mt5Service.js with new endpoints
- [ ] Create new API service with HTTPS
- [ ] Update TradingDashboard.jsx data handling
- [ ] Migrate Home.jsx account data fetching
- [ ] Update OperationsHistory.jsx
- [ ] Test all authentication flows
- [ ] Verify HTTPS certificate handling
- [ ] Update error handling for new response formats
- [ ] Add comprehensive logging
- [ ] Update environment variables 