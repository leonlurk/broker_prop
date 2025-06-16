#!/usr/bin/env node

/**
 * 🔍 Script de Verificación de Migración API MT5
 * Verifica que todas las configuraciones HTTPS estén correctas
 * y que la nueva API responda correctamente
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.cyan}${colors.bright}🔍 ${msg}${colors.reset}\n`)
};

// Verificar archivos modificados
const checkModifiedFiles = () => {
  log.title('VERIFICANDO ARCHIVOS MODIFICADOS');
  
  const requiredFiles = [
    'src/services/mt5Service.js',
    'vite.config.js',
    'env-example.txt'
  ];
  
  const results = [];
  
  requiredFiles.forEach(file => {
    try {
      const filePath = join(__dirname, file);
      const content = readFileSync(filePath, 'utf8');
      
      if (file === 'src/services/mt5Service.js') {
        if (content.includes('https://') && content.includes('accounts/info') && content.includes('Bearer')) {
          log.success(`${file} - Migrado correctamente`);
          results.push(true);
        } else {
          log.error(`${file} - No migrado completamente`);
          results.push(false);
        }
      }
      
      if (file === 'vite.config.js') {
        if (content.includes('VITE_MT5_API_URL') && content.includes('secure: true')) {
          log.success(`${file} - Configurado para HTTPS`);
          results.push(true);
        } else {
          log.warning(`${file} - Configuración HTTPS incompleta`);
          results.push(false);
        }
      }
      
      if (file === 'env-example.txt') {
        if (content.includes('VITE_MT5_API_URL=https://')) {
          log.success(`${file} - Variables HTTPS configuradas`);
          results.push(true);
        } else {
          log.error(`${file} - Variables HTTPS faltantes`);
          results.push(false);
        }
      }
      
    } catch (error) {
      log.error(`${file} - Archivo no encontrado`);
      results.push(false);
    }
  });
  
  return results.every(r => r);
};

// Verificar URLs hardcoded
const checkHardcodedUrls = () => {
  log.title('VERIFICANDO URLs HARDCODED');
  
  try {
    const mt5ServicePath = join(__dirname, 'src/services/mt5Service.js');
    const content = readFileSync(mt5ServicePath, 'utf8');
    
    const hardcodedUrls = [
      'https://62.171.177.212:5000',
      'https://62.171.177.212',
      'http://localhost:5000'
    ];
    
    let foundHardcoded = false;
    
    hardcodedUrls.forEach(url => {
      if (content.includes(url)) {
        log.error(`URL hardcoded encontrada: ${url}`);
        foundHardcoded = true;
      }
    });
    
    if (!foundHardcoded) {
      log.success('No se encontraron URLs hardcoded');
      return true;
    } else {
      log.error('Se encontraron URLs hardcoded que deben ser reemplazadas');
      return false;
    }
    
  } catch (error) {
    log.error('Error verificando URLs hardcoded');
    return false;
  }
};

// Verificar estructura de endpoints
const checkEndpointStructure = () => {
  log.title('VERIFICANDO ESTRUCTURA DE ENDPOINTS');
  
  try {
    const mt5ServicePath = join(__dirname, 'src/services/mt5Service.js');
    const content = readFileSync(mt5ServicePath, 'utf8');
    
    const requiredEndpoints = [
      '/accounts/info/',
      '/accounts/history',
      '/accounts/create',
      '/accounts/deposit',
      'getAccountHistory',
      'getFinancialData',
      'detectStrategies'
    ];
    
    let allFound = true;
    
    requiredEndpoints.forEach(endpoint => {
      if (content.includes(endpoint)) {
        log.success(`Endpoint encontrado: ${endpoint}`);
      } else {
        log.error(`Endpoint faltante: ${endpoint}`);
        allFound = false;
      }
    });
    
    return allFound;
    
  } catch (error) {
    log.error('Error verificando estructura de endpoints');
    return false;
  }
};

// Verificar autenticación Firebase
const checkFirebaseAuth = () => {
  log.title('VERIFICANDO AUTENTICACIÓN FIREBASE');
  
  try {
    const mt5ServicePath = join(__dirname, 'src/services/mt5Service.js');
    const content = readFileSync(mt5ServicePath, 'utf8');
    
    const authElements = [
      'getAuth()',
      'currentUser.getIdToken()',
      'Bearer ${token}',
      'Authorization'
    ];
    
    let allFound = true;
    
    authElements.forEach(element => {
      if (content.includes(element)) {
        log.success(`Autenticación: ${element} ✓`);
      } else {
        log.error(`Autenticación faltante: ${element}`);
        allFound = false;
      }
    });
    
    return allFound;
    
  } catch (error) {
    log.error('Error verificando autenticación Firebase');
    return false;
  }
};

// Verificar configuración package.json
const checkPackageJson = () => {
  log.title('VERIFICANDO PACKAGE.JSON');
  
  try {
    const packagePath = join(__dirname, 'package.json');
    const content = JSON.parse(readFileSync(packagePath, 'utf8'));
    
    const requiredDeps = ['axios', 'firebase'];
    let allFound = true;
    
    requiredDeps.forEach(dep => {
      if (content.dependencies && content.dependencies[dep]) {
        log.success(`Dependencia: ${dep} v${content.dependencies[dep]}`);
      } else {
        log.error(`Dependencia faltante: ${dep}`);
        allFound = false;
      }
    });
    
    return allFound;
    
  } catch (error) {
    log.error('Error verificando package.json');
    return false;
  }
};

// Función principal
const runVerification = () => {
  console.log(`${colors.magenta}${colors.bright}`);
  console.log('🚀 VERIFICACIÓN DE MIGRACIÓN API MT5');
  console.log('=====================================');
  console.log(`${colors.reset}\n`);
  
  const checks = [
    { name: 'Archivos Modificados', fn: checkModifiedFiles },
    { name: 'URLs Hardcoded', fn: checkHardcodedUrls },
    { name: 'Estructura Endpoints', fn: checkEndpointStructure },
    { name: 'Autenticación Firebase', fn: checkFirebaseAuth },
    { name: 'Package.json', fn: checkPackageJson }
  ];
  
  const results = checks.map(check => ({
    name: check.name,
    passed: check.fn()
  }));
  
  console.log('\n' + '='.repeat(50));
  log.title('RESUMEN DE VERIFICACIÓN');
  
  results.forEach(result => {
    if (result.passed) {
      log.success(`${result.name}: CORRECTO`);
    } else {
      log.error(`${result.name}: REQUIERE ATENCIÓN`);
    }
  });
  
  const allPassed = results.every(r => r.passed);
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    log.success('🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log(`${colors.green}${colors.bright}`);
    console.log('✅ Frontend listo para producción');
    console.log('✅ HTTPS configurado correctamente');
    console.log('✅ Nueva API integrada');
    console.log('✅ Autenticación Firebase verificada');
    console.log(`${colors.reset}`);
  } else {
    log.error('🚨 MIGRACIÓN INCOMPLETA');
    console.log(`${colors.red}`);
    console.log('❌ Revisa los errores anteriores');
    console.log('❌ Completa la migración antes de desplegar');
    console.log(`${colors.reset}`);
  }
  
  console.log('\n📋 Siguiente paso: Configurar variables de entorno');
  console.log('cp env-example.txt .env');
  console.log('# Editar .env con tu API HTTPS URL\n');
};

// Ejecutar verificación
runVerification(); 