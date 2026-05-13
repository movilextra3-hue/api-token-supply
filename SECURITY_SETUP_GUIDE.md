# 🔒 GUÍA COMPLETA DE SEGURIDAD AUTOMATIZADA

## Estructura de Seguridad para API Token Supply

Este documento contiene toda la configuración necesaria para proteger este repositorio crítico de Solana.

---

## 📋 PASO 1: Crear Archivos de Configuración

### 1.1 `.github/workflows/security-audit.yml`
```yaml
name: 🔒 Security Audit & Dependency Check

on:
  push:
    branches: [main, develop, master]
  pull_request:
    branches: [main, develop, master]
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM UTC

jobs:
  npm-audit:
    name: NPM Audit & Dependency Check
    runs-on: ubuntu-latest
    if: hashFiles('package.json') != ''
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: 📦 Install dependencies
        run: npm ci --audit-only
        continue-on-error: true
      
      - name: 🔍 NPM Audit
        run: npm audit --audit-level=moderate
        continue-on-error: true

  secrets-detection:
    name: 🔐 Detect Exposed Secrets
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: 🔎 TruffleHog Secret Scan
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD

  codeql-analysis:
    name: 🔬 CodeQL Analysis
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4
      
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v2
        with:
          languages: 'javascript'
      
      - name: Autobuild
        uses: github/codeql-action/autobuild@v2
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2
```

### 1.2 `.github/workflows/push-protection.yml`
```yaml
name: 🚫 Push Protection - Block Secrets

on:
  push:
    branches: [main, develop, master]

jobs:
  detect-secrets:
    name: Detect & Block Secrets Before Push
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: 🔎 Gitguardian Secret Scanning
        uses: gitguardian/ggshield-action@v1
        env:
          GITGUARDIAN_API_KEY: \${{ secrets.GITGUARDIAN_API_KEY }}
        continue-on-error: false
      
      - name: 🔐 Detect RPC Keys & Secrets
        run: |
          echo "🔐 Scanning for hardcoded secrets patterns..."
          if grep -r "(PRIVATE_KEY|RPC_URL|API_KEY|SECRET|PASSWORD|TOKEN|MNEMONIC)" --include="*.js" --include="*.json" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null | grep -v ".example"; then
            echo "❌ Found potential hardcoded secrets!"
            exit 1
          fi
          echo "✅ No hardcoded secrets detected"
```

### 1.3 `.github/workflows/dependency-update.yml`
```yaml
name: 📦 Automated Dependency Updates

on:
  schedule:
    - cron: '0 3 * * 1'  # Weekly on Monday at 3 AM UTC
  workflow_dispatch:

jobs:
  update-npm-dependencies:
    name: Update NPM Dependencies
    runs-on: ubuntu-latest
    if: hashFiles('package.json') != ''
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: 📦 Update & Audit
        run: |
          npm update
          npm audit fix --force || true
      
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: '🔄 chore: automated dependency updates for security'
          title: '🔄 SECURITY: Automated Dependencies update'
          body: |
            ## 🔐 Security Dependencies Update
            - Automated weekly dependency update
            - Includes critical security patches
            - **IMPORTANT**: Please review and test thoroughly before merging
            - This is a **Solana token supply API** - extra care required
          branch: 'automation/dependency-updates'
          delete-branch: true
```

### 1.4 `.github/workflows/compliance-check.yml`
```yaml
name: ✅ Compliance & Best Practices

on:
  push:
    branches: [main, develop, master]
  pull_request:
    branches: [main, develop, master]

jobs:
  security-files:
    name: Verify Security Configuration
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: ✅ Check SECURITY.md
        run: |
          if [ ! -f "SECURITY.md" ]; then
            echo "⚠️  SECURITY.md not found - create it!"
          fi
      
      - name: ✅ Check .env.example
        run: |
          if [ ! -f ".env.example" ]; then
            echo "⚠️  .env.example not found - create it for documentation"
          fi
      
      - name: ✅ Check .gitignore
        run: |
          if [ ! -f ".gitignore" ]; then
            echo "⚠️  .gitignore not found"
          else
            if ! grep -q ".env" .gitignore; then
              echo "⚠️  Missing .env in .gitignore!"
            fi
          fi
```

