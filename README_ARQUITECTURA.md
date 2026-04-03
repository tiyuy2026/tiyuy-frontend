# 📘 Tiyuy Frontend - Guía Completa de Arquitectura

> **Arquitectura Hexagonal (Clean Architecture)** aplicada a Next.js 14 con TypeScript
> 
> **Proyecto:** Tiyuy - Plataforma Inmobiliaria Social
>
> **Módulos cubiertos:** Clientes (CRM), Contactos, Grupos, Propiedades, Proyectos, Billetera, Favoritos, Perfil

---

## 📂 Estructura Completa del Proyecto

```
Tiyuy-frontend/
├── .next/                      # Build de Next.js (auto-generado)
├── node_modules/               # Dependencias npm
├── public/                     # Archivos estáticos públicos
├── src/                        # CÓDIGO FUENTE PRINCIPAL
│   ├── app/                    # Next.js App Router - TODAS LAS PÁGINAS
│   ├── components/             # Componentes globales (legacy)
│   ├── config/                 # Configuraciones (Firebase, env, rutas)
│   ├── core/                   # 🧠 DOMINIO/LÓGICA DE NEGOCIO
│   │   ├── domain/entities/    # 20 entidades (User, Property, Group, etc.)
│   │   ├── domain/use-cases/   # Lógica de negocio por módulo
│   │   └── domain/repositories/# Interfaces (18 contratos)
│   ├── hooks/                  # Hooks globales (legacy)
│   ├── infrastructure/         # 🔧 IMPLEMENTACIONES TÉCNICAS
│   │   ├── repositories/       # 20 implementaciones (axios)
│   │   ├── api/                # Configuración axios, WebSocket
│   │   └── storage/            # localStorage, cookies
│   ├── presentation/           # 🎨 UI REACT
│   │   ├── components/         # 147 componentes organizados por módulo
│   │   ├── hooks/              # 32 hooks (useGroups, useAuth, etc.)
│   │   └── store/              # Estado global Zustand
│   ├── services/               # Servicios externos (Email)
│   ├── styles/                 # Estilos globales
│   ├── utils/                  # Utilidades (formatters)
│   └── middleware.ts         # Middleware Next.js
├── tests/                      # 🧪 Tests (unit + integration)
├── .env.local                  # Variables locales
├── .env.production             # Variables producción
├── MAPEO_CAMPOS.md            # Mapeo de campos API
└── next.config.ts             # Config Next.js
```

---

## 🏗️ Arquitectura Hexagonal - Las 4 Capas

```
┌─────────────────────────────────────────────────────────────┐
│  4. APP LAYER (Next.js)                                     │
│  Rutas, páginas, middleware, API routes                     │
├─────────────────────────────────────────────────────────────┤
│  3. PRESENTATION LAYER (React)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Components  │  │    Hooks     │  │    Store     │       │
│  │   (UI)       │  │  (Lógica)    │  │  (Zustand)   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
├─────────────────────────────────────────────────────────────┤
│  2. INFRASTRUCTURE LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Repositories │  │     API      │  │   Storage    │       │
│  │  (Impl)      │  │  (axios)     │  │(localStorage)│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
├─────────────────────────────────────────────────────────────┤
│  1. CORE/DOMAIN LAYER (Centro - Independiente)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Entities   │  │  Use Cases   │  │ Repositories │       │
│  │   (Models)   │  │   (Logic)    │  │(Interfaces)  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
          ↑
    Las dependencias apuntan
    SIEMPRE hacia el centro
```

### Regla de Oro:
> **El CORE no depende de nada externo. No sabe de React, ni de axios, ni de Next.js.**

---

## 📁 EXPLICACIÓN DETALLADA DE CADA CARPETA

---

### 🧠 `src/core/` - DOMINIO/LÓGICA DE NEGOCIO

**¿Qué contiene?** Todo el código que define QUÉ hace la aplicación, sin depender de tecnologías.

#### `src/core/domain/entities/` - Modelos de Datos (20 entidades)

