// Calculadora de presupuesto de El Valor Digital.
// Compara el reparto del sueldo del lector con la regla 50/30/20
// en dos gráficos de donut hechos con SVG, sin librerías.

(function () {
    const form = document.getElementById("presu-form");
    if (!form) return;

    const campos = {
        ingresos: document.getElementById("presu-ingresos"),
        necesidades: document.getElementById("presu-necesidades"),
        personales: document.getElementById("presu-personales"),
        ahorro: document.getElementById("presu-ahorro")
    };

    const salida = {
        donutTuyo: document.getElementById("presu-donut-tuyo"),
        donutRegla: document.getElementById("presu-donut-regla"),
        tabla: document.getElementById("presu-tabla"),
        aviso: document.getElementById("presu-aviso")
    };

    const euros = new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
        useGrouping: "always"
    });

    const pct = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });

    const PARTES = [
        { clave: "necesidades", nombre: "Necesidades", regla: 50 },
        { clave: "personales", nombre: "Personal y ocio", regla: 30 },
        { clave: "ahorro", nombre: "Ahorro", regla: 20 }
    ];

    function leer(input) {
        const valor = parseFloat(String(input.value).replace(",", "."));
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        if (isNaN(valor)) return Math.max(min, 0);
        return Math.min(Math.max(valor, min), max);
    }

    // Donut con un círculo por tramo (stroke-dasharray). Los porcentajes suman 100 o menos.
    function donut(contenedor, tramos, centro, subtitulo) {
        const r = 70, c = 2 * Math.PI * r;
        let acumulado = 0;
        let circulos = '<circle class="presu-fondo" cx="90" cy="90" r="' + r + '"/>';
        tramos.forEach(t => {
            if (t.porcentaje <= 0) return;
            const largo = t.porcentaje / 100 * c;
            circulos += '<circle class="presu-tramo presu-' + t.clave + '" cx="90" cy="90" r="' + r + '"' +
                ' stroke-dasharray="' + largo.toFixed(2) + ' ' + (c - largo).toFixed(2) + '"' +
                ' stroke-dashoffset="' + (-acumulado).toFixed(2) + '"/>';
            acumulado += largo;
        });
        contenedor.innerHTML =
            '<svg viewBox="0 0 180 180" aria-hidden="true"><g transform="rotate(-90 90 90)">' + circulos + '</g>' +
            '<text x="90" y="88" class="presu-centro">' + centro + '</text>' +
            '<text x="90" y="110" class="presu-subcentro">' + subtitulo + '</text></svg>';
    }

    function actualizar() {
        const ingresos = leer(campos.ingresos);
        const valores = {
            necesidades: leer(campos.necesidades),
            personales: leer(campos.personales),
            ahorro: leer(campos.ahorro)
        };
        const total = valores.necesidades + valores.personales + valores.ahorro;
        const base = Math.max(ingresos, total, 1);

        const tuyo = PARTES.map(p => ({ clave: p.clave, porcentaje: valores[p.clave] / base * 100 }));
        const libre = ingresos - total;
        if (libre > 0) tuyo.push({ clave: "libre", porcentaje: libre / base * 100 });

        donut(salida.donutTuyo, tuyo,
            pct.format(ingresos > 0 ? valores.ahorro / ingresos * 100 : 0) + " %", "ahorras");
        donut(salida.donutRegla, PARTES.map(p => ({ clave: p.clave, porcentaje: p.regla })),
            "20 %", "ahorro");

        salida.tabla.innerHTML = PARTES.map(p => {
            const tuPct = ingresos > 0 ? valores[p.clave] / ingresos * 100 : 0;
            return '<tr><th scope="row"><span class="presu-punto presu-' + p.clave + '"></span>' + p.nombre + '</th>' +
                '<td>' + euros.format(valores[p.clave]) + ' <small>' + pct.format(tuPct) + ' %</small></td>' +
                '<td>' + euros.format(ingresos * p.regla / 100) + ' <small>' + p.regla + ' %</small></td></tr>';
        }).join("");

        if (libre < 0) {
            salida.aviso.textContent = "Te pasas en " + euros.format(-libre) + " al mes: gastas y ahorras más de lo que entra.";
            salida.aviso.className = "presu-aviso presu-aviso-mal";
        } else if (libre > 0) {
            salida.aviso.textContent = "Te quedan " + euros.format(libre) + " al mes sin asignar. Decide a qué van, por ejemplo al ahorro.";
            salida.aviso.className = "presu-aviso";
        } else {
            salida.aviso.textContent = "Cada euro que entra tiene un destino.";
            salida.aviso.className = "presu-aviso presu-aviso-bien";
        }
    }

    form.addEventListener("input", actualizar);
    form.addEventListener("submit", e => e.preventDefault());
    actualizar();
})();