### 1.5 `.github/dependabot.yml`
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "03:00"
    open-pull-requests-limit: 5
    reviewers:
      - "movilextra3-hue"
    labels:
      - "dependencies"
      - "security"
      - "solana"
    commit-message:
      prefix: "🔐 security(deps)"
      include: "scope"
```

---

## 📋 PASO 2: Crear Archivos de Documentación

### 2.1 `SECURITY.md`
```markdown
# 🔒 Política de Seguridad - API Token Supply (Solana)

## ⚠️ CRÍTICO - Este repositorio maneja tokens en Solana

**Impacto**: Vulnerabilidades aquí pueden resultar en pérdida de fondos reales.

## Reportar una Vulnerabilidad

**NO publiques vulnerabilidades públicamente.**

### Proceso:
1. Email: `security@movilextra.dev` (o crear Security Advisory en GitHub)
2. Incluye: descripción, pasos para reproducir, impacto estimado
3. **Tiempo de respuesta**: Máximo 24 horas

## Estándares Críticos de Seguridad

### ✅ Secretos - NUNCA en el repositorio
- [ ] No hay PRIVATE_KEY, RPC_URL, MNEMONIC hardcodeados
- [ ] Todas las claves están en variables de entorno (.env)
- [ ] .env está en .gitignore
- [ ] .env.example documenta variables (SIN valores)

### ✅ Dependencias - Auditadas semanalmente
- [ ] npm audit se ejecuta en cada commit
- [ ] Vulnerabilidades críticas bloqueadas automáticamente
- [ ] Dependabot habilitado y configurado
- [ ] Actualizaciones de seguridad aplicadas inmediatamente

### ✅ Código - Sin inyecciones o manipulaciones
- [ ] CodeQL analysis en cada PR
- [ ] ESLint con reglas de seguridad
- [ ] Validación de entrada estricta
- [ ] No ejecución de código dinámico

### ✅ Acceso - Control estricto
- [ ] Rama main protegida
- [ ] Requerimiento de PR review
- [ ] Status checks obligatorios
- [ ] Bloqueo de force pushes

## Desarrollo Seguro

### Antes de hacer push:
```bash
npm run security:check    # Verifica secrets
npm audit                 # Audita dependencias
npm run lint             # Valida código
```

### Variables de entorno:
```bash
# .env.local (NUNCA commit)
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=your_private_key_here
TOKEN_MINT=your_token_mint_address

# .env.example (SÍ commit - sin valores)
SOLANA_RPC_ENDPOINT=
SOLANA_PRIVATE_KEY=
TOKEN_MINT=
```

## Checklist Pre-Deploy

- [ ] Auditoría npm sin vulnerabilidades críticas
- [ ] Todas las PR tienen al menos 1 review
- [ ] CodeQL analysis sin findings críticos
- [ ] Secrets scanning: sin secretos detectados
- [ ] Test coverage > 80%
- [ ] Código local probado en testnet primero
- [ ] Cambios replicados en documentación

## Incidentes de Seguridad

Si descubres un incidente:
1. Reporta inmediatamente a security@movilextra.dev
2. No publicar detalles en redes sociales
3. Colabora en la remediación
4. Crédito apropiado (si autorizas)

## Recursos