| Archivo | Propósito | Campos Clave |
|---------|-----------|--------------|
| `User.ts` | Usuario del sistema | `id`, `name`, `email`, `role` (AGENT/CLIENT/ADMIN) |
| `Agent.ts` | Agente inmobiliario | `userId`, `specialization`, `clients` |
| `Client.ts` | Cliente potencial | `agentId`, `status`, `totalInteractions` |
| `CRM.ts` | Datos del CRM | `interactionScore`, `engagementRate`, `activity` |
| `Property.ts` | Propiedad inmobiliaria | `id`, `title`, `price`, `location`, `type` |
| `Project.ts` | Proyecto inmobiliario | `id`, `name`, `developer`, `properties[]` |
| `Group.ts` | Grupo social | `id`, `name`, `memberCount`, `postCount`, `isUserMember` |
| `GroupPost.ts` | Post en grupo | `id`, `content`, `likes`, `comments[]`, `shares` |
| `Contact.ts` | Contacto/Chat | `id`, `name`, `lastMessage`, `unreadCount` |
| `Favorite.ts` | Favorito del usuario | `propertyId`, `userId`, `addedAt` |
| `Wallet.ts` | Billetera/Finanzas | `balance`, `transactions[]`, `pendingAmount` |
| `Activity.ts` | Actividad del usuario | `type`, `description`, `timestamp` |
| `Notification.ts` | Notificación | `type`, `message`, `isRead`, `actionUrl` |
| `Profile.ts` | Perfil de usuario | `avatar`, `bio`, `preferences` |
| `KycVerification.ts` | Verificación KYC | `status`, `documentType`, `verifiedAt` |
| `Moderation.ts` | Moderación de contenido | `reportType`, `status`, `moderatorNotes` |
| `Analytics.ts` | Datos analíticos | `metrics`, `period`, `dataPoints` |
| `PropertyFilter.ts` | Filtros de búsqueda | `priceRange`, `location`, `type`, `amenities` |
| `ValidateDni.ts` | Validación de DNI | `dni`, `isValid`, `validationData` |

#### `src/core/domain/use-cases/` - Casos de Uso

**Archivos y carpetas:**

| Archivo/Carpeta | Propósito | Operaciones Principales |
|-----------------|-----------|------------------------|
| `GroupUseCases.ts` | Gestión de grupos | `createGroup`, `joinGroup`, `leaveGroup`, `getGroupPosts`, `createPost`, `deletePost` |
| `AgentClientsUseCases.ts` | CRM de agentes | `getClients`, `analyzeClientActivity`, `calculateMetrics` |
| `auth/` | Autenticación | `login`, `register`, `logout`, `resetPassword`, `verifyToken` |
| `finance/` | Finanzas/Billetera | `getBalance`, `addFunds`, `withdraw`, `getTransactions` |
| `identity/` | Verificación identidad | `verifyDni`, `uploadDocument`, `checkVerificationStatus` |
| `interaction/` | Interacciones sociales | `likePost`, `commentPost`, `sharePost`, `reactToMessage` |
| `project/` | Proyectos inmobiliarios | `createProject`, `addPropertyToProject`, `getProjectDetails` |

#### `src/core/domain/repositories/` - Interfaces (18 contratos)

- `GroupRepository.ts` - Operaciones de grupos
- `ContactRepository.ts` - Chats y mensajes
- `AgentClientsRepository.ts` - Clientes del agente
- `PropertyRepository.ts` - Propiedades
- `ProjectRepository.ts` - Proyectos
- `FinanceRepository.ts` - Finanzas
- `AuthRepository.ts` - Autenticación
- `FavoriteRepository.ts` - Favoritos
- `KycRepository.ts` - Verificación KYC
- `ActivityRepository.ts` - Actividades
- `NotificationRepository.ts` - Notificaciones
- `ModerationRepository.ts` - Moderación
- `AnalyticsRepository.ts` - Analíticas
- `AgentRepository.ts` - Agentes
- `IdentityRepository.ts` - Identidad
- `ProfileRepository.ts` - Perfil
- `PaymentRepository.ts` - Pagos
- `SearchTrackingRepository.ts` - Tracking búsquedas

---

### 🔧 `src/infrastructure/` - IMPLEMENTACIÓN TÉCNICA

**¿Qué contiene?** CÓMO se implementan las interfaces del core usando tecnologías concretas.

#### `src/infrastructure/repositories/` - Implementaciones (20 archivos)

