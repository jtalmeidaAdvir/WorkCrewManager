#!/usr/bin/env node

// Script para executar desenvolvimento compatível com Windows e Unix
const { spawn } = require('child_process');
const path = require('path');

// Definir NODE_ENV
process.env.NODE_ENV = 'development';

// Executar tsx com o servidor
const serverPath = path.join(__dirname, '..', 'server', 'index.ts');
const child = spawn('tsx', [serverPath], {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

child.on('error', (error) => {
  console.error('Erro ao iniciar o servidor:', error);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code);
});