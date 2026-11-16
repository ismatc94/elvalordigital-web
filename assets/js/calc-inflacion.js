// Calculadora de inflación de El Valor Digital.
// Muestra cuánto poder de compra pierde un dinero parado con una inflación media constante.
// Solo ilustra: la inflación real cambia cada año.

(function () {
    const form = document.getElementById("infl-form");
    if (!form) return;

    const campos = {
        cantidad: document.getElementById("infl-cantidad"),
        anios: document.getElementById("infl-anios"),
        inflacion: document.getElementById("infl-inflacion")
    };

    const salida = {
        anios: document.getElementById("infl-res-anios"),
        cantidad: document.getElementById("infl-res-cantidad"),
        real: document.getElementById("infl-real"),
        perdida: document.getElementById("infl-perdida"),
        necesario: document.getElementById("infl-necesario"),
        grafico: document.getElementById("infl-grafico")
    };

    const euros = new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
        useGrouping: "always"
    });

    const porcentaje = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });

    function leer(input) {
        const valor = parseFloat(String(input.value).replace(",", "."));
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        if (isNaN(valor)) return Math.max(min, 0);
        return Math.min(Math.max(valor, min), max);
    }

    function pintarGrafico(cantidad, anios, inflacion) {
        salida.grafico.innerHTML = "";
        for (let anio = 1; anio <= anios; anio++) {
            const real = cantidad / Math.pow(1 + inflacion / 100, anio);
            const parteReal = cantidad > 0 ? real / cantidad * 100 : 0;

            const barra = document.createElement("div");
            barra.className = "calc-barra";
            barra.title = "Año " + anio + ": compra lo que hoy " + euros.format(real);

            const segPerdido = document.createElement("span");
            segPerdido.className = "calc-seg-perdido";
            segPerdido.style.height = (100 - parteReal) + "%";

            const segReal = document.createElement("span");
            segReal.className = "calc-seg-aportado";
            segReal.style.height = parteReal + "%";

            barra.append(segPerdido, segReal);
            salida.grafico.appendChild(barra);
        }
    }

    function actualizar() {
        const cantidad = leer(campos.cantidad);
        const anios = Math.round(leer(campos.anios));
        const inflacion = leer(campos.inflacion);

        const factor = Math.pow(1 + inflacion / 100, anios);
        const real = cantidad / factor;

        salida.anios.textContent = anios;
        salida.cantidad.textContent = euros.format(cantidad);
        salida.real.textContent = euros.format(real);
        salida.perdida.textContent = euros.format(cantidad - real) +
            " (" + porcentaje.format(cantidad > 0 ? (1 - real / cantidad) * 100 : 0) + " %)";
        salida.necesario.textContent = euros.format(cantidad * factor);
        pintarGrafico(cantidad, anios, inflacion);
    }

    form.addEventListener("input", actualizar);
    form.addEventListener("submit", e => e.preventDefault());
    actualizar();
})();
