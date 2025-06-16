import React, { useState } from 'react';
import { runAllTests } from '../services/debugAuth';

const AuthDebugger = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);

    const handleRunTests = async () => {
        setIsRunning(true);
        setResults(null);
        
        try {
            const testResults = await runAllTests();
            setResults(testResults);
        } catch (error) {
            console.error('Error ejecutando tests:', error);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            background: 'white', 
            padding: '15px', 
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 9999,
            minWidth: '300px'
        }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🔧 Debug Autenticación</h4>
            
            <button 
                onClick={handleRunTests}
                disabled={isRunning}
                style={{
                    background: isRunning ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    width: '100%',
                    marginBottom: '10px'
                }}
            >
                {isRunning ? '🔄 Ejecutando...' : '🚀 Ejecutar Tests'}
            </button>

            {results && (
                <div style={{ fontSize: '12px' }}>
                    <div style={{ marginBottom: '5px' }}>
                        <strong>Resultados:</strong>
                    </div>
                    <div>Health: {results.health ? '✅' : '❌'}</div>
                    <div>Token: {results.token ? '✅' : '❌'}</div>
                    <div>Auth: {results.auth ? '✅' : '❌'}</div>
                    <div>MT5: {results.mt5 ? '✅' : '❌'}</div>
                    
                    <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
                        Ver consola para detalles completos
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthDebugger; 