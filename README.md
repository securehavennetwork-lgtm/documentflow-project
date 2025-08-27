# 📋 Sistema de Gestión de Documentos - DocumentFlow

## 🚀 **CONFIGURACIÓN COMPLETA PARA FUNCIONAMIENTO**

### **1. Requisitos del Sistema**
- Node.js 18+ 
- PostgreSQL 12+ (o usar base de datos gratuita como Neon, Supabase, etc.)
- Cuenta de Gmail para SMTP

### **2. Configuración de Base de Datos**

#### **Opción A: PostgreSQL Local**
```bash
# Instalar PostgreSQL
# Crear base de datos
createdb documentflow

# La URL sería:
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/documentflow
```

#### **Opción B: Base de Datos Gratuita en la Nube**
**Neon (Recomendado - Gratuito):**
1. Ir a https://neon.tech
2. Crear cuenta gratuita
3. Crear nuevo proyecto
4. Copiar la connection string

**Supabase (Alternativa):**
1. Ir a https://supabase.com
2. Crear proyecto gratuito
3. Ir a Settings > Database
4. Copiar connection string

### **3. Configuración SMTP (Gmail)**

#### **Paso 1: Habilitar autenticación de 2 factores**
1. Ir a tu cuenta de Google
2. Seguridad > Verificación en 2 pasos
3. Activar verificación en 2 pasos

#### **Paso 2: Generar contraseña de aplicación**
1. Google Account > Seguridad
2. Contraseñas de aplicaciones
3. Seleccionar "Correo" y "Otro"
4. Nombrar "DocumentFlow"
5. Copiar la contraseña generada (16 caracteres)

#### **Paso 3: Configurar variables de entorno**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=contraseña-de-aplicacion-de-16-caracteres
FROM_EMAIL=noreply@documentflow.com
```

### **4. Variables de Entorno Completas**

Crear archivo `client/.env`:
```env
# =========================
# 📧 Email Configuration
# =========================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion-gmail
FROM_EMAIL=noreply@documentflow.com

# =========================
# 🗄️ Database
# =========================
DATABASE_URL=postgresql://usuario:contraseña@host:5432/database

# =========================
# ⚙️ App Configuration
# =========================
APP_URL=http://localhost:5000
NODE_ENV=development
PORT=5000
```

### **5. Instalación y Ejecución**

```bash
# 1. Instalar dependencias
npm install

# 2. Crear las tablas de la base de datos
npm run db:push

# 3. Ejecutar en desarrollo
npm run dev

# 4. Para producción
npm run build
npm start
```

### **6. Estructura de Archivos**

```
📁 public/uploads/          # Archivos subidos (se crean automáticamente)
📁 data/                    # Respaldo de datos JSON (se crea automáticamente)
📁 server/
  📄 database.ts            # Conexión a base de datos
  📄 storage.ts             # Gestión de datos y archivos
  📄 routes.ts              # API endpoints
📁 client/src/
  📁 pages/                 # Páginas de la aplicación
  📁 components/            # Componentes reutilizables
```

## 🎯 **FUNCIONALIDADES IMPLEMENTADAS**

### **✅ Para Usuarios:**
- ✅ Subida de archivos (PDF, imágenes, videos)
- ✅ Captura con cámara
- ✅ Gestión de documentos personales
- ✅ Notificaciones por email
- ✅ Dashboard con estadísticas
- ✅ Fechas límite y recordatorios

### **✅ Para Administradores:**
- ✅ **Panel completo de control**
- ✅ **Ver TODOS los documentos de TODOS los usuarios**
- ✅ **Gestión completa de usuarios**
- ✅ **Estadísticas y reportes**
- ✅ **Control de estados de documentos**
- ✅ **Sistema de recordatorios**
- ✅ **Filtros y búsquedas avanzadas**

### **✅ Características Técnicas:**
- ✅ **Base de datos persistente** (no se pierde al reiniciar)
- ✅ **Funciona en cualquier computadora** (no localStorage)
- ✅ **Storage local gratuito** (no Firebase)
- ✅ **Todos los botones funcionan**
- ✅ **Sistema de emails completo**
- ✅ **API REST completa**

## 🔧 **SOLUCIONES IMPLEMENTADAS**

### **1. Eliminación de Firebase (Costoso)**
- ❌ Firebase Storage → ✅ Storage local en servidor
- ❌ Firebase Auth → ✅ Autenticación simple
- ❌ Firestore → ✅ PostgreSQL

### **2. Base de Datos Persistente**
- ❌ Memoria local → ✅ PostgreSQL con Drizzle ORM
- ✅ Funciona entre diferentes computadoras
- ✅ Los datos no se pierden al reiniciar

### **3. Panel de Administrador Completo**
- ✅ Ver documentos de TODOS los usuarios
- ✅ Filtrar por usuario, tipo, estado
- ✅ Cambiar estados de documentos
- ✅ Gestión completa de usuarios
- ✅ Estadísticas en tiempo real

### **4. Sistema de Archivos Mejorado**
- ✅ Subida hasta 50MB
- ✅ Soporte para PDF, imágenes, videos
- ✅ Organización por usuario
- ✅ URLs accesibles desde cualquier lugar

## 🚀 **CÓMO USAR EL SISTEMA**

### **Usuarios por Defecto:**
```
Administrador:
- Email: admin@documentflow.com
- Contraseña: (configurar en Firebase o sistema de auth)

Usuario Regular:
- Email: user@documentflow.com  
- Contraseña: (configurar en Firebase o sistema de auth)
```

### **Flujo de Trabajo:**
1. **Usuario sube documentos** → Sistema los guarda localmente
2. **Admin ve todos los documentos** → Puede aprobar/rechazar
3. **Sistema envía emails** → Notificaciones automáticas
4. **Reportes y estadísticas** → Dashboard completo

## 📞 **SOPORTE**

Si necesitas ayuda con:
- Configuración de base de datos
- Configuración de SMTP
- Despliegue en producción
- Personalización adicional

El sistema está completamente funcional y listo para usar en cualquier computadora con acceso a internet.