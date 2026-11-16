// Calculadora del fondo de emergencia de El Valor Digital.
// Calcula el objetivo (meses de gastos esenciales) y cuánto se tarda en llegar
// ahorrando una cantidad fija al mes. No tiene en cuenta intereses ni imprevistos.

(function () {
    const form = document.getElementById("fondo-form");
    if (!form) return;

    const campos = {
        gastos: document.getElementById("fondo-gastos"),
        meses: document.getElementById("fondo-meses"),
        actual: document.getElementById("fondo-actual"),
        ahorro: document.getElementById("fondo-ahorro")
    };

    const salida = {
        objetivo: document.getElementById("fondo-objetivo"),
        falta: document.getElementById("fondo-falta"),
        primerMes: document.getElementById("fondo-primer-mes"),
        completo: document.getElementById("fondo-completo"),
        barra: document.getElementById("fondo-barra"),
        cubierto: document.getElementById("fondo-cubierto")
    };

    const euros = new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
        useGrouping: "always"
    });

    const mesAnio = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
    const decimal = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });

    function leer(input) {
        const valor = parseFloat(String(input.value).replace(",", "."));
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        if (isNaN(valor)) return Math.max(min, 0);
        return Math.min(Math.max(valor, min), max);
    }

    // Escribe los meses que faltan y, debajo, la fecha aproximada
    function plazo(output, cantidad, actual, ahorro) {
        output.textContent = "";
        if (actual >= cantidad) {
            output.textContent = "Ya lo tienes";
            return;
        }
        if (ahorro <= 0) {
            output.textContent = "Sin ahorro mensual no llega";
            return;
        }
        const meses = Math.ceil((cantidad - actual) / ahorro);
        const fecha = new Date();
        fecha.setDate(1);
        fecha.setMonth(fecha.getMonth() + meses);

        const cuando = document.createElement("small");
        cuando.textContent = "hacia " + mesAnio.format(fecha);
        output.append(meses === 1 ? "1 mes" : meses + " meses", cuando);
    }

    function pintarBarra(gastos, meses, actual) {
        salida.barra.innerHTML = "";
        for (let i = 0; i < meses; i++) {
            const tramo = document.createElement("div");
            tramo.className = "fondo-tramo";

            const lleno = gastos > 0 ? Math.min(Math.max((actual - i * gastos) / gastos, 0), 1) : 0;
            const relleno = document.createElement("span");
            relleno.style.width = (lleno * 100) + "%";

            const etiqueta = document.createElement("small");
            etiqueta.textContent = i + 1;

            tramo.append(relleno, etiqueta);
            salida.barra.appendChild(tramo);
        }
    }

    function actualizar() {
        const gastos = leer(campos.gastos);
        const meses = Math.round(leer(campos.meses));
        const actual = leer(campos.actual);
        const ahorro = leer(campos.ahorro);
        const objetivo = gastos * meses;

        salida.objetivo.textContent = euros.format(objetivo);
        salida.falta.textContent = euros.format(Math.max(objetivo - actual, 0));
        plazo(salida.primerMes, gastos, actual, ahorro);
        plazo(salida.completo, objetivo, actual, ahorro);
        salida.cubierto.textContent = gastos > 0 ? decimal.format(Math.min(actual / gastos, meses)) : "0";
        pintarBarra(gastos, meses, actual);
    }

    form.addEventListener("input", actualizar);
    form.addEventListener("submit", e => e.preventDefault());
    actualizar();
})();
