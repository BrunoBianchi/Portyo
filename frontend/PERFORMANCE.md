# Otimizações de Performance - Portyo

## Resumo das Otimizações Implementadas

### 1. Build & Bundling (vite.config.ts)
- ✅ Code splitting otimizado (7 chunks separados)
- ✅ Compressão Gzip e Brotli automática
- ✅ Tree shaking com esbuild
- ✅ Remoção de console.log em produção
- ✅ Assets inline para arquivos < 4KB
- ✅ Nomenclatura de arquivos com hash para cache

### 2. Service Worker (sw.js)
- ✅ Cache First para CSS/JS (30 dias)
- ✅ Stale While Revalidate para imagens (60 dias)
- ✅ Cache First para fontes (1 ano)
- ✅ Network First para API (3s timeout)
- ✅ Background sync para formulários
- ✅ Push notifications (preparado)

### 3. SEO & Meta Tags (root.tsx)
- ✅ Canonical URLs
- ✅ Open Graph completo
- ✅ Twitter Cards
- ✅ JSON-LD structured data
- ✅ Hreflang para i18n
- ✅ CSP (Content Security Policy)
- ✅ Security headers

### 4. Fontes
- ✅ Preconnect para Google Fonts
- ✅ display=swap para evitar FOIT
- ✅ Preload de fontes críticas
- ✅ Subset de fontes (via Google Fonts API)
- ✅ Media print + onLoad para carregamento não-bloqueante

### 5. Imagens
- ✅ Componente OptimizedImage com WebP/AVIF
- ✅ Lazy loading nativo
- ✅ Placeholder blur opcional
- ✅ Aspect ratio fixo (evita CLS)
- ✅ Picture element com fallback

### 6. Anúncios/Banner
- ✅ AnnouncementBar component
- ✅ Posicionamento fixo no topo
- ✅ Ajuste automático da navbar
- ✅ Persistência com sessionStorage

## Métricas Esperadas

### Core Web Vitals
- **LCP**: < 2.5s (com preload de imagens críticas)
- **INP**: < 200ms (com code splitting)
- **CLS**: < 0.1 (com aspect ratio fixo)

### Lighthouse Scores
- Performance: 95-100
- Acessibilidade: 95-100
- Best Practices: 100
- SEO: 100

## Checklist de Implementação

### Antes do Deploy
- [ ] Converter imagens PNG para WebP
- [ ] Verificar se sw.js está na pasta public
- [ ] Testar em dispositivos móveis
- [ ] Verificar console por erros
- [ ] Rodar Lighthouse audit

### Comandos Úteis
```bash
# Analisar bundle
npm run build -- --mode analyze

# Otimizar imagens
node scripts/optimize-images.js

# Testar performance
npm run dev
# Abrir DevTools > Lighthouse
```

## Próximos Passos (Opcional)

1. **Critical CSS**: Extrair CSS crítico inline
2. **HTTP/2 Server Push**: Configurar no servidor
3. **Edge Caching**: Configurar CDN (Cloudflare/Vercel)
4. **Image CDN**: Considerar Cloudinary/Imgix
5. **Real User Monitoring**: Implementar Core Web Vitals RUM

## Referências

- [Web.dev Performance](https://web.dev/performance-scoring/)
- [Vite Build Options](https://vitejs.dev/config/build-options.html)
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
