/**
 * cretta-protect.js
 * CRETTA SLF Tools — Script de protección de acceso
 * Versión: 1.0
 *
 * INSTALACIÓN: añadir UNA línea en el <head> de cada herramienta:
 * <script src="/cretta-slf-tools/cretta-protect.js"></script>
 *
 * Este script debe ser la PRIMERA etiqueta <script> del documento.
 */

(function () {
  "use strict";

  /* ─── CONFIGURACIÓN ──────────────────────────────────────────── */
  const CFG = {
    VALIDATE_URL:     "https://www.cretta-slf.com/_functions/validateToken",
    ALLOWED_ORIGINS:  ["cretta-slf.com", "www.cretta-slf.com"],
    TOKEN_PARAM:      "token",
    LIBRARY_URL:      "https://www.cretta-slf.com/slf-tools",
    BRAND:            "CRETTA — SLF Tools",
  };

  /* ─── 1. OCULTAR CONTENIDO INMEDIATAMENTE ───────────────────── */
  document.documentElement.style.visibility = "hidden";
  document.documentElement.style.userSelect = "none";

  /* ─── 2. CAPA DE DISUASIÓN ───────────────────────────────────── */

  // Deshabilitar clic derecho
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  // Deshabilitar selección de texto
  document.addEventListener("selectstart", function (e) {
    e.preventDefault();
  });

  // Deshabilitar atajos de teclado críticos
  document.addEventListener("keydown", function (e) {
    const blocked =
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I", "J", "C", "K"].includes(e.key)) ||
      (e.metaKey && e.altKey && ["I", "J", "C"].includes(e.key)) ||
      (e.ctrlKey && ["U", "S", "P", "A"].includes(e.key)) ||
      (e.metaKey && ["U", "S", "P"].includes(e.key));
    if (blocked) e.preventDefault();
  });

  // Deshabilitar arrastrar imágenes y elementos
  document.addEventListener("dragstart", function (e) {
    e.preventDefault();
  });

  // Deshabilitar impresión vía CSS (complementario al keydown)
  var noprint = document.createElement("style");
  noprint.textContent = "@media print { body { display: none !important; } }";
  document.head && document.head.appendChild(noprint);

  // Detección de DevTools (por diferencia de dimensiones de ventana)
  var _devOpen = false;
  var _devInterval = setInterval(function () {
    var wDiff = window.outerWidth  - window.innerWidth  > 200;
    var hDiff = window.outerHeight - window.innerHeight > 200;
    if (wDiff || hDiff) {
      if (!_devOpen) {
        _devOpen = true;
        document.documentElement.style.visibility = "hidden";
      }
    } else {
      if (_devOpen) {
        _devOpen = false;
        // Revalidar antes de mostrar de nuevo
        _validate();
      }
    }
  }, 1000);

  /* ─── 3. UTILIDADES ──────────────────────────────────────────── */

  function _getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function _getSlug() {
    // Deriva el slug del nombre del archivo HTML en la URL
    var path = window.location.pathname;
    var file = path.split("/").pop().replace(/\.html?$/i, "");
    return file;
  }

  function _cleanUrl() {
    try {
      var url = new URL(window.location.href);
      url.searchParams.delete(CFG.TOKEN_PARAM);
      window.history.replaceState({}, document.title, url.toString());
    } catch (e) {}
  }

  function _show() {
    document.documentElement.style.visibility = "visible";
  }

  function _deny(message) {
    clearInterval(_devInterval);
    document.documentElement.style.visibility = "visible";
    document.open();
    document.write(
      '<!DOCTYPE html><html lang="es"><head>' +
      '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>Acceso Restringido — CRETTA SLF</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Barlow:wght@300;400;600&display=swap" rel="stylesheet">' +
      "<style>" +
      "*{box-sizing:border-box;margin:0;padding:0}" +
      "body{min-height:100vh;display:flex;align-items:center;justify-content:center;" +
      "background:#F4F1EC;font-family:'Barlow',sans-serif;}" +
      ".box{text-align:center;max-width:440px;padding:56px 40px;}" +
      ".eyebrow{font-size:11px;letter-spacing:.22em;text-transform:uppercase;" +
      "color:#C49A3C;font-weight:600;margin-bottom:24px;}" +
      "h1{font-family:'EB Garamond',serif;font-size:36px;font-weight:400;" +
      "color:#0D1B3E;line-height:1.2;margin-bottom:16px;}" +
      "p{font-size:14px;font-weight:300;color:#666;line-height:1.75;margin-bottom:36px;}" +
      "a{display:inline-block;padding:13px 32px;background:#0D1B3E;color:#C49A3C;" +
      "font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;" +
      "text-decoration:none;border-radius:4px;}" +
      "a:hover{background:#162850;}" +
      "</style></head><body>" +
      '<div class="box">' +
      '<div class="eyebrow">' + CFG.BRAND + "</div>" +
      "<h1>Acceso Restringido</h1>" +
      "<p>" + message + "</p>" +
      '<a href="' + CFG.LIBRARY_URL + '">Volver a la Biblioteca</a>' +
      "</div></body></html>"
    );
    document.close();
  }

  /* ─── 4. VALIDACIÓN DE TOKEN ─────────────────────────────────── */

  function _validate() {
    var token = _getParam(CFG.TOKEN_PARAM);
    var slug  = _getSlug();

    // Sin token: verificar referrer como capa mínima
    if (!token) {
      var ref      = document.referrer || "";
      var validRef = CFG.ALLOWED_ORIGINS.some(function (o) { return ref.indexOf(o) !== -1; });
      if (!validRef) {
        _deny(
          "Esta herramienta es de acceso exclusivo para miembros de CRETTA SLF. " +
          "Inicia sesión y accede desde tu biblioteca de herramientas para obtener un enlace válido."
        );
      } else {
        // Referrer correcto pero sin token: enlace directo desde Wix sin token
        _deny(
          "El enlace de acceso no es válido. Regresa a tu biblioteca SLF y " +
          "haz clic en <strong>Acceder</strong> para generar un enlace autenticado."
        );
      }
      return;
    }

    // Llamar al endpoint de validación en Wix
    fetch(
      CFG.VALIDATE_URL +
        "?token=" + encodeURIComponent(token) +
        "&slug="  + encodeURIComponent(slug),
      { method: "GET", headers: { Accept: "application/json" } }
    )
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.valid === true) {
          _cleanUrl();   // quitar token de la URL
          _show();       // mostrar contenido
        } else {
          _deny(
            "Tu enlace de acceso ha expirado o ya fue utilizado. " +
            "Regresa a tu biblioteca SLF para generar un acceso nuevo."
          );
        }
      })
      .catch(function () {
        // En error de red: verificar referrer como respaldo
        var ref      = document.referrer || "";
        var validRef = CFG.ALLOWED_ORIGINS.some(function (o) { return ref.indexOf(o) !== -1; });
        if (validRef) {
          _cleanUrl();
          _show();
        } else {
          _deny(
            "No fue posible verificar tu acceso. " +
            "Comprueba tu conexión e intenta nuevamente desde la biblioteca SLF."
          );
        }
      });
  }

  /* ─── 5. INICIAR VALIDACIÓN AL CARGAR EL DOM ─────────────────── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _validate);
  } else {
    _validate();
  }

})();
