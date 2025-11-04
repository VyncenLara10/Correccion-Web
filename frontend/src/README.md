# 🚀 TikalInvest - Plataforma de Inversión

Plataforma completa de inversión con frontend profesional, sistema de diseño robusto y experiencia de usuario optimizada.

---

## 📚 Documentación

### 🎨 Sistema de Diseño
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Guía completa del sistema de diseño
- **[DESIGN_TOKENS.md](./DESIGN_TOKENS.md)** - Referencia rápida de todos los tokens CSS
- **[COMPONENT_EXAMPLES.md](./COMPONENT_EXAMPLES.md)** - Ejemplos de componentes listos para usar

### 🔐 Funcionalidades
- **[ROLE_BASED_NAVIGATION.md](./ROLE_BASED_NAVIGATION.md)** - Sistema de navegación por roles
- **[SPECIAL_ACCESS.md](./SPECIAL_ACCESS.md)** - Usuarios con acceso especial
- **[FLOATING_MENUS.md](./FLOATING_MENUS.md)** - Menús flotantes de navegación
- **[PORTFOLIO_FEATURES.md](./PORTFOLIO_FEATURES.md)** - Funcionalidades del portafolio

### 📱 Responsive y Accesibilidad
- **[RESPONSIVE_ACCESSIBILITY_SUMMARY.md](./RESPONSIVE_ACCESSIBILITY_SUMMARY.md)** - 📊 Resumen ejecutivo
- **[RESPONSIVE_GUIDE.md](./RESPONSIVE_GUIDE.md)** - Guía completa de diseño responsive
- **[RESPONSIVE_EXAMPLES.md](./RESPONSIVE_EXAMPLES.md)** - Ejemplos prácticos de componentes responsive
- **[ACCESSIBILITY.md](./ACCESSIBILITY.md)** - Cumplimiento WCAG 2.1 AA

### 🛠️ Guías Técnicas
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Guía completa de pruebas
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Guía de migración al sistema de diseño

---

## ✨ Características Principales

### 📱 Diseño Responsive Completo
- ✅ **Mobile First:** Optimizado para 375px (iPhone SE)
- ✅ **Tablet:** Adaptado para 768px (iPad)
- ✅ **Desktop:** Perfecto en 1024px y 1440px
- ✅ **Touch Targets:** Mínimo 44x44px (WCAG 2.5.5)
- ✅ **Microinteracciones:** Feedback táctil en todos los botones
- ✅ **Navegación Adaptativa:** Hamburger en móvil, sidebar fijo en desktop

### ♿ Accesibilidad (WCAG 2.1 AA)
- ✅ **Contraste de Color:** Mínimo 4.5:1 en todos los textos
- ✅ **Navegación por Teclado:** Focus visible y tab order lógico
- ✅ **Screen Readers:** Semántica HTML5 y ARIA labels
- ✅ **Reduced Motion:** Respeta preferencias del usuario
- ✅ **Skip Links:** Saltar al contenido principal

### 🎨 Sistema de Diseño Profesional
- ✅ **Tokens CSS:** Variables CSS reutilizables
- ✅ **Paleta Financiera:** Azules corporativos, verde/rojo para estados
- ✅ **Tipografía Escalable:** Sistema de 8 tamaños (xs - 6xl)
- ✅ **Componentes:** 30+ componentes base de ShadCN
- ✅ **Dark Mode:** Soporte completo (opcional)

### 🔐 Sistema de Roles
- ✅ **Usuario Normal:** Dashboard, Trading, Portafolio, Historial
- ✅ **Administrador:** Panel Admin, Gestión de Usuarios, Actividad del Sistema
- ✅ **Navegación Dinámica:** Sidebar diferente según rol
- ✅ **Acceso Especial:** Usuarios específicos sin validación de contraseña

---

## 🎨 Sistema de Diseño

### Paleta de Colores

