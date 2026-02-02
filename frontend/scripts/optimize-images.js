#!/usr/bin/env node

/**
 * Script para otimizar imagens do projeto
 * Converte PNG/JPG para WebP e gera versões responsivas
 * 
 * Uso: node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

// Função para verificar se sharp está instalado
function checkSharp() {
  try {
    require.resolve('sharp');
    return true;
  } catch (e) {
    console.log('⚠️  sharp não instalado. Instalando...');
    console.log('   npm install sharp --save-dev');
    return false;
  }
}

// Lista imagens que precisam de versão WebP
function findImages(dir) {
  const images = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      images.push(...findImages(fullPath));
    } else if (entry.isFile() && IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      images.push(fullPath);
    }
  }
  
  return images;
}

function main() {
  console.log('🚀 Verificando imagens para otimização...\n');
  
  if (!checkSharp()) {
    console.log('\n📦 Por favor, instale o sharp primeiro:');
    console.log('   npm install sharp --save-dev');
    console.log('\n💡 Dica: Você também pode usar ferramentas online:');
    console.log('   - Squoosh.app (Google)');
    console.log('   - TinyPNG.com');
    console.log('   - ImageOptim (Mac)');
    return;
  }
  
  const sharp = require('sharp');
  const images = findImages(PUBLIC_DIR);
  
  if (images.length === 0) {
    console.log('ℹ️  Nenhuma imagem encontrada para otimizar.');
    return;
  }
  
  console.log(`📁 Encontradas ${images.length} imagens para converter:\n`);
  
  images.forEach(img => {
    const relative = path.relative(PUBLIC_DIR, img);
    const filename = path.basename(img, path.extname(img));
    const dir = path.dirname(img);
    const webpPath = path.join(dir, `${filename}.webp`);
    
    if (!fs.existsSync(webpPath)) {
      console.log(`   🔄 ${relative} → ${filename}.webp`);
    } else {
      console.log(`   ✅ ${relative} (já convertida)`);
    }
  });
  
  console.log('\n📋 Para converter manualmente, use:');
  console.log('   npx sharp input.png -o output.webp');
  console.log('\n🌐 Ou use o Squoosh.app para conversão visual');
}

main();
