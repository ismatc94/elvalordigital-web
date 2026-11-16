// Calculadora de interés compuesto de El Valor Digital.
// Cálculo mes a mes: la aportación se suma al final de cada mes y la
// rentabilidad anual se pasa a su equivalente mensual.
// Solo ilustra: supone una rentabilidad constante, que en la realidad no existe.

(function () {
    const form = document.getElementById("calc-form");
    if (!form) return;

    const campos = {
        inicial: document.getElementById("calc-inicial"),
        mensual: document.getElementById("calc-mensual"),
        anios: document.getElementById("calc-anios"),
        rentabilidad: document.getElementById("calc-rentabilidad"),
        inflacion: document.getElementById("calc-inflacion")
    };

    const salida = {
        final: document.getElementById("calc-final"),
        aportado: document.getElementById("calc-aportado"),
        ganancias: document.getElementById("calc-ganancias"),
        real: document.getElementById("calc-real"),
        anios: document.getElementById("calc-real-anios"),
        grafico: document.getElementById("calc-grafico")
    };

    const euros = new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
        useGrouping: "always"
    });

    // Lee un campo numérico, acepta coma decimal y lo deja dentro de sus límites
    function leer(input) {
        const valor = parseFloat(String(input.value).replace(",", "."));
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        if (isNaN(valor)) return isNaN(min) ? 0 : Math.max(min, 0);
        return Math.min(Math.max(valor, min), max);
    }

    function calcular(inicial, mensual, anios, rentabilidad, inflacion) {
        const tasaMes = Math.pow(1 + rentabilidad / 100, 1 / 12) - 1;
        let saldo = inicial;
        let aportado = inicial;
        const porAnio = [];

        for (let anio = 1; anio <= anios; anio++) {
            for (let mes = 0; mes < 12; mes++) {
                saldo = saldo * (1 + tasaMes) + mensual;
                aportado += mensual;
            }
            porAnio.push({ anio, saldo, aportado });
        }

        const real = saldo / Math.pow(1 + inflacion / 100, anios);
        return { saldo, aportado, ganancias: saldo - aportado, real, porAnio };
    }

    function pintarGrafico(porAnio) {
        salida.grafico.innerHTML = "";
        const maximo = Math.max(...porAnio.map(p => Math.max(p.saldo, p.aportado)), 1);

        porAnio.forEach(p => {
            const barra = document.createElement("div");
            barra.className = "calc-barra";

            const ganado = Math.max(p.saldo - p.aportado, 0);
            const base = Math.min(p.aportado, p.saldo);

            const segGanado = document.createElement("span");
            segGanado.className = "calc-seg-ganado";
            segGanado.style.height = (ganado / maximo * 100) + "%";

            const segAportado = document.createElement("span");
            segAportado.className = "calc-seg-aportado";
            segAportado.style.height = (base / maximo * 100) + "%";

            barra.title = "Año " + p.anio + ": " + euros.format(p.saldo) +
                " (aportado " + euros.format(p.aportado) + ")";

            barra.append(segGanado, segAportado);
            salida.grafico.appendChild(barra);
        });
    }

    function actualizar() {
        const anios = Math.round(leer(campos.anios));
        const r = calcular(
            leer(campos.inicial),
            leer(campos.mensual),
            anios,
            leer(campos.rentabilidad),
            leer(campos.inflacion)
        );

        salida.final.textContent = euros.format(r.saldo);
        salida.aportado.textContent = euros.format(r.aportado);
        salida.ganancias.textContent = euros.format(r.ganancias);
        salida.real.textContent = euros.format(r.real);
        salida.anios.textContent = anios;
        pintarGrafico(r.porAnio);
    }

    form.addEventListener("input", actualizar);
    form.addEventListener("submit", e => e.preventDefault());
    actualizar();
})();