| Archivo | Implementa | Endpoints API |
|---------|-----------|---------------|
| `GroupRepositoryImpl.ts` | GroupRepository | `/contacts/extended/groups/*` |
| `ContactRepository.ts` | ContactRepository | `/contacts/*`, `/messages/*` |
| `AgentClientsRepository.ts` | AgentClientsRepository | `/agent/clients/*` |
| `PropertyRepository.ts` | PropertyRepository | `/properties/*` |
| `ProjectRepository.ts` | ProjectRepository | `/projects/*` |
| `FinanceRepository.ts` | FinanceRepository | `/wallet/*`, `/finance/*` |
| `AuthRepository.ts` | AuthRepository | `/auth/*` |
| `FavoriteRepository.ts` | FavoriteRepository | `/favorites/*` |
| `PaymentRepository.ts` | PaymentRepository | `/payments/*` |
| `KycRepository.ts` | KycRepository | `/kyc/*` |
| `ActivityRepository.ts` | ActivityRepository | `/activity/*` |
| `ModerationRepository.ts` | ModerationRepository | `/moderation/*` |
| `AnalyticsRepository.ts` | AnalyticsRepository | `/analytics/*` |
| `AgentRepository.ts` | AgentRepository | `/agent/*` |
| `IdentityRepository.ts` | IdentityRepository | `/identity/*` |
| `ProfileRepository.ts` | ProfileRepository | `/profile/*` |
| `NotificationRepository.ts` | NotificationRepository | `/notifications/*` |
| `SearchTrackingRepository.ts` | SearchTrackingRepository | `/tracking/*` |

#### `src/infrastructure/api/`

- `axiosClient.ts` - Instancia configurada de axios con interceptores
- `endpoints.ts` - URLs de endpoints centralizadas
- `websocket.ts` - Configuración WebSocket

#### `src/infrastructure/storage/`

- `localStorage.ts` - Wrapper tipado de localStorage
- `cookies.ts` - Manejo de cookies

---

### 🎨 `src/presentation/` - UI REACT

**¿Qué contiene?** Todo lo relacionado con React, componentes, estado y hooks.

#### `src/presentation/hooks/` - Hooks (32 hooks)

| Hook | Propósito | Módulo |
|------|-----------|--------|
| `useGroups.ts` | CRUD de grupos, posts, comentarios | Grupos |
| `useContacts.ts` | Chats, mensajes, contactos, eventos | Contactos |
| `useClientCRM.ts` | Análisis de clientes, métricas, heatmap | CRM |
| `useAuth.ts` | Login, registro, logout, sesión | Auth |
| `useProperties.ts` | Propiedades, filtros, búsqueda | Propiedades |
| `useProjects.ts` | Proyectos inmobiliarios | Proyectos |
| `useFinance.ts` | Billetera, transacciones | Finanzas |
| `useFavorites.ts` | Favoritos del usuario | Favoritos |
| `useAgent.ts` | Datos del agente | Agentes |
| `useAnalytics.ts` | Analíticas y métricas | Analíticas |
| `useKyc.ts` | Verificación de identidad | KYC |
| `useIdentity.ts` | Datos de identidad | Identidad |
| `useProfile.ts` | Perfil de usuario | Perfil |
| `usePayments.ts` | Pagos y transacciones | Pagos |
| `useModeration.ts` | Moderación de contenido | Moderación |
| `useNotifications.ts` | Notificaciones | Notificaciones |
| `useActivity.ts` | Actividad del usuario | Actividad |
| `useAgentClients.ts` | Clientes del agente | CRM |
| `useWebSocket.ts` | Conexión WebSocket | Tiempo real |
| `useGoogleAuth.ts` | Autenticación Google | Auth |
| `useOnboarding.ts` | Onboarding de usuarios | Onboarding |
| `useTrialStatus.ts` | Estado de prueba | Suscripción |

#### `src/presentation/store/` - Estado Global (Zustand)

- `authStore.ts` - Usuario autenticado, token, permisos
- `uiStore.ts` - Estado de UI (modales, tema, sidebar)
- `notificationStore.ts` - Notificaciones globales
- `chatStore.ts` - Estado de chats activos
- `contactStore.ts` - Estado de contactos
- `groupStore.ts` - Estado de grupos
- `propertyStore.ts` - Estado de propiedades

#### `src/presentation/components/` - Componentes (147 componentes)

**Subcarpetas:**
- `auth/` - Login, registro, recuperación
- `common/` - Botones, inputs, modales reutilizables
- `layout/` - Sidebar, Header, DashboardLayout
- `groups/` - GroupCard, PostCard, CommentItem, ShareModal
- `contacts/` - ContactList, ChatWindow, MessageBubble
- `crm/` - ClientCard, ClientMetrics, ActivityHeatmap
- `properties/` - PropertyCard, PropertyGrid, PropertyFilter
- `projects/` - ProjectCard, ProjectList
- `wallet/` - BalanceCard, TransactionList
- `favorites/` - FavoritesGrid
- `profile/` - ProfileForm, AvatarUpload, KycStatus
- `notifications/` - NotificationList
- `moderation/` - ReportForm

---

### 📱 `src/app/` - NEXT.JS APP ROUTER

**Estructura de Rutas:**

