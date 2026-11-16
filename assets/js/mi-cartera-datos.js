// Datos de mi-cartera.html. Actualización mensual: editar solo este archivo.
// Solo porcentajes, nunca euros.
// - actualizado: fecha de la última actualización (AAAA-MM-DD).
// - objetivo y actual: reparto en % (las claves deben coincidir en los dos).
// - meses: rentabilidad acumulada a final de cada mes, del más antiguo al más reciente.
//   La gráfica de evolución aparece cuando hay 3 meses o más.

const CARTERA = {
    actualizado: "2026-11-07",
    objetivo: { "S&P 500": 70, "All-World": 20, "Bitcoin": 10 },
    actual:   { "S&P 500": 80, "All-World": 12, "Bitcoin": 8 },
    meses: [
        { mes: "2026-11", rentabilidad: 7.0 }
    ]
};
