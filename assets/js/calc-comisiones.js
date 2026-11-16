// Calculadora de comisiones de El Valor Digital.
// Compara la misma inversión con dos costes anuales distintos.
// Mismo método que la calculadora de interés compuesto: cálculo mes a mes,
// aportación al final de cada mes y rentabilidad neta (rentabilidad - comisión)
// pasada a su equivalente mensual. Supone una rentabilidad constante.

(function () {
    const form = document.getElementById("comis-form");
    if (!form) return;

    const campos = {
        inicial: document.getElementById("comis-inicial"),
        mensual: document.getElementById("comis-mensual"),
        anios: document.getElementById("comis-anios"),
        rentabilidad: document.getElementById("comis-rentabilidad"),
        barata: document.getElementById("comis-barata"),
        cara: document.getElementById("comis-cara")
    };

    const salida = {
        barato: document.getElementById("comis-res-barato"),
        caro: document.getElementById("comis-res-caro"),
        diferencia: document.getElementById("comis-diferencia"),
        aportado: document.getElementById("comis-aportado"),
        etqBarata: document.getElementById("comis-etq-barata"),
        etqCara: document.getElementById("comis-etq-cara"),
        grafico: document.getElementById("comis-grafico")
    };

    const euros = new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
        useGrouping: "always"
    });

    const pct = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });

    function leer(input) {
        const valor = parseFloat(String(input.value).replace(",", "."));
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        if (isNaN(valor)) return Math.max(min, 0);
        return Math.min(Math.max(valor, min), max);
    }

    // Devuelve el saldo al final de cada año (posición 0 = inicio)
    function serie(inicial, mensual, anios, rentabilidad, comision) {
        const tasaMes = Math.pow(1 + (rentabilidad - comision) / 100, 1 / 12) - 1;
        let saldo = inicial;
        const valores = [saldo];
        for (let anio = 1; anio <= anios; anio++) {
            for (let mes = 0; mes < 12; mes++) {
                saldo = saldo * (1 + tasaMes) + mensual;
            }
            valores.push(saldo);
        }
        return valores;
    }

    // Gráfico de líneas en SVG, sin librerías
    function pintarGrafico(barato, caro, aportado) {
        const ancho = 600, alto = 260;
        const margen = { arriba: 16, derecha: 12, abajo: 28, izquierda: 12 };
        const anios = barato.length - 1;
        const maximo = Math.max(...barato, ...caro, ...aportado, 1);

        const x = i => margen.izquierda + i / anios * (ancho - margen.izquierda - margen.derecha);
        const y = v => alto - margen.abajo - v / maximo * (alto - margen.arriba - margen.abajo);
        const linea = valores => valores.map((v, i) => x(i).toFixed(1) + "," + y(v).toFixed(1)).join(" ");

        const base = alto - margen.abajo;
        const areaEntre = linea(barato) + " " +
            caro.map((v, i) => x(i).toFixed(1) + "," + y(v).toFixed(1)).reverse().join(" ");

        salida.grafico.innerHTML =
            '<svg viewBox="0 0 ' + ancho + ' ' + alto + '" preserveAspectRatio="none" aria-hidden="true">' +
            '<line class="comis-eje" x1="' + margen.izquierda + '" y1="' + base + '" x2="' + (ancho - margen.derecha) + '" y2="' + base + '"/>' +
            '<polygon class="comis-hueco" points="' + areaEntre + '"/>' +
            '<polyline class="comis-linea-aportado" points="' + linea(aportado) + '"/>' +
            '<polyline class="comis-linea-caro" points="' + linea(caro) + '"/>' +
            '<polyline class="comis-linea-barato" points="' + linea(barato) + '"/>' +
            '</svg>' +
            '<div class="comis-ejes"><span>Hoy</span><span>Año ' + anios + '</span></div>';
    }

    function actualizar() {
        const inicial = leer(campos.inicial);
        const mensual = leer(campos.mensual);
        const anios = Math.round(leer(campos.anios));
        const rentabilidad = leer(campos.rentabilidad);
        const comisBarata = leer(campos.barata);
        const comisCara = leer(campos.cara);

        const barato = serie(inicial, mensual, anios, rentabilidad, comisBarata);
        const caro = serie(inicial, mensual, anios, rentabilidad, comisCara);
        const aportado = barato.map((_, i) => inicial + mensual * 12 * i);

        const finBarato = barato[anios];
        const finCaro = caro[anios];

        salida.etqBarata.textContent = pct.format(comisBarata);
        salida.etqCara.textContent = pct.format(comisCara);
        salida.barato.textContent = euros.format(finBarato);
        salida.caro.textContent = euros.format(finCaro);
        salida.diferencia.textContent = euros.format(Math.abs(finBarato - finCaro));
        salida.aportado.textContent = euros.format(aportado[anios]);
        pintarGrafico(barato, caro, aportado);
    }

    form.addEventListener("input", actualizar);
    form.addEventListener("submit", e => e.preventDefault());
    actualizar();
})();
