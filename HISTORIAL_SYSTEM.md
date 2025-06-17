# 📊 Sistema de Historial Automático de Balances y KPIs

## 🎯 **Descripción General**

El Sistema de Historial Automático te permite **crear un registro histórico completo** cada vez que se actualiza el balance de una cuenta. Cada actualización genera un "snapshot" con todos los KPIs calculados automáticamente.

### **✨ Características Principales:**

- ✅ **Historial automático** en cada actualización de balance
- ✅ **KPIs calculados automáticamente** (Daily Loss, Global Loss, Profit Target, etc.)
- ✅ **Gráficos temporales reales** basados en datos históricos
- ✅ **Análisis de tendencias** y performance
- ✅ **Sistema de alertas** basado en límites
- ✅ **Integración fácil** con componentes existentes

---

## 🏗️ **Arquitectura del Sistema**

### **Colección Principal: `accountHistory`**
```javascript
{
  // Referencias
  accountId: "ABC123",           // ID del documento en tradingAccounts
  userId: "user_xyz",            // ID del usuario propietario
  timestamp: serverTimestamp(),  // Momento exacto del snapshot
  snapshotDate: "2024-01-15",   // Fecha del snapshot (YYYY-MM-DD)
  
  // Datos del balance
  balanceActual: 95987.8,        // Balance actual de la cuenta
  challengeAmountNumber: 100000, // Balance inicial del challenge
  
  // KPIs calculados automáticamente
  totalProfit: -4012.2,          // Ganancia/pérdida total
  profitPercentage: -4.01,       // Porcentaje de ganancia/pérdida
  dailyDrawdown: 2500,           // Drawdown diario
  totalDrawdown: 4012.2,         // Drawdown total
  drawdownPercentage: 4.01,      // Porcentaje de drawdown
  
  // Límites y objetivos
  dailyLossLimit: 5000,          // Límite de pérdida diaria (5%)
  globalLossLimit: 10000,        // Límite de pérdida global (10%)
  profitTarget: 10000,           // Objetivo de ganancia (10%)
  allowedLossToday: 2500,        // Pérdida restante permitida hoy
  allowedLossTotal: 5987.8,      // Pérdida restante permitida total
  
  // Estado de objetivos (booleanos)
  dailyLossExceeded: false,      // ¿Se excedió el límite diario?
  globalLossExceeded: false,     // ¿Se excedió el límite global?
  profitTargetReached: false,    // ¿Se alcanzó el objetivo?
  minimumTradingDaysReached: false, // ¿Se alcanzó el mínimo de días?
  
  // Metadatos
  challengePhase: "1 FASE",      // Fase del challenge
  challengeType: "one_step",     // Tipo de challenge
  status: "Activa",              // Estado de la cuenta
  updateSource: "manual",        // Fuente de actualización
  updateReason: "balance_update" // Razón de la actualización
}
```

---

## 🚀 **Uso Básico**

### **1. Actualizar Balance con Historial**
```javascript
import { updateBalanceWithHistory } from '../utils/historyUtils';

// Actualizar balance y crear historial automáticamente
const result = await updateBalanceWithHistory(
  'account_id_123',     // ID de la cuenta
  98500,                // Nuevo balance
  'mt5_sync'           // Fuente de actualización
);

console.log('✅ Balance actualizado:', result);
// Automáticamente:
// 1. Actualiza tradingAccounts.balanceActual = 98500
// 2. Crea snapshot en accountHistory con todos los KPIs
// 3. Calcula Daily Loss, Global Loss, Profit Target, etc.
```

### **2. Crear Snapshot Manual**
```javascript
import { createBalanceSnapshot } from '../utils/historyUtils';

// Crear snapshot sin actualizar el documento principal
const historyId = await createBalanceSnapshot('account_id_123', {
  balanceActual: 97000,
  updateSource: 'manual_test',
  updateReason: 'testing_system'
});

console.log('📊 Snapshot creado:', historyId);
```

---

## 🎨 **Integración con Componentes React**

