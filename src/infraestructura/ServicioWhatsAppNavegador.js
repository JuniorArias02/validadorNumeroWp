const puppeteer = require('puppeteer');
const path = require('path');

class ServicioWhatsAppNavegador {
    constructor(rutaSesion) {
        this.rutaSesion = rutaSesion;
        this.navegador = null;
        this.pagina = null;
        this.TIEMPO_ESPERA_MAXIMO_MS = 30000;
    }

    async iniciar() {
        this.navegador = await puppeteer.launch({
            headless: false, // Debe verse para poder escanear el QR inicialmente
            userDataDir: this.rutaSesion
        });
        this.pagina = await this.navegador.newPage();
        await this.pagina.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    }

    async validarNumero(numero) {
        const url = `https://web.whatsapp.com/send/?phone=57${numero}&text&type=phone_number&app_absent=0`;
        await this.pagina.goto(url, { waitUntil: 'domcontentloaded' });
        
        console.log(`[Servicio] Esperando carga para el número ${numero}...`);
        
        const selectorValido = '[data-testid="conversation-info-header-chat-title"]';
        const selectorInvalido = '[data-testid="confirm-popup"]';
        const botonOkSelector = '[data-testid="popup-controls-ok"]';

        const resultado = await Promise.race([
            this.pagina.waitForSelector(selectorValido, { timeout: this.TIEMPO_ESPERA_MAXIMO_MS }).then(() => 'VALIDO'),
            this.pagina.waitForFunction(() => {
                const popup = document.querySelector('[data-testid="confirm-popup"]');
                if (!popup) return false;
                
                const btnOk = document.querySelector('[data-testid="popup-controls-ok"]');
                if (btnOk) return true;

                const texto = popup.innerText.toLowerCase();
                if (texto.includes('inválido') || texto.includes('invalid') || texto.includes('no está en whatsapp') || texto.includes('not shared')) {
                    return true;
                }
                
                return false;
            }, { timeout: this.TIEMPO_ESPERA_MAXIMO_MS }).then(() => 'INVALIDO'),
            // Selector para detectar si cerró sesión o pide escanear código (canvas del QR)
            this.pagina.waitForSelector('canvas[aria-label="Scan me!"]', { timeout: this.TIEMPO_ESPERA_MAXIMO_MS }).then(() => 'BLOQUEO')
        ]).catch(() => 'TIMEOUT');

        if (resultado === 'VALIDO') {
            return 'DISPONIBLE';
        } else if (resultado === 'INVALIDO') {
            // Cerramos el popup de error si está visible
            await this._cerrarPopupError(botonOkSelector);
            return 'NO_DISPONIBLE';
        } else if (resultado === 'BLOQUEO') {
            throw new Error('WhatsApp detectó comportamiento inusual o pide inicio de sesión (QR / CAPTCHA).');
        } else {
            return 'ERROR';
        }
    }

    async _cerrarPopupError(selectorBoton) {
        try {
            await new Promise(r => setTimeout(r, 1000));
            const boton = await this.pagina.$(selectorBoton);
            if (boton) {
                await boton.click();
            }
        } catch (error) {
            // Ignoramos si no se puede clickear
        }
    }

    async esperarPausaEntrePeticiones(milisegundos) {
        return new Promise(resolve => setTimeout(resolve, milisegundos));
    }

    async cerrar() {
        if (this.navegador) {
            await this.navegador.close();
        }
    }
}

module.exports = ServicioWhatsAppNavegador;