```
app/
├── (auth)/                    # Rutas de autenticación
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
│
├── (dashboard)/               # Rutas protegidas
│   ├── layout.tsx             # Layout con Sidebar
│   ├── page.tsx               # Dashboard principal
│   │
│   ├── dashboard/
│   │   ├── clientes/          # 📊 CRM DE CLIENTES
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── components/
│   │   │       ├── CRMMetricsCharts.tsx
│   │   │       ├── ClientActivityHeatmap.tsx
│   │   │       ├── ClientList.tsx
│   │   │       └── ClientInsightsPanel.tsx
│   │   │
│   │   ├── mis-contactos/     # 💬 CONTACTOS, GRUPOS, EVENTOS
│   │   │   ├── page.tsx
│   │   │   ├── grupos/
│   │   │   │   ├── components/
│   │   │   │   │   ├── GruposListPanel.tsx
│   │   │   │   │   ├── GruposMisGruposView.tsx
│   │   │   │   │   ├── DiscoverGroupsView.tsx
│   │   │   │   │   ├── GrupoDetailPanel.tsx
│   │   │   │   │   ├── GrupoPostsPanel.tsx
│   │   │   │   │   └── NewGroupModal.tsx
│   │   │   ├── canales/
│   │   │   └── eventos/
│   │   │
│   │   ├── mis-propiedades/   # 🏠 PROPIEDADES
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │
│   │   ├── proyectos/         # 🏗️ PROYECTOS
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │
│   │   ├── billetera/         # 💰 FINANZAS
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │
│   │   ├── favoritos/         # ⭐ FAVORITOS
│   │   │   └── page.tsx
│   │   │
│   │   └── perfil/            # 👤 PERFIL
│   │       ├── page.tsx
│   │       └── components/
```

---

### 🔧 OTRAS CARPETAS

#### `src/components/` - Componentes Globales (legacy)
- `FirebaseTest.tsx` - Componente de prueba Firebase
- `StatusInput.tsx` - Input de estado con estilos avanzados

#### `src/hooks/` - Hooks Globales (legacy/migrando)
- `useTiyuyContacts.ts` - Hook legacy de contactos
- `useUserValidation.ts` - Validación de usuarios

#### `src/config/` - Configuraciones
- `constants.ts` - Constantes de la aplicación
- `env.ts` - Variables de entorno tipadas
- `firebase.ts` - Configuración Firebase
- `routes.ts` - Definición de rutas

#### `src/services/` - Servicios Externos
- `brevoService.ts` - Servicio de email Brevo (Sendinblue)
- `emailService.ts` - Servicio de emails genérico

#### `src/utils/` - Utilidades
- `formatters.ts` - Formateo de fechas, monedas, números

#### `src/styles/` - Estilos Globales
- Archivos CSS/SCSS globales

#### `src/middleware.ts` - Middleware Next.js
- Protección de rutas, redirecciones, headers

#### `tests/` - Tests
- `unit/` - Tests unitarios
- `integration/` - Tests de integración

---

## 📋 MÓDULOS DE LA APLICACIÓN

### 1️⃣ CLIENTES (CRM)
**Ubicación:** `src/app/(dashboard)/dashboard/clientes/`

**Propósito:** CRM para agentes inmobiliarios. Analiza actividad de clientes.

**Fuentes de datos:** Mensajes, Grupos, Canales, Eventos, Propiedades

**Componentes:** `CRMMetricsCharts.tsx`, `ClientActivityHeatmap.tsx`, `ClientList.tsx`, `ClientInsightsPanel.tsx`

**Hook:** `useClientCRM.ts`

**Entidades:** `CRM.ts`, `Client.ts`

---

### 2️⃣ MIS CONTACTOS
**Ubicación:** `src/app/(dashboard)/dashboard/mis-contactos/`

**Sub-módulos:**
- **GRUPOS** - Sistema social tipo Facebook (`grupos/`)
  - Componentes: `GruposListPanel.tsx`, `GruposMisGruposView.tsx`, `DiscoverGroupsView.tsx`, `GrupoDetailPanel.tsx`, `GrupoPostsPanel.tsx`
  - Regla: 1 grupo activo máximo por usuario
- **CANALES** - Suscripción a canales de agentes
- **EVENTOS** - Eventos inmobiliarios con RSVP

**Hook:** `useContacts.ts`

---

### 3️⃣ MIS PROPIEDADES
**Ubicación:** `src/app/(dashboard)/dashboard/mis-propiedades/`

**Componentes:** `PropertyList.tsx`, `PropertyGrid.tsx`, `PropertyFilterPanel.tsx`, `PropertyMap.tsx`

**Entidad:** `Property.ts`

**Hook:** `useProperties.ts`

---

