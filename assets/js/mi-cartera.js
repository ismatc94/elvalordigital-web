// Rellena los datos de "Cómo me va" y dibuja las gráficas en SVG a partir de CARTERA
// (assets/js/mi-cartera-datos.js). Si algo falla, se queda el texto escrito en el HTML.

(function () {
    if (typeof CARTERA === "undefined") return;

    const SVG_NS = "http://www.w3.org/2000/svg";
    const datos = CARTERA;
    const piezas = Object.keys(datos.actual);

    // ---- Formato ----

    function num(valor) {
        return valor.toLocaleString("es-ES", { maximumFractionDigits: 1 });
    }

    function pct(valor) {
        return num(valor) + " %";
    }

    function pctConSigno(valor) {
        return (valor > 0 ? "+" : "") + pct(valor);
    }

    function fechaLarga(iso) {
        const [a, m, d] = iso.split("-").map(Number);
        return new Date(a, m - 1, d).toLocaleDateString("es-ES", {
            day: "numeric", month: "long", year: "numeric"
        });
    }

    function mesCorto(iso) {
        const [a, m] = iso.split("-").map(Number);
        return new Date(a, m - 1, 1).toLocaleDateString("es-ES", {
            month: "short", year: "numeric"
        });
    }

    // En el texto, "bitcoin" va en minúscula
    function nombreEnTexto(pieza) {
        return pieza === "Bitcoin" ? "bitcoin" : pieza;
    }

    // ---- Utilidades DOM ----

    function svgEl(tag, attrs, texto) {
        const el = document.createElementNS(SVG_NS, tag);
        for (const k in attrs) el.setAttribute(k, attrs[k]);
        if (texto !== undefined) el.textContent = texto;
        return el;
    }

    function el(tag, attrs, texto) {
        const e = document.createElement(tag);
        for (const k in attrs) e.setAttribute(k, attrs[k]);
        if (texto !== undefined) e.textContent = texto;
        return e;
    }

    function ponerTexto(id, texto) {
        const e = document.getElementById(id);
        if (e) e.textContent = texto;
    }

    function tablaDatos(resumen, cabeceras, filas) {
        const det = el("details", { class: "chart-data" });
        det.appendChild(el("summary", {}, resumen));
        const tabla = el("table");
        const trh = el("tr");
        cabeceras.forEach(c => trh.appendChild(el("th", { scope: "col" }, c)));
        tabla.appendChild(el("thead")).appendChild(trh);
        const tbody = el("tbody");
        filas.forEach(fila => {
            const tr = el("tr");
            fila.forEach((c, i) => tr.appendChild(el(i === 0 ? "th" : "td", i === 0 ? { scope: "row" } : {}, c)));
            tbody.appendChild(tr);
        });
        tabla.appendChild(tbody);
        det.appendChild(tabla);
        return det;
    }

    // ---- Texto de "Cómo me va" ----

    const ultimoMes = datos.meses[datos.meses.length - 1];

    ponerTexto("cartera-fecha", fechaLarga(datos.actualizado));
    if (ultimoMes) ponerTexto("cartera-rentabilidad", pctConSigno(ultimoMes.rentabilidad));
    ponerTexto("cartera-reparto", piezas.map(p => nombreEnTexto(p) + ", " + pct(datos.actual[p])).join("; "));
    ponerTexto("cartera-objetivo", piezas.map(p => num(datos.objetivo[p])).join(" / "));

    const contenedor = document.getElementById("cartera-graficas");
    if (!contenedor) return;

    // ---- 1) Barras: reparto actual frente al objetivo ----
    // Las posiciones horizontales van en %, así el SVG ocupa todo el ancho
    // sin escalar el texto (se lee igual en móvil y en escritorio).

    function graficaReparto() {
        const fila = 52;
        const alto = piezas.length * fila;
        const etiqueta = "Reparto actual frente al objetivo: " +
            piezas.map(p => p + " " + pct(datos.actual[p]) + " (objetivo " + pct(datos.objetivo[p]) + ")").join(", ");

        const svg = svgEl("svg", {
            class: "chart-svg", width: "100%", height: alto,
            role: "img", "aria-label": etiqueta
        });

        const defs = svgEl("defs");
        const grad = svgEl("linearGradient", { id: "cartera-grad-barra", x1: "0", x2: "1", y1: "0", y2: "0" });
        grad.appendChild(svgEl("stop", { offset: "0", "stop-color": "#7cd6ff" }));
        grad.appendChild(svgEl("stop", { offset: "1", "stop-color": "#7fffd4" }));
        defs.appendChild(grad);
        svg.appendChild(defs);

        piezas.forEach((p, i) => {
            const y = i * fila;
            const actual = datos.actual[p];
            const objetivo = datos.objetivo[p];

            svg.appendChild(svgEl("text", { x: "0", y: y + 16, class: "chart-label" }, p));
            svg.appendChild(svgEl("text", { x: "100%", y: y + 16, class: "chart-value", "text-anchor": "end" },
                pct(actual) + " · objetivo " + pct(objetivo)));

            svg.appendChild(svgEl("rect", { x: "0", y: y + 24, width: "100%", height: 14, rx: 7, class: "chart-track" }));
            svg.appendChild(svgEl("rect", { x: "0", y: y + 24, width: Math.max(0, Math.min(100, actual)) + "%", height: 14, rx: 7, fill: "url(#cartera-grad-barra)" }));
            svg.appendChild(svgEl("line", { x1: objetivo + "%", x2: objetivo + "%", y1: y + 20, y2: y + 42, class: "chart-target" }));
        });

        const fig = el("figure", { class: "chart" });
        fig.appendChild(svg);
        fig.appendChild(el("figcaption", {}, "Reparto actual. La marca blanca es el objetivo de cada pieza."));
        fig.appendChild(tablaDatos("Ver los datos", ["Pieza", "Actual", "Objetivo"],
            piezas.map(p => [p, pct(datos.actual[p]), pct(datos.objetivo[p])])));
        return fig;
    }

    // ---- 2) Línea: rentabilidad acumulada por mes (con 3 meses o más) ----

    function graficaRentabilidad() {
        const meses = datos.meses;
        const valores = meses.map(m => m.rentabilidad);

        let min = Math.min(0, ...valores);
        let max = Math.max(0, ...valores);
        const margen = (max - min) * 0.1 || 1;
        min -= margen;
        max += margen;

        const alto = 220;
        const arriba = 12;
        const altoGrafica = 170;
        const izq = 14;      // % reservado a las etiquetas del eje vertical
        const ancho = 84;    // % del área de dibujo

        const yPx = v => arriba + altoGrafica * (max - v) / (max - min);
        const xPct = i => izq + ancho * (meses.length === 1 ? 0.5 : i / (meses.length - 1));

        const ultimo = meses[meses.length - 1];
        const etiqueta = "Rentabilidad acumulada por mes, de " + mesCorto(meses[0].mes) + " a " +
            mesCorto(ultimo.mes) + ". Último dato: " + pctConSigno(ultimo.rentabilidad) + ".";

        const svg = svgEl("svg", {
            class: "chart-svg", width: "100%", height: alto,
            role: "img", "aria-label": etiqueta
        });

        // Eje: máximo, 0 % y mínimo
        [max, 0, min].forEach(v => {
            svg.appendChild(svgEl("text", {
                x: (izq - 2) + "%", y: yPx(v) + 4, class: "chart-axis", "text-anchor": "end"
            }, pct(Math.round(v * 10) / 10)));
        });

        // Línea del 0 %
        svg.appendChild(svgEl("line", {
            x1: izq + "%", x2: (izq + ancho) + "%", y1: yPx(0), y2: yPx(0), class: "chart-zero"
        }));

        // La línea se dibuja en un SVG interno con viewBox 0-100 estirado al área de dibujo
        const area = svgEl("svg", {
            x: izq + "%", y: arriba, width: ancho + "%", height: altoGrafica,
            viewBox: "0 0 100 100", preserveAspectRatio: "none", overflow: "visible"
        });
        const puntos = meses.map((m, i) => {
            const x = meses.length === 1 ? 50 : 100 * i / (meses.length - 1);
            const y = 100 * (max - m.rentabilidad) / (max - min);
            return x + "," + y;
        }).join(" ");
        area.appendChild(svgEl("polyline", { points: puntos, class: "chart-line", "vector-effect": "non-scaling-stroke" }));
        svg.appendChild(area);

        // Puntos (fuera del SVG interno para que no se deformen); en negativo, en otro color
        meses.forEach((m, i) => {
            svg.appendChild(svgEl("circle", {
                cx: xPct(i) + "%", cy: yPx(m.rentabilidad), r: 4,
                class: m.rentabilidad < 0 ? "chart-dot chart-dot-neg" : "chart-dot"
            }));
        });

        // Primer y último mes debajo
        svg.appendChild(svgEl("text", { x: izq + "%", y: alto - 8, class: "chart-axis" }, mesCorto(meses[0].mes)));
        svg.appendChild(svgEl("text", { x: (izq + ancho) + "%", y: alto - 8, class: "chart-axis", "text-anchor": "end" }, mesCorto(ultimo.mes)));

        const fig = el("figure", { class: "chart" });
        fig.appendChild(svg);
        fig.appendChild(el("figcaption", {}, "Rentabilidad acumulada sobre lo aportado, a final de cada mes. La línea discontinua es el 0 %."));
        fig.appendChild(tablaDatos("Ver los datos", ["Mes", "Rentabilidad acumulada"],
            meses.map(m => [mesCorto(m.mes), pctConSigno(m.rentabilidad)])));
        return fig;
    }

    contenedor.appendChild(graficaReparto());
    if (datos.meses.length >= 3) contenedor.appendChild(graficaRentabilidad());
})();