#### **Brand Colors (Azules Corporativos)**
- **Primario:** `#1e40af` - Azul oscuro corporativo
- **Secundario:** `#3b82f6` - Azul brillante

#### **Financial States**
- **Positivo:** `#10b981` - Verde (ganancias)
- **Negativo:** `#ef4444` - Rojo (pérdidas)
- **Neutral:** `#6b7280` - Gris (sin cambio)

#### **Neutrales**
Escala completa de grises de `#f8fafc` (50) a `#0f172a` (900)

### Tipografía

- **Font Sans:** Sistema nativo (-apple-system, Segoe UI, Roboto...)
- **Weights:** Normal (400), Medium (500), Semibold (600), Bold (700)
- **Escala:** 12px - 60px (xs - 6xl)

### Espaciado

Escala consistente de 4px a 128px usando múltiplos de 4px.

### Componentes

- ✅ Buttons (Primary, Secondary, Ghost, Outline, Destructive)
- ✅ Cards (Default, Hover, Elevated)
- ✅ Forms (Input, Select, Textarea, Checkbox, Radio, Switch)
- ✅ Badges (Positivo, Negativo, Neutral, Status)
- ✅ Tables (Basic, Striped, Interactive)
- ✅ Modals/Dialogs
- ✅ Navigation (Breadcrumbs, Tabs, Pagination)

---

## 🏗️ Estructura del Proyecto

```
tikalinvest/
├── App.tsx                      # Aplicación principal
├── styles/
│   └── globals.css              # Sistema de diseño completo
├── components/
│   ├── ui/                      # Componentes base (ShadCN)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   └── ... (30+ componentes)
│   ├── common/                  # Componentes reutilizables
│   │   ├── FloatingDevMenu.tsx
│   │   ├── FloatingUserMenu.tsx
│   │   ├── Logo.tsx
│   │   ├── StatCard.tsx
│   │   ├── StockCard.tsx
│   │   ├── PortfolioCard.tsx
│   │   └── TransactionCard.tsx
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── screens/                 # Pantallas principales
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── EmailVerification.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── SecurityQuestions.tsx
│   │   ├── Dashboard.tsx
│   │   ├── MarketCatalog.tsx
│   │   ├── Trading.tsx
│   │   ├── Portfolio.tsx
│   │   ├── History.tsx
│   │   ├── Settings.tsx
│   │   └── Admin.tsx
│   └── utilities/               # Utilidades
│       └── ImageWithFallback.tsx
└── ... (archivos de configuración)
```

---

## 🚀 Quick Start

### 1. Usar el Sistema de Diseño

```tsx
import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Total</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">$45,231.89</p>
        <Badge variant="positive">+12.5%</Badge>
      </CardContent>
    </Card>
  );
}
```

### 2. Usar Tokens CSS

```tsx
// Tailwind Classes (recomendado)
<div className="bg-brand-primary text-white p-6 rounded-lg">
  Contenido
</div>

// CSS Variables
<div style={{ backgroundColor: 'var(--brand-primary)' }}>
  Contenido
</div>
```

### 3. Componentes Financieros

```tsx
// Badge de ganancia
<Badge className="bg-financial-positive-light text-financial-positive">
  +5.23%
</Badge>

// Badge de pérdida
<Badge className="bg-financial-negative-light text-financial-negative">
  -2.45%
</Badge>
```

---

## 🎯 Características Principales

### ✅ Landing Page
- Hero section con CTA
- Características destacadas
- Sección de beneficios
- Footer completo

### ✅ Sistema de Autenticación
- Login con validación
- Registro de usuarios
- Verificación de email
- Recuperación de contraseña
- Preguntas de seguridad

### ✅ Dashboard de Usuario
- Resumen de balance
- Gráfico de performance
- Top acciones
- Actividad reciente
- Widgets interactivos

### ✅ Catálogo de Mercado
- Lista de acciones disponibles
- Filtros y búsqueda
- Información en tiempo real (mock)
- Indicadores de precio