### 4️⃣ PROYECTOS
**Ubicación:** `src/app/(dashboard)/dashboard/proyectos/`

**Entidad:** `Project.ts`

**Hook:** `useProjects.ts`

---

### 5️⃣ BILLETERA
**Ubicación:** `src/app/(dashboard)/dashboard/billetera/`

**Entidad:** `Wallet.ts`

**Hooks:** `useFinance.ts`, `usePayments.ts`

---

### 6️⃣ FAVORITOS
**Ubicación:** `src/app/(dashboard)/dashboard/favoritos/`

**Entidad:** `Favorite.ts`

**Hook:** `useFavorites.ts`

---

### 7️⃣ PERFIL
**Ubicación:** `src/app/(dashboard)/dashboard/perfil/`

**Entidades:** `Profile.ts`, `KycVerification.ts`, `User.ts`

**Hooks:** `useProfile.ts`, `useKyc.ts`

---

## 📋 CONVENCIONES Y BUENAS PRÁCTICAS

### 1. **Nombres de archivos**

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Entidades | PascalCase.ts | `Group.ts` |
| Use Cases | PascalCase.ts | `GroupUseCases.ts` |
| Repositories | Tipo + Repository.ts | `GroupRepositoryImpl.ts` |
| Hooks | use + PascalCase.ts | `useGroups.ts` |
| Components | PascalCase.tsx | `GroupList.tsx` |

### 2. **Imports (orden)**

```typescript
// 1. React/Next
import { useState } from 'react';
import Link from 'next/link';

// 2. Librerías externas
import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';

// 3. Core (entities, use-cases)
import { Group } from '@/core/domain/entities/Group';
import { GroupUseCases } from '@/core/domain/use-cases/GroupUseCases';

// 4. Infrastructure
import { GroupRepositoryImpl } from '@/infrastructure/repositories/GroupRepositoryImpl';

// 5. Presentation
import { useAuthStore } from '@/presentation/store/authStore';
```

### 3. **Manejo de errores**

```typescript
// En Use Cases: Lanzar errores específicos
if (userOwnedGroups.length > 0) {
  throw new Error('GROUP_LIMIT_EXCEEDED');
}

// En Hooks: Capturar y transformar
try {
  await createGroup.mutateAsync(data);
} catch (error: any) {
  if (error.message === 'GROUP_LIMIT_EXCEEDED') {
    alert('Ya tienes un grupo creado');
  }
}
```

### 4. **Datos siempre dinámicos**

**PROHIBIDO:**
- Datos hardcodeados
- Math.random() para datos de UI
- Placeholders que no vienen del backend

**OBLIGATORIO:**
- Todo viene de la API
- Fallbacks con `|| 0` o `?? []`
- Estados de loading y error

---

## 🧪 CÓMO TESTEAR

### Testear Use Cases (sin React)

```typescript
// test/GroupUseCases.test.ts
import { GroupUseCases } from '@/core/domain/use-cases/GroupUseCases';

// Mock del repositorio
const mockRepo = {
  createGroup: jest.fn(),
  getUserGroups: jest.fn(),
};

const useCases = new GroupUseCases(mockRepo);

test('no permite crear grupo sin nombre', async () => {
  await expect(
    useCases.createGroup({ name: '', description: 'test' })
  ).rejects.toThrow('El nombre debe tener al menos 3 caracteres');
});
```

---

## 🆘 CHECKLIST PARA NUEVOS DESARROLLADORES

Antes de modificar código:

- [ ] ¿Entiendo qué capa estoy editando?
- [ ] ¿Estoy usando el repositorio correcto?
- [ ] ¿Mis datos vienen de la API (no hardcodeados)?
- [ ] ¿Agregué manejo de errores?
- [ ] ¿Los tipos TypeScript están correctos?
- [ ] ¿No estoy rompiendo la regla de dependencias?

---

## 📞 ¿PREGUNTAS?

**Si no entiendes algo:**
1. Lee el archivo `src/core/domain/use-cases/` del módulo
2. Mira el hook en `src/presentation/hooks/`
3. Revisa un componente que lo use
4. Sigue el flujo de datos paso a paso

**Recuerda:**
> La arquitectura hexagonal parece "más código" al inicio, pero escala mejor, es más testeable, y permite cambiar tecnologías sin reescribir la lógica de negocio.

---

**Versión:** 2.0 - Documentación Completa de TODOS los Módulos  
**Última actualización:** Abril 2026  
**Autor:** Tiyuy Development Team

> **Recuerda:** La arquitectura hexagonal nos permite cambiar tecnologías sin reescribir la lógica de negocio. El Core siempre permanece estable.
