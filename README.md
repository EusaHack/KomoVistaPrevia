# KomoVistaPrevia - Kommo CRM Chat & Emulador de Mensajes

Aplicación web desarrollada en **React + TypeScript + Vite** que replica con precisión la interfaz de **Kommo CRM (amoCRM)** y permite la emulación interactiva de mensajes de chat (WhatsApp).

---

## 🚀 Características

1. **Bandeja de Chats (Columna Izquierda)**:
   - Buscador en tiempo real.
   - Filtro de *"Chats abiertos"*.
   - Previsualización del lead `Eusahack` con indicador de WhatsApp, código `A132`, fecha/hora y último mensaje.

2. **Ficha de Negocio / Lead (Columna Central)**:
   - Pipeline de ventas con etapa **Negociación (26 días)** y barra de progreso.
   - Pestañas funcionales: **Principal**, **Estadísticas**, **Archivos**.
   - Tarjeta de contacto con distintivo de **WhatsApp Business**.
   - Campos configurables (Usuario responsable, Presupuesto editable, Teléfono, Correo, etc.).

3. **Feed de Conversación & Emulador (Columna Derecha)**:
   - Burbujas de mensajes fieles a Kommo CRM (Cliente, SalesBot con doble check de lectura `✓✓` y avatar de robot).
   - Acciones de cierre: *Marque resuelto*, *Poner en espera*.
   - **Emulador interactivo**:
     - Alterna entre enviar como **Cliente**, **SalesBot** o **Agente**.
     - Respuesta automática inteligente simulada de **SalesBot**.
     - Chips de respuestas rápidas para probar flujos con un clic.
     - Indicador animado de escritura.

---

## 🛠️ Instalación y Uso

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build
```
