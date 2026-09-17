# Validador de Números de WhatsApp Web

Herramienta automatizada en Node.js para la validación masiva de números telefónicos mediante WhatsApp Web y Puppeteer.

---

## 🚀 Características

- **Verificación en tiempo real:** Detecta si un número dispone de cuenta activa en WhatsApp.
- **Persistencia de sesión:** Mantiene la sesión en `wpp_session/` para omitir el código QR en ejecuciones futuras.
- **Gestión de historial:** Registra los números ya validados (`procesados.json`) para evitar reprocesamiento.
- **Pausas de seguridad:** Aplica retardos aleatorios entre consultas para proteger la cuenta.
- **Exportación limpia:** Genera reportes estructurados en formato CSV (`salida/resultados.csv`).
- **Arquitectura modular:** Implementado siguiendo principios de separación de responsabilidades (Clean Architecture).

---

## 🛠️ Requisitos

- **Node.js** v16.0 o superior
- **npm** v7.0 o superior

---

## 📦 Instalación

```bash
npm install
```

---

## 🚦 Uso

1. **Configurar los números:**
   Añade los números telefónicos en `numeros.txt` (un número por línea, con código de país).

2. **Ejecutar la validación:**

   ```bash
   # Ejecución por defecto (procesa numeros.txt)
   npm start

   # O especificando un archivo personalizado
   node src/index.js mi_lista.csv
   ```

3. **Autenticación (Primer inicio):**
   Se abrirá el navegador para escanear el código QR de WhatsApp Web. Las siguientes ejecuciones serán automáticas.

---

## 📊 Estructura de Salida

Los datos procesados se almacenan en el directorio `salida/`:

| Archivo | Descripción |
| :--- | :--- |
| `salida/resultados.csv` | Estado del número (`SI`, `NO`, `error`). |
| `salida/procesados.json` | Registro de números validados en ejecuciones previas. |

---

## 📁 Estructura del Proyecto

```text
.
├── salida/                  # Archivos de resultados e historial
├── src/
│   ├── casos_de_uso/        # Lógica de negocio principal
│   ├── infraestructura/     # Integración con WhatsApp, lectura y escritura de archivos
│   └── index.js             # Punto de entrada de la aplicación
├── wpp_session/             # Sesión persistente del navegador
├── numeros.txt              # Entrada de datos por defecto
└── package.json
```