### **Hook Personalizado: `useAccountHistory`**
```javascript
import { useAccountHistory } from '../examples/HistoryExamples';

function TradingDashboard({ accountId }) {
  const { history, loading, updateBalance } = useAccountHistory(accountId);
  
  const handleBalanceUpdate = async () => {
    const success = await updateBalance(99000, 'manual_ui');
    if (success) {
      alert('✅ Balance actualizado correctamente');
    }
  };
  
  return (
    <div>
      <h3>Historial: {history.length} snapshots</h3>
      {history.map(snapshot => (
        <div key={snapshot.id}>
          {snapshot.snapshotDate}: {snapshot.balanceActual}
        </div>
      ))}
      
      <button onClick={handleBalanceUpdate}>
        Actualizar Balance
      </button>
    </div>
  );
}
```

### **Integración en TradingDashboard**
```javascript
// El sistema ya está integrado en TradingDashboard.jsx
// Automáticamente:
// 1. Carga el historial al abrir una cuenta
// 2. Genera gráficos desde datos históricos reales
// 3. Muestra indicador de cantidad de snapshots
// 4. Incluye botón de prueba en desarrollo
```

---

## 📈 **Gráficos y Visualización**

### **Gráficos Automáticos**
El sistema genera automáticamente gráficos de balance usando datos históricos:

```javascript
// Vista diaria (últimos 30 días)
const dailyData = history.map(snapshot => ({
  name: `Day ${new Date(snapshot.snapshotDate).getDate()}`,
  value: snapshot.balanceActual
}));

// Vista mensual (últimos 12 meses)
const monthlyData = groupByMonth(history).map(group => ({
  name: group.monthName,
  value: group.latestBalance
}));
```

### **Indicadores Visuales**
- 🟢 **Verde**: Datos históricos disponibles
- 🔵 **Azul**: Gráfico con datos reales
- ⚪ **Gris**: Sin datos históricos (placeholder)
- 📊 **Badge**: Contador de snapshots históricos

---

## 🔧 **Configuración de Límites**

### **Límites por Fase del Challenge**
```javascript
// 1 FASE (One Step)
{
  dailyLossLimit: initialBalance * 0.05,    // 5% pérdida diaria
  maxLossLimit: initialBalance * 0.10,      // 10% pérdida total
  profitTarget: initialBalance * 0.10,      // 10% ganancia objetivo
  minimumTradingDays: 5
}

// 2 FASE (Two Step) 
{
  dailyLossLimit: initialBalance * 0.05,    // 5% pérdida diaria
  maxLossLimit: initialBalance * 0.10,      // 10% pérdida total
  profitTarget: initialBalance * 0.05,      // 5% ganancia objetivo
  minimumTradingDays: 5
}

// CUENTA FONDEADA
{
  dailyLossLimit: initialBalance * 0.05,    // 5% pérdida diaria
  maxLossLimit: initialBalance * 0.10,      // 10% pérdida total
  profitTarget: Infinity,                   // Sin límite de ganancia
  minimumTradingDays: 0                     // Sin mínimo de días
}
```

---

## 📋 **Casos de Uso Avanzados**

### **1. Integración con MT5**
```javascript
// Sincronización automática desde MT5
export const syncMT5Balance = async (accountId, mt5Data) => {
  await updateBalanceWithHistory(
    accountId,
    mt5Data.balance,
    'mt5_sync'
  );
  
  // Snapshot adicional con datos MT5 extra
  await createBalanceSnapshot(accountId, {
    balanceActual: mt5Data.balance,
    mt5Equity: mt5Data.equity,
    mt5Margin: mt5Data.margin,
    mt5Profit: mt5Data.profit
  });
};
```

### **2. Webhook para Actualizaciones Externas**
```javascript
// Endpoint para recibir actualizaciones de balance
app.post('/api/update-balance', async (req, res) => {
  const { accountId, newBalance, source } = req.body;
  
  const result = await updateBalanceWithHistory(
    accountId,
    newBalance,
    source || 'webhook'
  );
  
  res.json({ success: true, data: result });
});
```

### **3. Procesamiento Batch**
```javascript
// Actualizar múltiples cuentas
const updates = [
  { accountId: 'acc1', newBalance: 98500 },
  { accountId: 'acc2', newBalance: 101200 },
  { accountId: 'acc3', newBalance: 95800 }
];

const results = await batchUpdateBalances(updates);
console.log(`✅ ${results.successful} actualizadas, ${results.failed} errores`);
```

---

## 📊 **Análisis y Reportes**

### **Análisis de Tendencias**
```javascript
import { analyzeAccountTrends } from '../examples/HistoryExamples';

const analysis = analyzeAccountTrends(accountHistory);
console.log({
  trend: analysis.trend,           // 'positive', 'negative', 'neutral'
  performance: analysis.performance, // Porcentaje de performance
  volatility: analysis.volatility,   // Volatilidad promedio
  riskScore: analysis.riskScore,     // Score de riesgo (0-100)
  tradingDays: analysis.tradingDays  // Días únicos de trading
});
```

### **Sistema de Alertas**
```javascript
import { checkAccountAlerts } from '../examples/HistoryExamples';

const alerts = checkAccountAlerts(accountHistory);
alerts.forEach(alert => {
  console.log(`${alert.type}: ${alert.title} - ${alert.message}`);
});

// Ejemplos de alertas:
// - "Límite Diario Excedido"
// - "Límite Global Excedido"  
// - "Objetivo Alcanzado"
```

---

## 🧪 **Testing y Desarrollo**

### **Botón de Prueba (Solo Desarrollo)**
En modo desarrollo, hay un botón "🧪 Test" que:
1. Genera un balance aleatorio
2. Crea un snapshot automáticamente
3. Recarga el historial
4. Actualiza los gráficos

### **Crear Datos de Prueba**
```javascript
// Crear varios snapshots para testing
for (let i = 0; i < 10; i++) {
  const testBalance = 100000 + (Math.random() - 0.5) * 20000;
  await createBalanceSnapshot('test_account', {
    balanceActual: testBalance,
    updateSource: 'test_data',
    updateReason: `test_snapshot_${i}`
  });
}
```

---

## 🔍 **Consultas Útiles de Firestore**

### **Último Snapshot de una Cuenta**
```javascript
const lastSnapshot = await getDocs(query(
  collection(db, 'accountHistory'),
  where('accountId', '==', accountId),
  orderBy('timestamp', 'desc'),
  limit(1)
));
```

### **Historial del Último Mes**
```javascript
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

const monthlyHistory = await getDocs(query(
  collection(db, 'accountHistory'),
  where('accountId', '==', accountId),
  where('timestamp', '>=', oneMonthAgo),
  orderBy('timestamp', 'desc')
));
```

### **Cuentas con Límites Excedidos**
```javascript
const alertAccounts = await getDocs(query(
  collection(db, 'accountHistory'),
  where('globalLossExceeded', '==', true),
  orderBy('timestamp', 'desc')
));
```

---

## 🎊 **Beneficios del Sistema**

### **Para Traders:**
- 📈 **Visualización temporal** de su progreso
- 📊 **KPIs automáticos** siempre actualizados
- 🎯 **Seguimiento de objetivos** en tiempo real
- 📅 **Historial completo** de su performance

### **Para Administradores:**
- 🔄 **Actualizaciones automáticas** sin intervención manual
- 📋 **Reportes históricos** completos
- 🚨 **Sistema de alertas** automático
- 📊 **Análisis de tendencias** de todas las cuentas

### **Para Desarrolladores:**
- 🛠️ **API sencilla** para integrar
- 🧪 **Herramientas de testing** incluidas
- 📚 **Documentación completa** y ejemplos
- 🔧 **Fácil mantenimiento** y escalabilidad

---

## 🚀 **Próximos Pasos**

1. **Prueba el sistema** con el botón "🧪 Test" en desarrollo
2. **Integra las funciones** en tus componentes
3. **Personaliza los límites** según tus reglas de negocio
4. **Añade más análisis** según tus necesidades
5. **Implementa notificaciones** basadas en alertas

¡El sistema está listo para generar historial automáticamente cada vez que actualices un balance! 🎉 