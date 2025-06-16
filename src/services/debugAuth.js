import axios from 'axios';
import { auth } from '../firebase/config';

const API_BASE_URL = 'http://whapy.com/mt5';

// Función para obtener token Firebase
async function getFirebaseToken() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log('❌ No hay usuario autenticado');
            return null;
        }
        
        const token = await user.getIdToken();
        console.log('✅ Token Firebase obtenido:', token.substring(0, 20) + '...');
        return token;
    } catch (error) {
        console.error('❌ Error obteniendo token Firebase:', error);
        return null;
    }
}

// Test 1: Endpoint de tiempo del servidor (sin autenticación)
export async function testServerTimeEndpoint() {
    try {
        console.log('🔍 Probando endpoint de tiempo del servidor...');
        const response = await axios.get(`${API_BASE_URL}/auth/time`);
        console.log('✅ Server time endpoint OK:', response.data);
        
        // Comparar con tiempo local
        const serverTime = new Date(response.data.server_time_utc);
        const localTime = new Date();
        const timeDiff = Math.abs(serverTime.getTime() - localTime.getTime());
        const timeDiffMinutes = Math.round(timeDiff / (1000 * 60));
        
        console.log(`⏰ Diferencia de tiempo: ${timeDiffMinutes} minutos`);
        if (timeDiffMinutes > 5) {
            console.warn('⚠️ Gran diferencia de tiempo detectada - esto puede causar problemas de autenticación');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Server time endpoint falló:', error.response?.data || error.message);
        return false;
    }
}

// Test 2: Endpoint de salud (sin autenticación)
export async function testHealthEndpoint() {
    try {
        console.log('🔍 Probando endpoint de salud...');
        const response = await axios.get(`${API_BASE_URL}/health`);
        console.log('✅ Health endpoint OK:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Health endpoint falló:', error.response?.data || error.message);
        console.log('ℹ️ Intentando endpoint alternativo...');
        try {
            // Intentar endpoint raíz como alternativa
            const altResponse = await axios.get(`${API_BASE_URL}/`);
            console.log('✅ Root endpoint OK:', altResponse.data);
            return true;
        } catch (altError) {
            console.error('❌ Root endpoint también falló:', altError.response?.data || altError.message);
        return false;
        }
    }
}

// Test 2: Endpoint de prueba de token (solo verifica si llega el token)
export async function testTokenEndpoint() {
    try {
        console.log('🔍 Probando endpoint de token...');
        const token = await getFirebaseToken();
        if (!token) return false;
        
        const response = await axios.get(`${API_BASE_URL}/auth/test-token`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Token endpoint OK:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Token endpoint falló:', error.response?.data || error.message);
        return false;
    }
}

// Test 3: Endpoint de autenticación completa
export async function testAuthEndpoint() {
    try {
        console.log('🔍 Probando endpoint de autenticación...');
        const token = await getFirebaseToken();
        if (!token) return false;
        
        const response = await axios.get(`${API_BASE_URL}/auth/test-auth`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Auth endpoint OK:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Auth endpoint falló:', error.response?.data || error.message);
        return false;
    }
}

// Test 4: Endpoint real de MT5
export async function testMT5Endpoint() {
    try {
        console.log('🔍 Probando endpoint real de MT5...');
        const token = await getFirebaseToken();
        if (!token) return false;
        
        const response = await axios.get(`${API_BASE_URL}/api/v1/accounts/100634`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ MT5 endpoint OK:', response.data);
        return true;
    } catch (error) {
        console.error('❌ MT5 endpoint falló:', error.response?.data || error.message);
        
        // Log detallado del error para debugging
        if (error.response) {
            console.error('📄 Detalles del error 500:');
            console.error('- Status:', error.response.status);
            console.error('- Headers:', error.response.headers);
            console.error('- Data completa:', error.response.data);
            
            if (error.response.data?.detail) {
                console.error('🔍 Error específico:', error.response.data.detail);
            }
        }
        
        return false;
    }
}

// Test 5: Endpoint de debug sin autenticación para comparar
export async function testMT5DebugEndpoint() {
    try {
        console.log('🔍 Probando endpoint de debug MT5 (sin auth)...');
        const response = await axios.get(`${API_BASE_URL}/api/v1/accounts/100634`);
        console.log('✅ MT5 debug endpoint OK:', response.data);
        return true;
    } catch (error) {
        console.error('❌ MT5 debug endpoint falló:', error.response?.data || error.message);
        return false;
    }
}

// Test 5: Endpoint para diagnosticar el contenedor de dependencias
export async function testContainerEndpoint() {
    try {
        console.log('🔍 Probando diagnóstico del contenedor de dependencias...');
        const response = await axios.get(`${API_BASE_URL}/debug/container`);
        console.log('✅ Container diagnostic OK:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Container diagnostic falló:', error.response?.data || error.message);
        return false;
    }
}

// Ejecutar todos los tests
export async function runAllTests() {
    console.log('🚀 Iniciando diagnóstico de autenticación...');
    console.log('=====================================');
    
    const results = {
        serverTime: await testServerTimeEndpoint(),
        container: await testContainerEndpoint(),
        health: await testHealthEndpoint(),
        token: await testTokenEndpoint(),
        auth: await testAuthEndpoint(),
        mt5: await testMT5Endpoint(),
        mt5Debug: await testMT5DebugEndpoint()
    };
    
    console.log('=====================================');
    console.log('📊 Resultados del diagnóstico:');
    console.log('- Server time:', results.serverTime ? '✅' : '❌');
    console.log('- Container diagnostic:', results.container ? '✅' : '❌');
    console.log('- Health endpoint:', results.health ? '✅' : '❌');
    console.log('- Token endpoint:', results.token ? '✅' : '❌');
    console.log('- Auth endpoint:', results.auth ? '✅' : '❌');
    console.log('- MT5 endpoint:', results.mt5 ? '✅' : '❌');
    console.log('- MT5 debug endpoint:', results.mt5Debug ? '✅' : '❌');
    
    return results;
} 