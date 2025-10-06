# JAI-VIER Task Management System - Versión Demo

## Descripción

Esta es la versión demo del sistema de gestión de tareas JAI-VIER. Se ha eliminado la autenticación y el backend para que funcione completamente con datos mock en el frontend.

## Cambios Realizados

### 1. **Datos Mock**
- ✅ Creado archivo `src/data/mockData.json` con datos de ejemplo:
  - 3 usuarios
  - 3 proyectos
  - 4 sprints
  - 10 tareas

### 2. **Servicios Mock**
- ✅ Implementado `src/services/mockService.ts` con servicios completos para:
  - TaskService
  - ProjectService
  - SprintService
  - UserService
- ✅ Todos los servicios simulan llamadas asíncronas con delay de red
- ✅ Los datos persisten en memoria durante la sesión

### 3. **Autenticación Eliminada**
- ✅ Reemplazado `BackendAuthContext` por `MockAuthContext`
- ✅ Eliminado componente de login
- ✅ Simplificado `ProtectedRoute` para permitir acceso sin autenticación
- ✅ Removido botón de "Cerrar sesión" del header

### 4. **Servicios API Actualizados**
- ✅ `src/services/api/index.ts` ahora exporta servicios mock
- ✅ Todos los componentes funcionan sin cambios usando los mismos nombres de servicios

## Cómo Ejecutar

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

## Características Disponibles

### ✅ Funcionalidades Activas
- Dashboard con resumen de proyectos, sprints y tareas
- Vista de proyectos con CRUD completo
- Vista de tareas con filtros y búsqueda
- Vista de sprints
- Vista de equipo/usuarios
- Reportes (con datos mock)
- Modo oscuro/claro
- Animaciones GSAP

### ❌ Servicios Deshabilitados (Stubs)
- Comentarios
- Subtareas
- Asignación de tareas
- Miembros de proyecto
- Logs de trabajo

## Estructura de Archivos Importantes

```
src/
├── data/
│   └── mockData.json              # Datos de demostración
├── services/
│   ├── mockService.ts             # Servicios mock principales
│   ├── index.ts                   # Re-exporta servicios mock
│   └── api/
│       └── index.ts               # Punto de entrada de servicios
├── contexts/
│   └── MockAuthContext.tsx        # Contexto de autenticación simplificado
└── components/
    ├── layout/
    │   ├── MainLayout.tsx         # Layout principal (sin backend status)
    │   └── AppHeader.tsx          # Header sin logout
    └── auth/
        └── ProtectedRoute.tsx     # Simplificado para demo
```

## Modificar Datos Mock

Para modificar los datos de demostración, edita el archivo:
```
src/data/mockData.json
```

Los cambios se reflejarán automáticamente al recargar la página.

## Notas Técnicas

- **Persistencia**: Los datos solo persisten en memoria durante la sesión. Al recargar la página, se reinician.
- **Usuario por defecto**: Se usa el primer usuario del array `mockData.users` como usuario actual.
- **Rol por defecto**: El usuario tiene rol "ADMIN" para acceso completo.

## Próximos Pasos

Para volver a conectar con un backend:
1. Restaurar `BackendAuthContext` en lugar de `MockAuthContext`
2. Actualizar `src/services/api/index.ts` para usar servicios reales
3. Descomentar/restaurar componentes de autenticación
4. Configurar variables de entorno con la URL del backend

---

**Desarrollado para demostración - Sin backend requerido**
