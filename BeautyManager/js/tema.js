// =====================================================
// BEAUTYMANAGER - SISTEMA DE TEMA POR CUENTA
// =====================================================

(function () {

    // Saber qué cuenta está activa
    const usuario =
        localStorage.getItem("beautymanager-usuario");


    // =================================================
    // SI NO HAY CUENTA ACTIVA
    // =================================================
    // Esto corresponde al login y otras páginas públicas.
    // Siempre deben iniciar en morado + modo claro.

    if (!usuario) {

        document.documentElement.setAttribute(
            "data-tema",
            "morado"
        );

        document.documentElement.classList.remove(
            "modo-oscuro"
        );

        if (document.body) {

            document.body.classList.remove(
                "modo-oscuro"
            );

        }

        return;
    }


    // =================================================
    // PREFERENCIAS DE LA CUENTA ACTUAL
    // =================================================

    const claveTema =
        `beautymanager-tema-${usuario}`;

    const claveModo =
        `beautymanager-modo-${usuario}`;


    // Predeterminados para una cuenta nueva
    const tema =
        localStorage.getItem(claveTema) || "morado";

    const modo =
        localStorage.getItem(claveModo) || "claro";


    // =================================================
    // APLICAR COLOR
    // =================================================

    document.documentElement.setAttribute(
        "data-tema",
        tema
    );


    // =================================================
    // APLICAR MODO
    // =================================================

    if (modo === "oscuro") {

        document.documentElement.classList.add(
            "modo-oscuro"
        );

    } else {

        document.documentElement.classList.remove(
            "modo-oscuro"
        );

    }

})();