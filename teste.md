# Plano de Implementação da SDK Dheme

## Visão Geral

Criar estrutura base da SDK Dheme para ser movida para outro repositório. A SDK consiste em dois pacotes:

1. **@dheme/sdk** - SDK base TypeScript pura, agnóstica de framework
2. **@dheme/react** - Bindings React com Provider, hooks e componentes

A SDK base deve funcionar em: Browser, Node.js, Edge Runtime e React Native.

---

## Estrutura de Diretórios

```
sdk/
├── README.md                          # README PRINCIPAL (fonte de verdade para IA)
├── .gitignore
├── package.json                       # Root (workspaces)
├── tsconfig.json                      # Base config
├── .eslintrc.json
├── .prettierrc
└── packages/
    ├── sdk/                           # @dheme/sdk
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── tsconfig.build.json
    │   ├── README.md
    │   ├── CHANGELOG.md
    │   ├── LICENSE
    │   ├── src/
    │   │   ├── index.ts                        # Export principal
    │   │   ├── client.ts                       # Cliente HTTP
    │   │   ├── types.ts                        # Tipos globais
    │   │   ├── errors.ts                       # Classes de erro
    │   │   ├── constants.ts                    # Constantes
    │   │   ├── modules/
    │   │   │   ├── theme.ts                    # Módulo de tema
    │   │   │   └── usage.ts                    # Módulo de uso
    │   │   ├── middleware/
    │   │   │   ├── auth.ts                     # Auth middleware
    │   │   │   ├── rateLimitHandler.ts         # Rate limit
    │   │   │   ├── retry.ts                    # Retry com backoff
    │   │   │   └── interceptors.ts             # Interceptors
    │   │   └── utils/
    │   │       ├── request.ts                  # HTTP utils
    │   │       ├── validators.ts               # Validadores
    │   │       ├── colorConversion.ts          # HEX/RGB/HSL
    │   │       ├── logger.ts                   # Logging
    │   │       └── polyfills.ts                # Node.js polyfills
    │   ├── examples/
    │   │   ├── basic.ts
    │   │   ├── nodejs.ts
    │   │   ├── edge.ts
    │   │   ├── browser.ts
    │   │   ├── retry.ts
    │   │   └── interceptors.ts
    │   └── tests/
    │       ├── client.test.ts
    │       ├── colorConversion.test.ts
    │       └── validators.test.ts
    └── react/                         # @dheme/react
        ├── package.json
        ├── tsconfig.json
        ├── tsconfig.build.json
        ├── README.md
        ├── CHANGELOG.md
        ├── LICENSE
        ├── src/
        │   ├── index.ts                        # Export principal
        │   ├── ThemeProvider.tsx               # Provider com state
        │   ├── ThemeContext.tsx                # Context definition
        │   ├── hooks/
        │   │   ├── useGenerateTheme.ts         # Hook gerar tema
        │   │   ├── useTheme.ts                 # Hook acessar tema
        │   │   ├── useThemeApplier.ts          # Hook aplicar CSS
        │   │   └── useUsageStats.ts            # Hook estatísticas
        │   ├── components/
        │   │   ├── ThemeSelector.tsx           # Seletor visual
        │   │   ├── ColorPicker.tsx             # Color picker
        │   │   ├── ThemePreview.tsx            # Preview tema
        │   │   └── UsageIndicator.tsx          # Indicador uso
        │   ├── utils/
        │   │   ├── cssVariables.ts             # Aplicar CSS vars
        │   │   ├── localStorage.ts             # Persistência
        │   │   └── ssr.ts                      # SSR helpers
        │   └── types.ts                        # Tipos React
        ├── examples/
        │   ├── basic.tsx
        │   ├── nextjs.tsx
        │   ├── vite.tsx
        │   └── with-persistence.tsx
        └── tests/
            ├── ThemeProvider.test.tsx
            └── hooks.test.tsx
```

---

## Conteúdo do README.md Principal

Este README é a **fonte única de verdade** - será usado pela IA para implementar toda a SDK.

### Seções do README:

1. **Introdução**
   - O que é a SDK Dheme
   - Funcionalidades principais
   - Compatibilidade de ambientes

2. **API Reference Completa**
   - **Endpoints:**
     - POST /api/generate-theme (JSON completo)
     - POST /api/generate-theme/shadcn (CSS text)
     - POST /api/generate-theme/tokens (múltiplos formatos)
     - GET /api/usage (estatísticas)

   - **Autenticação:**
     - Header: `x-api-key: dheme_[prefix]_[key]`
     - Formato da chave
     - Validação

   - **Rate Limiting:**
     - Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
     - Comportamento em 429

   - **Códigos de Erro:**
     - 400, 401, 429, 500
     - Formato de erro response

   - **Schemas TypeScript:**
     - Interface completa de cada request/response
     - HSLColor, ColorTokens, GenerateThemeResponse, etc.

3. **Arquitetura da SDK Base**
   - Cliente HTTP universal (fetch)
   - Sistema de retry com backoff exponencial
   - Interceptors (request/response)
   - Error handling customizado
   - Rate limit awareness
   - Conversão de cores (HEX ↔ RGB ↔ HSL)
   - Type safety completo
   - Debug mode

4. **Implementação Detalhada da SDK Base**

   **package.json:**
   ```json
   {
     "name": "@dheme/sdk",
     "version": "1.0.0",
     "description": "TypeScript SDK for Dheme API",
     "main": "./dist/index.js",
     "module": "./dist/index.mjs",
     "types": "./dist/index.d.ts",
     "exports": {
       ".": {
         "import": "./dist/index.mjs",
         "require": "./dist/index.js",
         "types": "./dist/index.d.ts"
       }
     },
     "scripts": {
       "build": "tsup src/index.ts --format cjs,esm --dts --clean",
       "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
       "test": "vitest",
       "lint": "eslint src --ext .ts"
     },
     "keywords": ["dheme", "theme", "sdk", "typescript"],
     "dependencies": {},
     "devDependencies": {
       "@types/node": "^20.0.0",
       "tsup": "^8.0.0",
       "typescript": "^5.0.0",
       "vitest": "^1.0.0"
     }
   }
   ```

   **Tipos principais (types.ts):**
   - DhemeClientConfig
   - GenerateThemeRequest
   - GenerateThemeResponse
   - TokensResponse
   - UsageResponse
   - HSLColor, RGBColor, ColorTokens
   - RetryConfig, Interceptors
   - RateLimitHeaders
   - ResponseWithRateLimit<T>

   **Classes de Erro (errors.ts):**
   - DhemeError (base)
   - AuthenticationError (401)
   - ValidationError (400)
   - RateLimitError (429)
   - NetworkError (timeout/network)
   - ServerError (500)

   **Cliente Principal (client.ts):**
   ```typescript
   class DhemeClient {
     constructor(config: DhemeClientConfig)

     // Métodos públicos
     generateTheme(params): Promise<ResponseWithRateLimit<GenerateThemeResponse>>
     generateShadcnCSS(params): Promise<string>
     generateTokens(params): Promise<ResponseWithRateLimit<TokensResponse>>
     getUsage(): Promise<ResponseWithRateLimit<UsageResponse>>

     // Métodos privados
     private makeApiRequest<T>()
     private makeRawRequest()
     private handleErrorResponse()
   }
   ```

   **Utilitários de Cor (utils/colorConversion.ts):**
   - hexToHSL(hex: string): HSLColor
   - hslToRGB(hsl: HSLColor): RGBColor
   - rgbToHex(rgb: RGBColor): string
   - hslToHex(hsl: HSLColor): string
   - hexToRGB(hex: string): RGBColor
   - rgbToHSL(rgb: RGBColor): HSLColor
   - formatHSLString(hsl: HSLColor): string
   - isValidHex(hex: string): boolean

   **Validadores (utils/validators.ts):**
   - validateGenerateThemeRequest(params): void
   - validateApiKey(apiKey: string): void

   **HTTP Request (utils/request.ts):**
   - isNode(): boolean
   - makeRequest(config: RequestConfig): Promise<Response>
   - parseRateLimitHeaders(headers: Headers): RateLimitHeaders | null

   **Retry Middleware (middleware/retry.ts):**
   - withRetry<T>(fn, config): Promise<T>
   - Implementa backoff exponencial
   - Configura status codes retryable

   **Interceptors (middleware/interceptors.ts):**
   - applyRequestInterceptors()
   - applyResponseInterceptors()
   - loggingInterceptor (exemplo)
   - customHeadersInterceptor (exemplo)

5. **Arquitetura da React Library**
   - Depende de @dheme/sdk
   - ThemeProvider com Context API
   - Hooks customizados
   - Aplicação automática de CSS variables
   - Persistência em localStorage
   - SSR-friendly (Next.js)
   - Componentes visuais prontos

6. **Implementação Detalhada da React Library**

   **package.json:**
   ```json
   {
     "name": "@dheme/react",
     "version": "1.0.0",
     "description": "React bindings for Dheme SDK",
     "peerDependencies": {
       "react": ">=18.0.0",
       "react-dom": ">=18.0.0"
     },
     "dependencies": {
       "@dheme/sdk": "workspace:*"
     }
   }
   ```

   **ThemeContext (ThemeContext.tsx):**
   ```typescript
   interface ThemeContextValue {
     client: DhemeClient;
     theme: GenerateThemeResponse | null;
     isLoading: boolean;
     error: Error | null;
     generateTheme: (params) => Promise<void>;
     clearTheme: () => void;
     applyTheme: (mode: 'light' | 'dark') => void;
   }
   ```

   **ThemeProvider (ThemeProvider.tsx):**
   - Props: apiKey, baseUrl, children, persistTheme, autoApply, mode, onThemeChange
   - State: theme, isLoading, error
   - Cria instância de DhemeClient
   - Carrega tema do localStorage no mount
   - Aplica CSS variables automaticamente quando tema muda
   - Persiste tema no localStorage

   **useTheme Hook:**
   - Acessa ThemeContext
   - Retorna: theme, isLoading, error, generateTheme, clearTheme, applyTheme, client

   **useGenerateTheme Hook:**
   - Wrapper sobre context.generateTheme
   - Retorna: generateTheme, isGenerating, error
   - Loading state local

   **CSS Variables (utils/cssVariables.ts):**
   - applyThemeCSSVariables(theme, mode)
   - removeThemeCSSVariables()
   - Aplica todas as variáveis CSS do Shadcn
   - Formata HSL corretamente
   - Aplica --radius
   - Aplica backgrounds customizados

   **localStorage (utils/localStorage.ts):**
   - saveThemeToStorage(theme)
   - loadThemeFromStorage(): theme | null
   - removeThemeFromStorage()
   - SSR-safe (verifica typeof window)
   - Try/catch para erros

7. **Exemplos de Uso**

   **SDK Base - Básico:**
   ```typescript
   import { DhemeClient } from '@dheme/sdk';

   const client = new DhemeClient({
     apiKey: 'dheme_xxxxxxxx_...',
   });

   const { data, rateLimit } = await client.generateTheme({
     theme: '#3b82f6',
     radius: 0.5,
   });
   ```

   **SDK Base - Com Retry:**
   ```typescript
   const client = new DhemeClient({
     apiKey: 'dheme_xxxxxxxx_...',
     retryConfig: {
       maxRetries: 5,
       initialDelay: 2000,
     },
   });
   ```

   **SDK Base - Com Interceptors:**
   ```typescript
   const client = new DhemeClient({
     apiKey: 'dheme_xxxxxxxx_...',
     interceptors: {
       request: [loggingInterceptor],
       response: [responseLoggingInterceptor],
     },
   });
   ```

   **React - Básico:**
   ```typescript
   import { ThemeProvider, useGenerateTheme, useTheme } from '@dheme/react';

   function App() {
     return (
       <ThemeProvider apiKey="dheme_xxxxxxxx_...">
         <MyComponent />
       </ThemeProvider>
     );
   }

   function MyComponent() {
     const { generateTheme, isGenerating } = useGenerateTheme();
     const { theme } = useTheme();

     return (
       <button onClick={() => generateTheme({ theme: '#3b82f6' })}>
         Generate
       </button>
     );
   }
   ```

   **React - Com Persistência:**
   ```typescript
   <ThemeProvider
     apiKey="dheme_xxxxxxxx_..."
     persistTheme={true}
     autoApply={true}
     mode="light"
   >
     <App />
   </ThemeProvider>
   ```

   **React - Next.js:**
   ```typescript
   // app/layout.tsx
   import { ThemeProvider } from '@dheme/react';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <ThemeProvider
             apiKey={process.env.NEXT_PUBLIC_DHEME_API_KEY!}
           >
             {children}
           </ThemeProvider>
         </body>
       </html>
     );
   }
   ```

8. **Detalhes da API** (copiar da exploração anterior)
   - Todos os endpoints com schemas completos
   - Exemplos de request/response
   - Códigos de erro
   - Headers de rate limit

9. **Conversão de Cores**
   - Explicar fórmulas de conversão
   - Algoritmos para HEX → HSL → RGB
   - Exemplos de uso
   - Edge cases

10. **Padrões e Boas Práticas**
    - Como estruturar erros
    - Como fazer logging opcional
    - Como fazer tree-shaking
    - Como testar
    - Como lidar com SSR
    - Como fazer polyfills para Node.js

11. **Configurações TypeScript**
    - tsconfig.json para SDK base
    - tsconfig.json para React
    - Configuração de build (tsup)
    - Exports do package.json

12. **Próximos Passos**
    - Ordem de implementação
    - Testes necessários
    - Documentação adicional
    - Publicação no npm

---

## Arquivos Críticos de Referência

Os seguintes arquivos do projeto atual devem ser lidos para entender a API:

1. **Geração de Tema:**
   - `/src/app/api/generate-theme/route.ts`
   - `/src/lib/server/generateTheme.ts`

2. **Autenticação:**
   - `/src/middleware/apiAuth.ts`

3. **Uso/Estatísticas:**
   - `/src/app/api/usage/route.ts`

4. **Tokens:**
   - `/src/app/api/generate-theme/tokens/route.ts`

5. **Tipos:**
   - `/src/types/database.ts`

---

## Funcionalidades Detalhadas

### SDK Base

**Cliente HTTP Universal:**
- Detecta ambiente (Browser/Node/Edge)
- Usa fetch API nativa
- Polyfill para Node.js < 18
- Timeout configurável
- AbortController para cancelamento

**Sistema de Retry:**
- Backoff exponencial
- Configura delay inicial, máximo, multiplicador
- Status codes retryable configuráveis
- Máximo de tentativas configurável
- Preserva último erro

**Interceptors:**
- Request interceptors (modificar config antes de enviar)
- Response interceptors (modificar response antes de retornar)
- Chain de interceptors
- Async support
- Exemplos: logging, custom headers, auth

**Error Handling:**
- Classes de erro tipadas
- Preserva response original
- Status code no erro
- Rate limit info em RateLimitError
- Network vs Server vs Validation errors

**Rate Limit Awareness:**
- Parse headers automático
- Retorna com cada response
- Informação disponível para app

**Conversão de Cores:**
- Algoritmos precisos de conversão
- Suporte HEX, RGB, HSL
- Formatação para CSS
- Validação de formato

**Type Safety:**
- Tipos para todos os requests/responses
- Generics para responses
- Inferência automática
- Strict mode

### React Library

**ThemeProvider:**
- Context API para state global
- Instância de cliente gerenciada
- State: theme, loading, error
- Callbacks: onThemeChange
- Props: persistTheme, autoApply, mode

**Hooks:**
- useTheme - acessa context
- useGenerateTheme - wrapper com loading local
- useThemeApplier - aplica CSS vars manualmente
- useUsageStats - estatísticas de uso

**CSS Variables:**
- Aplica todas as vars do Shadcn
- Suporta light e dark mode
- Formata HSL corretamente
- Remove vars quando limpar tema

**Persistência:**
- localStorage para browser
- SSR-safe (check window)
- Carrega no mount
- Salva ao gerar
- Remove ao limpar

**SSR Support:**
- Verifica typeof window
- Não quebra em server
- Hidratação correta
- Next.js friendly

**Componentes (opcional - implementar depois):**
- ThemeSelector - UI para escolher tema
- ColorPicker - Picker de cores
- ThemePreview - Preview do tema
- UsageIndicator - Barra de uso da API

---

## Configurações de Build

### Root package.json (workspaces)

```json
{
  "name": "dheme-sdk-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "dev": "npm run dev --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### tsconfig.json (root)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

### .gitignore

```
node_modules/
dist/
*.tsbuildinfo
.DS_Store
*.log
coverage/
.env
.env.local
```

### .prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

---

## Ordem de Implementação Sugerida

### Fase 1: Setup Inicial
1. Criar estrutura de diretórios
2. Configurar workspaces
3. Configurar TypeScript
4. Configurar build tools (tsup)

### Fase 2: SDK Base - Core
1. Implementar types.ts (todos os tipos)
2. Implementar errors.ts (classes de erro)
3. Implementar constants.ts
4. Implementar utils/colorConversion.ts
5. Implementar utils/validators.ts
6. Implementar utils/request.ts

### Fase 3: SDK Base - Middleware
1. Implementar middleware/retry.ts
2. Implementar middleware/interceptors.ts
3. Implementar middleware/auth.ts
4. Implementar middleware/rateLimitHandler.ts

### Fase 4: SDK Base - Client
1. Implementar client.ts (classe principal)
2. Implementar modules/theme.ts
3. Implementar modules/usage.ts
4. Implementar index.ts (exports)

### Fase 5: SDK Base - Exemplos e Testes
1. Criar exemplos de uso
2. Escrever testes unitários
3. Testar em diferentes ambientes

### Fase 6: React Library - Core
1. Implementar types.ts
2. Implementar ThemeContext.tsx
3. Implementar utils/cssVariables.ts
4. Implementar utils/localStorage.ts

### Fase 7: React Library - Provider e Hooks
1. Implementar ThemeProvider.tsx
2. Implementar hooks/useTheme.ts
3. Implementar hooks/useGenerateTheme.ts
4. Implementar hooks/useThemeApplier.ts

### Fase 8: React Library - Componentes (Opcional)
1. Implementar components/ThemeSelector.tsx
2. Implementar components/ColorPicker.tsx
3. Implementar components/ThemePreview.tsx
4. Implementar components/UsageIndicator.tsx

### Fase 9: React Library - Finalização
1. Implementar index.ts (exports)
2. Criar exemplos de uso
3. Escrever testes
4. Testar com Next.js, Vite, CRA

### Fase 10: Documentação e Publicação
1. Escrever README para cada pacote
2. Escrever CHANGELOG
3. Configurar CI/CD
4. Publicar no npm

---

## Considerações Importantes

### Compatibilidade
- Node.js >= 18 (fetch nativo)
- React >= 18 (concurrent features)
- TypeScript >= 5.0

### Segurança
- Nunca logar API keys
- Validar inputs
- Sanitizar outputs
- HTTPS only

### Performance
- Tree-shaking friendly
- Bundle size otimizado
- Lazy loading onde possível
- Memoização no React

### Developer Experience
- Type safety completo
- Autocomplete no IDE
- Mensagens de erro claras
- Documentação inline (JSDoc)
- Exemplos práticos

### Testes
- Testes unitários para utils
- Testes de integração para client
- Testes de componentes React
- Testes E2E para exemplos

---

## Notas Finais

Este plano serve como **documentação completa** para implementar a SDK Dheme. O README.md principal na pasta `sdk/` deve conter uma versão expandida deste plano com ainda mais detalhes, exemplos de código completos, e explicações passo a passo de cada implementação.

A SDK deve ser:
- ✅ Type-safe
- ✅ Bem documentada
- ✅ Testada
- ✅ Performática
- ✅ Extensível
- ✅ Fácil de usar
- ✅ Compatível com múltiplos ambientes
- ✅ Seguir boas práticas modernas de JavaScript/TypeScript