### ✅ Trading
- Compra y venta de acciones
- Gráficos interactivos (intradía/histórico)
- Libro de órdenes
- Noticias relacionadas
- Calculadora de inversión

### ✅ Portafolio
- Lista de activos con métricas
- Modal de detalle por acción
- Gráficos de rendimiento
- Órdenes abiertas
- Acciones rápidas (comprar/vender)

### ✅ Historial de Transacciones
- Tabla completa de transacciones
- Filtros por tipo y fecha
- Badges de estado
- Exportación de datos (mock)

### ✅ Configuración
- Perfil de usuario
- Preferencias
- Seguridad
- Notificaciones

### ✅ Panel Administrativo
- Gestión de usuarios
- Estadísticas globales
- Transacciones del sistema
- Controles de plataforma

---

## 🎨 Tokens Principales

### Colores

```css
/* Brand */
--brand-primary: #1e40af
--brand-secondary: #3b82f6

/* Financial */
--financial-positive: #10b981
--financial-negative: #ef4444
--financial-neutral: #6b7280

/* Neutrals */
--neutral-50: #f8fafc
--neutral-100: #f1f5f9
--neutral-500: #64748b
--neutral-900: #0f172a

/* Semantic */
--success: #10b981
--danger: #ef4444
--warning: #f59e0b
--info: #06b6d4
```

### Espaciado

```css
--spacing-2: 0.5rem    /* 8px */
--spacing-4: 1rem      /* 16px */
--spacing-6: 1.5rem    /* 24px */
--spacing-8: 2rem      /* 32px */
```

### Tipografía

```css
--text-sm: 0.875rem    /* 14px */
--text-base: 1rem      /* 16px */
--text-xl: 1.25rem     /* 20px */
--text-2xl: 1.5rem     /* 24px */
--text-4xl: 2.25rem    /* 36px */
```

---

## 🔐 Acceso Especial

### Usuarios Preconfigurados

**Admin (sin contraseña):**
- Email: `aherreraa5@miumg.edu.gt`
- Password: Cualquiera

**Usuario (sin contraseña):**
- Email: `andersonaguirre793@gmail.com`
- Password: Cualquiera

**Demo (con contraseña):**
- Email: `demo@tikalinvest.com`
- Password: `demo123`

**Admin Demo (con contraseña):**
- Email: `admin@tikalinvest.com`
- Password: `admin123`

Ver [SPECIAL_ACCESS.md](./SPECIAL_ACCESS.md) para más detalles.

---

## 🧭 Navegación

### Menús Flotantes

**FloatingDevMenu** (esquina inferior izquierda)
- Navegación rápida entre pantallas
- Credenciales de prueba visibles
- Badge de rol actual
- Botón compacto/expandido

**FloatingUserMenu** (esquina inferior derecha)
- Acceso rápido a perfil
- Configuración
- Logout
- Solo visible cuando está autenticado

Ver [FLOATING_MENUS.md](./FLOATING_MENUS.md) para más detalles.

---

## 📱 Responsive Design

El sistema está diseñado mobile-first con breakpoints:

```tsx
<div className="
  p-4       /* Mobile */
  sm:p-6    /* Tablet: 640px+ */
  md:p-8    /* Desktop: 768px+ */
  lg:p-10   /* Large: 1024px+ */
  xl:p-12   /* XL: 1280px+ */
">
  Contenido responsive
</div>
```

---

## 🌙 Dark Mode

El sistema soporta dark mode automático:

```tsx
// Se aplica automáticamente según la clase .dark
<div className="bg-background text-foreground">
  {/* Cambia automáticamente en dark mode */}
</div>
```

Toggle manual:
```tsx
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </Button>
  );
}
```

---

## 🎯 Mejores Prácticas

### Al crear componentes:

1. ✅ Usar tokens de color (no hardcoded)
2. ✅ Implementar estados: hover, focus, disabled
3. ✅ Responsive design (mobile-first)
4. ✅ Dark mode support
5. ✅ Accesibilidad (ARIA, keyboard, focus)
6. ✅ Transiciones suaves (200ms default)
7. ✅ Consistencia con espaciado
8. ✅ Tipografía según jerarquía

### Al diseñar pantallas:

1. ✅ Jerarquía visual clara
2. ✅ Espacio en blanco adecuado
3. ✅ Agrupación lógica de elementos
4. ✅ CTAs destacados (brand-primary)
5. ✅ Información financiera clara (verde/rojo)
6. ✅ Estados de carga y error
7. ✅ Responsive en todos los breakpoints
8. ✅ Navegación intuitiva

---

## 📊 Métricas de Diseño

### Performance
- ✅ CSS-in-CSS (mejor que CSS-in-JS)
- ✅ Tokens reutilizables (consistencia)
- ✅ Componentes optimizados
- ✅ Transiciones performantes

### Accesibilidad
- ✅ Contraste 4.5:1 mínimo
- ✅ Focus states visibles
- ✅ ARIA labels
- ✅ Keyboard navigation

### Consistencia
- ✅ Paleta limitada (disciplina)
- ✅ Espaciado en múltiplos de 4px
- ✅ Tipografía escalada
- ✅ Border radius consistente

---

## 🔧 Personalización

### Cambiar colores brand

Edita `/styles/globals.css`:

```css
:root {
  --brand-primary: #TU_COLOR;
  --brand-secondary: #TU_COLOR;
}
```

### Cambiar tipografía

```css
:root {
  --font-sans: 'Tu Fuente', sans-serif;
}
```

### Extender tokens

Agrega nuevos tokens en `/styles/globals.css` y úsalos:

```css
:root {
  --mi-nuevo-token: #valor;
}

@theme inline {
  --color-mi-nuevo-token: var(--mi-nuevo-token);
}
```

```tsx
<div className="bg-[var(--mi-nuevo-token)]">
  Contenido
</div>
```

---

## 🎓 Recursos de Aprendizaje

### Documentación Interna
- [Sistema de Diseño Completo](./DESIGN_SYSTEM.md)
- [Tokens CSS](./DESIGN_TOKENS.md)
- [Ejemplos de Componentes](./COMPONENT_EXAMPLES.md)

### Herramientas Externas
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Recharts](https://recharts.org/)

### Inspiración
- [ShadCN UI](https://ui.shadcn.com/)
- [Vercel Design](https://vercel.com/design)
- [Linear App](https://linear.app/)

---

## 🤝 Contribución

### Agregar un nuevo componente

1. Crear componente en `/components/ui/` o `/components/common/`
2. Usar tokens del sistema de diseño
3. Implementar todos los estados (hover, focus, disabled)
4. Agregar ejemplo a `COMPONENT_EXAMPLES.md`
5. Documentar props y uso

### Agregar un nuevo token

1. Definir en `/styles/globals.css` en `:root`
2. Agregar versión dark mode en `.dark` si aplica
3. Mapear en `@theme inline`
4. Documentar en `DESIGN_TOKENS.md`
5. Agregar ejemplos de uso

---

## 📄 Licencia

Proyecto TikalInvest - Plataforma de Inversión  
© 2024 - Todos los derechos reservados

---

## 🎉 Créditos

- **Diseño:** Sistema de diseño TikalInvest
- **UI Components:** ShadCN UI + Radix UI
- **Iconos:** Lucide React
- **Gráficos:** Recharts
- **Framework:** React + Tailwind CSS v4.0

---

## 📞 Soporte

Para preguntas sobre el sistema de diseño o implementación:

1. Consulta la documentación en `/DESIGN_SYSTEM.md`
2. Busca ejemplos en `/COMPONENT_EXAMPLES.md`
3. Revisa tokens en `/DESIGN_TOKENS.md`
4. Contacta al equipo de desarrollo

---

**¡Sistema completo y listo para producción!** 🚀