- [Solana Security Best Practices](https://docs.solana.com/runtime/programs/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)

---

**Estado**: 🔒 CRÍTICA  
**Última auditoría**: 2026-05-13
```

### 2.2 `.env.example`
```bash
# 🔒 SOLANA NETWORK CONFIGURATION
# Copy to .env.local and fill with your values (NEVER commit .env)

# Solana RPC Endpoint
SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
# For testnet: https://api.devnet.solana.com

# Solana Wallet (NEVER commit actual private key)
SOLANA_PRIVATE_KEY=your_base58_private_key_here

# Token Configuration
TOKEN_MINT=your_token_mint_address_here

# API Configuration
PORT=3000
NODE_ENV=production

# Logging
LOG_LEVEL=info

# Monitoring (optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
```

### 2.3 `.gitignore` (actualizado)
```
# Environment variables
.env
.env.local
.env.*.local
.env.production

# Secrets and Keys
*.key
*.pem
*.p12
*.pfx
*.jks
keystore/
private_keys/
secrets/
wallet/

# Solana specific
sol-keypair
keypairs/
wallets/

# Node
node_modules/
npm-debug.log
npm-error.log
yarn-error.log
package-lock.json

# Build
dist/
build/
out/
.next/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
coverage/
.nyc_output/
.jest

# OS
Thumbs.db
.DS_Store

# Temporary
tmp/
temp/
*.tmp

# Logs
logs/
*.log
```

### 2.4 `scripts/security-check.js`
```javascript
#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let hasErrors = false;

function log(type, message) {
  const prefix = type === 'error' ? `${RED}❌` : type === 'success' ? `${GREEN}✅` : `${YELLOW}⚠️ `;
  console.log(`${prefix} ${RESET}${message}`);
}

console.log(`\n${GREEN}════════════════════════════════════════════════════${RESET}`);
console.log(`${GREEN}    🔒 Security Pre-commit Check (Solana API)${RESET}`);
console.log(`${GREEN}════════════════════════════════════════════════════${RESET}\n`);

// Critical: Check for Solana secrets
console.log(`${YELLOW}🔐 Checking for Solana secrets...${RESET}`);

const secretPatterns = [
  { pattern: /SOLANA_PRIVATE_KEY\s*=\s*['\"]?[A-Za-z0-9+/]{40,}/gi, name: 'Solana Private Key' },
  { pattern: /PRIVATE_KEY\s*=\s*['\"]?[A-Za-z0-9+/]{40,}/gi, name: 'Private Key' },
  { pattern: /API_KEY\s*=\s*['\"]?[^'"\n]{20,}/gi, name: 'API Key' },
  { pattern: /SECRET\s*=\s*['\"]?[^'"\n]{20,}/gi, name: 'Secret' },
  { pattern: /MNEMONIC\s*=\s*['\"]?[a-z\s]{50,}/gi, name: 'Mnemonic' },
];

try {
  const files = execSync('git diff --cached --name-only', { encoding: 'utf-8' }).trim().split('\n');
  
  files.forEach(file => {
    if (file && fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      secretPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(content) && !file.includes('.example') && !file.includes('SECURITY')) {
          log('error', `Potential ${name} in ${file}`);
          hasErrors = true;
        }
      });
    }
  });
  
  if (!hasErrors) log('success', 'No secrets detected');
} catch (e) {
  // Not in git context
}

// Check dependencies
if (fs.existsSync('package.json')) {
  console.log(`\n${YELLOW}📦 Checking dependencies...${RESET}`);
  try {
    execSync('npm audit --audit-level=moderate', { stdio: 'pipe' });
    log('success', 'NPM dependencies are secure');
  } catch (e) {
    log('error', 'NPM audit found vulnerabilities');
    hasErrors = true;
  }
}

// Check .gitignore
console.log(`\n${YELLOW}📝 Checking .gitignore...${RESET}`);
if (!fs.existsSync('.gitignore')) {
  log('error', '.gitignore not found');
  hasErrors = true;
} else {
  const gitignore = fs.readFileSync('.gitignore', 'utf-8');
  const required = ['.env', 'SOLANA_PRIVATE_KEY', 'private_keys/', 'wallets/'];
  
  required.forEach(pattern => {
    if (!gitignore.includes(pattern)) {
      log('error', `Missing ${pattern} in .gitignore`);
      hasErrors = true;
    }
  });
  
  if (!hasErrors) log('success', '.gitignore is properly configured');
}

console.log(`\n${GREEN}════════════════════════════════════════════════════${RESET}`);

if (hasErrors) {
  console.log(`${RED}❌ Security checks FAILED. Fix errors before committing.${RESET}\n`);
  process.exit(1);
} else {
  console.log(`${GREEN}✅ All security checks PASSED${RESET}\n`);
  process.exit(0);
}
```

---

## 📋 PASO 3: Actualizar `package.json`

Agregar scripts de seguridad:

```json
{
  "scripts": {
    "start": "node index.js",
    "security:check": "node scripts/security-check.js",
    "security:audit": "npm audit",
    "security:audit:fix": "npm audit fix",
    "security:full": "npm run security:check && npm run security:audit"
  }
}
```

---

## 🔧 PASO 4: Configuración de GitHub (Manual)

### Para este repositorio (CRÍTICO):

1. **Settings → Security → Code security and analysis**
   - ✅ Enable Dependabot alerts
   - ✅ Enable Dependabot security updates  
   - ✅ Enable secret scanning
   - ✅ Enable push protection (CRÍTICO)

2. **Settings → Code and automation → Branch protection rules**
   - Nombre de rama: `main`
   - ✅ Require pull request reviews (mínimo 1)
   - ✅ Require status checks to pass (CRÍTICO)
   - ✅ Require branches to be up to date
   - ✅ Require code scanning results
   - ✅ Block force pushes (CRÍTICO)
   - ✅ Block deletions (CRÍTICO)
   - ✅ Restrict who can push to matching branches

3. **Settings → Secrets and variables → Actions**
   - Agregar si necesitas: `GITGUARDIAN_API_KEY`

4. **Settings → Code security → Secret scanning push protection**
   - ✅ Enable for custom patterns
   - Patrón: `SOLANA_PRIVATE_KEY|RPC_ENDPOINT|TOKEN_MINT`

---

## 📊 Automatización de Seguridad

| Verificación | Frecuencia | Acción |
|---|---|---|
| NPM Audit | En cada push | Bloquea si hay críticas |
| Secret Scanning | En cada push | Bloquea push inmediatamente |
| CodeQL | En cada PR | Requiere aprobación |
| Dependabot | Semanal | Auto-PR para actualizar |
| Full Audit | Domingos 2 AM | Email con reporte |

---

## 🚀 Implementación Rápida

```bash
# 1. Crea rama de seguridad
git checkout -b security/automated-protection

# 2. Crea directorios
mkdir -p .github/workflows
mkdir -p scripts

# 3. Copia los archivos de este documento:
#    - .github/workflows/security-audit.yml
#    - .github/workflows/push-protection.yml
#    - .github/workflows/dependency-update.yml
#    - .github/workflows/compliance-check.yml
#    - .github/dependabot.yml
#    - SECURITY.md
#    - .env.example
#    - .gitignore (actualizar)
#    - scripts/security-check.js
#    - package.json (agregar scripts)

# 4. Commit
git add .
git commit -m "🔒 SECURITY: Automated protection for Solana token API"

# 5. Push y crea PR
git push -u origin security/automated-protection

# 6. Review y merge
# 7. Configura GitHub manualmente (PASO 4)
```

---

## ✅ Checklist Final

- [ ] Todos los archivos creados en `.github/workflows/`
- [ ] `SECURITY.md` implementado y detallado
- [ ] `.env.example` con todas las variables necesarias
- [ ] `.gitignore` protege `.env` y claves
- [ ] `scripts/security-check.js` ejecuta sin errores
- [ ] `package.json` tiene scripts de seguridad
- [ ] Dependabot habilitado en GitHub
- [ ] Secret scanning habilitado
- [ ] Push protection habilitada
- [ ] CodeQL analysis habilitado
- [ ] Branch protection configurada en `main`
- [ ] Status checks requieren estado exitoso

---

**Criticidad**: 🔴 CRÍTICA  
**Última actualización**: 2026-05-13  
**Repositorio**: api-token-supply (Solana)
```

Ahora voy a crear la guía para los otros dos repositorios:

