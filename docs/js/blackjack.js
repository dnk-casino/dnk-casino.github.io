/**
 * Importa la variable HOST desde el archivo host.js
 */
import { HOST } from "./host.js";

/**
 * Definición de los palos de la baraja
 * @enum {Object}
 */
const palos = {
    /**
     * Palo oculto
     */
    OCULTO: { nombre: "Oculto", simbolo: "🔳" },
    /**
     * Palo de corazones
     */
    CORAZONES: { nombre: "Corazones", simbolo: "♥️" },
    /**
     * Palo de diamantes
     */
    DIAMANTES: { nombre: "Diamantes", simbolo: "♦️" },
    /**
     * Palo de picas
     */
    PICAS: { nombre: "Picas", simbolo: "♠️" },
    /**
     * Palo de tréboles
     */
    TREBOLES: { nombre: "Tréboles", simbolo: "♣️" }
};

/**
 * Definición de los valores de las cartas
 * @enum {Object}
 */
const valores = {
    /**
     * Valor oculto
     */
    OCULTO: { nombre: "Oculto", valor: 0, simbolo: "?" },
    /**
     * Valor As
     */
    AS: { nombre: "As", valor: 11, simbolo: "A" },
    /**
     * Valor 2
     */
    DOS: { nombre: "Dos", valor: 2, simbolo: "2" },
    /**
     * Valor 3
     */
    TRES: { nombre: "Tres", valor: 3, simbolo: "3" },
    /**
     * Valor 4
     */
    CUATRO: { nombre: "Cuatro", valor: 4, simbolo: "4" },
    /**
     * Valor 5
     */
    CINCO: { nombre: "Cinco", valor: 5, simbolo: "5" },
    /**
     * Valor 6
     */
    SEIS: { nombre: "Seis", valor: 6, simbolo: "6" },
    /**
     * Valor 7
     */
    SIETE: { nombre: "Siete", valor: 7, simbolo: "7" },
    /**
     * Valor 8
     */
    OCHO: { nombre: "Ocho", valor: 8, simbolo: "8" },
    /**
     * Valor 9
     */
    NUEVE: { nombre: "Nueve", valor: 9, simbolo: "9" },
    /**
     * Valor 10
     */
    DIEZ: { nombre: "Diez", valor: 10, simbolo: "10" },
    /**
     * Valor Jota
     */
    JOTA: { nombre: "Jota", valor: 10, simbolo: "J" },
    /**
     * Valor Reina
     */
    REINA: { nombre: "Reina", valor: 10, simbolo: "Q" },
    /**
     * Valor Rey
     */
    REY: { nombre: "Rey", valor: 10, simbolo: "K" }
};

/**
 * Agrega un evento de escucha al documento para cuando se haya cargado completamente.
 * Este evento se utiliza para inicializar la aplicación.
 */
document.addEventListener('DOMContentLoaded', () => {
    /**
     * Selecciona elementos del DOM para su uso posterior
     */
    const gameSection = document.getElementById('game-section');
    const logoutButton = document.getElementById('logout-button');
    const pedirCarta = document.getElementById('pedir-carta');
    const plantarse = document.getElementById('plantarse');

    /**
     * Manejo del botón de pedir carta
     */
    pedirCarta.addEventListener('click', () => {
        const id = localStorage.getItem('juegoID');
        fetch(HOST + `/api/blackjack/pedir-carta/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(response => { return response.ok ? response.json() : Promise.reject(response) })
            .then(data => {
                actualizarJuego(data);
                if (!data.activo) {
                    finalizarJuego(calcularResultado(data));
                }
            })
            .catch(error => error.text().then(message => {
                console.error(message);
            }));
    });

    /**
     * Manejo del botón de plantarse
     */
    plantarse.addEventListener('click', () => {
        const id = localStorage.getItem('juegoID');
        fetch(HOST + `/api/blackjack/plantarse/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(response => { return response.ok ? response.json() : Promise.reject(response) })
            .then(data => {
                actualizarJuego(data[0]);
                finalizarJuego(data[1]);
            })
            .catch(error => {
                console.error(error);
            });
    });

    /**
     * Función para alternar entre la sección de juego y la sección de apuestas
     */
    const toggleSections = () => {
        if (!!localStorage.getItem('token')) {
            gameSection.style.display = 'block';
        } else {
            location.replace("/");
        }
    };

    /**
     * Manejo del cierre de sesión
     */
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('juegoID');
        toggleSections();
    });

    /**
     * Comprueba si hay token almacenado
     */
    if (checkAuth()) {
        loadPremios();
        loadCoins();
        loadRanking();
        recuperarJuego();
    } else {
        localStorage.removeItem('token');
    }

    /**
     * Inicializa el estado inicial
     */
    toggleSections();
});

/**
 * Función para cargar las monedas del usuario
 */
function loadCoins() {
    const coinsAmount = document.getElementById('coins-amount');
    fetch(HOST + '/api/coins', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(data => {
            coinsAmount.textContent = data + "🪙";
        })
        .catch(error => console.error('Error:', error));
};

/**
 * Función para empezar el juego
 * @param {number} apuesta - La apuesta del jugador
 */
function playGame(apuesta) {
    // Obtén los botones de apuestas y las secciones de juego y apuestas
    const buttons = document.querySelectorAll('.play-button');
    const apuestas = document.querySelector('.apuestas');
    const juego = document.querySelector('.juego');

    // Añade la clase disabled a todos los botones de apuestas
    buttons.forEach(button => button.classList.add('disabled'));

    // Envía la solicitud al servidor
    fetch(HOST + `/api/blackjack/crear-juego/${apuesta}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(response => { return response.ok ? response.json() : Promise.reject(response) })
        .then(data => {
            // Se habilita la zona de juego y guardamos su id
            apuestas.style.display = 'none';
            juego.style.display = 'block';
            localStorage.setItem('juegoID', data.id);
            loadCoins();
            actualizarJuego(data);
            if (!data.activo) {
                finalizarJuego(calcularResultado(data));
            }
        })
        .catch(error => {
            console.error(error);
            // Quita la clase disabled a todos los botones
            buttons.forEach(button => button.classList.remove('disabled'));
        });
}

/**
 * Función para calcular el resultado del juego
 * @param {Object} juego - El objeto del juego
 * @returns {number} - El resultado del juego
 */
function calcularResultado(juego) {
    if (juego.valorJugador === 21 && juego.valorIA === 21) { return 0; }
    else if (juego.valorJugador === 21) { return 1; }
    else { return 2; }
}

/**
 * Función para finalizar el juego
 * @param {number} result - El resultado del juego
 */
function finalizarJuego(result) {
    const botones = document.querySelector('.jugador .buttons');
    const resultadoDiv = document.querySelector('.resultado');
    const resultado = document.getElementById('resultado');
    localStorage.removeItem('juegoID');
    botones.style.display = 'none';
    loadCoins();
    loadRanking();

    switch (result) {
        case 1:
            resultado.textContent = "Gana el Jugador";
            break;
        case 2:
            resultado.textContent = "Gana el Dealer";
            break;
        default:
            resultado.textContent = "Empate";
            break;
    }

    resultadoDiv.style.display = 'block';
};

/**
 * Función para actualizar el juego
 * @param {Object} juego - El objeto del juego
 */
function actualizarJuego(juego) {
    const manoJugador = document.getElementById('mano-jugador');
    const valorJugador = document.getElementById('valor-jugador');
    const manoIA = document.getElementById('mano-ia');
    const valorIA = document.getElementById('valor-ia');

    manoJugador.innerHTML = '';
    juego.manoJugador.cartas.forEach(carta => {
        const divCarta = document.createElement('div');
        const divValor = document.createElement('div');
        const divPalo = document.createElement('div');

        divValor.textContent = valores[carta.valor].simbolo;
        divPalo.textContent = palos[carta.palo].simbolo;

        divCarta.className = 'carta';
        divCarta.appendChild(divValor);
        divCarta.appendChild(divPalo);
        manoJugador.appendChild(divCarta);
    });
    valorJugador.textContent = juego.valorJugador;

    //Solo mostramos la primera carta del dealer
    if (juego.activo) {
        juego.manoIA.cartas.splice(1);
        juego.valorIA = valores[juego.manoIA.cartas[0].valor].valor;
        juego.manoIA.cartas.push({
            "palo": "OCULTO",
            "valor": "OCULTO"
        });
    }
    manoIA.innerHTML = '';
    juego.manoIA.cartas.forEach(carta => {
        const divCarta = document.createElement('div');
        const divValor = document.createElement('div');
        const divPalo = document.createElement('div');

        divValor.textContent = valores[carta.valor].simbolo;
        divPalo.textContent = palos[carta.palo].simbolo;

        divCarta.className = carta.palo === "OCULTO" ? 'cartaOculta' : 'carta';
        divCarta.appendChild(divValor);
        divCarta.appendChild(divPalo);
        manoIA.appendChild(divCarta);
    });
    valorIA.textContent = juego.valorIA;
};

/**
 * Función para calcular el valor de una mano
 * @param {Array} mano - La mano de cartas
 * @returns {number} - El valor de la mano
 */
function calcularValor(mano) {
    let valor = 0;
    let numAses = 0;
    for (const carta of mano) {
        let simbolo = valores[carta.valor].simbolo
        if (simbolo === 'A') {
            numAses++;
            valor += 11;
        } else if (simbolo === 'J' || simbolo === 'Q' || simbolo === 'K') {
            valor += 10;
        } else {
            valor += parseInt(valores[carta.valor].valor);
        }
    }
    while (valor > 21 && numAses > 0) {
        valor -= 10;
        numAses--;
    }
    return valor;
};

/**
 * Función para recuperar el juego
 */
function recuperarJuego() {
    const apuestas = document.querySelector('.apuestas');
    const juego = document.querySelector('.juego');

    if (localStorage.getItem('juegoID') !== null) {
        fetch(HOST + `/api/blackjack/juego/${localStorage.getItem('juegoID')}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(response => { return response.ok ? response.json() : Promise.reject(response) })
            .then(data => {
                // Se habilita la zona de juego
                apuestas.style.display = 'none';
                juego.style.display = 'block';
                actualizarJuego(data);
                if (!data.activo) {
                    finalizarJuego(calcularResultado(data));
                }
            })
            .catch(error => {
                console.error(error);
            });
    } else {
        fetch(HOST + '/api/blackjack/juegoActivo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
            .then(response => { return response.ok ? response.json() : Promise.reject(response) })
            .then(data => {
                // Se habilita la zona de juego y guardamos su id
                apuestas.style.display = 'none';
                juego.style.display = 'block';
                localStorage.setItem('juegoID', data.id);
                actualizarJuego(data);
                if (!data.activo) {
                    finalizarJuego(calcularResultado(data));
                }
            })
            .catch(error => {
                console.error(error);
            });
    }
}

/**
 * Agrega eventos de clic a los botones de apuestas
 */
document.getElementById('apuesta-5').addEventListener('click', function () {
    if (!this.classList.contains('disabled')) {
        playGame(5);
    }
});

document.getElementById('apuesta-25').addEventListener('click', function () {
    if (!this.classList.contains('disabled')) {
        playGame(25);
    }
});

document.getElementById('apuesta-50').addEventListener('click', function () {
    if (!this.classList.contains('disabled')) {
        playGame(50);
    }
});

document.getElementById('salir').addEventListener('click', function () {
    const juego = document.querySelector('.juego');
    const apuestas = document.querySelector('.apuestas');
    const buttons = document.querySelectorAll('.play-button');
    const resultadoDiv = document.querySelector('.resultado');
    const botones = document.querySelector('.jugador .buttons');
    resultadoDiv.style.display = 'none';
    juego.style.display = 'none';
    botones.style.display = 'flex';
    apuestas.style.display = 'block';
    buttons.forEach(button => button.classList.remove('disabled'));
});

/**
 * Función para cargar el ranking
 */
function loadRanking() {
    fetch(HOST + '/api/blackjack/ranking', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(data => {
            const rankingPanel = document.getElementById('ranking-panel');
            const rankingTitle = document.createElement('h3');
            const hr = document.createElement('hr');
            const rankingTable = document.createElement('table');
            const rankingTableGroup = document.createElement('colgroup');
            const colNombre = document.createElement('col');
            const colVictorias = document.createElement('col');

            rankingTitle.textContent = "RANKING";
            colNombre.span = "1";
            colNombre.style = "width: 75%";
            colVictorias.span = "1";
            colVictorias.style = "width: 25%";

            rankingTableGroup.appendChild(colNombre);
            rankingTableGroup.appendChild(colVictorias);
            rankingTable.appendChild(rankingTableGroup);

            data.usuarios.forEach((usuario, i) => {
                const fila = document.createElement('tr');
                const nombre = document.createElement('td');
                const victorias = document.createElement('td');

                nombre.textContent = usuario.username;
                nombre.title = usuario.username;
                victorias.textContent = data.victorias[i];
                victorias.title = data.victorias[i] + " victorias";

                fila.appendChild(nombre);
                fila.appendChild(victorias);
                rankingTable.appendChild(fila);
            });

            rankingPanel.replaceChildren(rankingTitle, hr, rankingTable);
        })
        .catch(error => console.error('Error:', error));
};

/**
 * Función para cargar los premios
 */
function loadPremios() {
    const premiosPanel = document.getElementById('premios-panel');
    const premiosTitle = document.createElement('h3');
    const hr = document.createElement('hr');
    const premiosTable = document.createElement('table');
    const premiosTableGroup = document.createElement('colgroup');
    const colApuestas = document.createElement('col');
    const colResultados = document.createElement('col');
    const colPremios = document.createElement('col');
    const apuestas = [5, 25, 50];

    premiosTitle.textContent = "PREMIOS";
    colApuestas.span = "1";
    colApuestas.style = "width: 30%";
    colResultados.span = "1";
    colResultados.style = "width: 40%";
    colPremios.span = "1";
    colPremios.style = "width: 30%";

    premiosTableGroup.appendChild(colApuestas);
    premiosTableGroup.appendChild(colResultados);
    premiosTableGroup.appendChild(colPremios);
    premiosTable.appendChild(premiosTableGroup);

    apuestas.forEach((apuesta) => {
        let resultado;
        let premio;
        for (let i = 0; i < 2; i++) {
            const fila = document.createElement('tr');
            const colApuesta = document.createElement('td');
            const colResultado = document.createElement('td');
            const colPremio = document.createElement('td');

            switch (i) {
                case 0:
                    resultado = "Victoria";
                    premio = apuesta * 2;
                    break;

                case 1:
                    resultado = "Empate";
                    premio = apuesta;
                    break;
            }

            colApuesta.textContent = `${apuesta}\t🪙`;
            colApuesta.title = `${apuesta} 🪙`;
            colResultado.textContent = resultado;
            colResultado.title = resultado;
            colPremio.textContent = `${premio}\t🪙`;
            colPremio.title = `${premio} 🪙`;

            fila.appendChild(colApuesta);
            fila.appendChild(colResultado);
            fila.appendChild(colPremio);
            premiosTable.appendChild(fila);
        }
    });
    premiosPanel.replaceChildren(premiosTitle, hr, premiosTable);
}

/**
 * Función para comprobar si el token es válido
 * @returns {boolean} - True si el token es válido, false de lo contrario
 */
function checkAuth() {
    try {
        const token = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
        return token.exp > Math.floor(Date.now() / 1000);
    } catch (error) {
        return false;
    }
}

/**
 * Función para pagar coins
 * @param {number} cost - El costo
 */
function pagarCoins(cost) {
    const coinsAmount = document.getElementById('coins-amount');
    const dinero = parseInt(coinsAmount.textContent.slice(0, -2), 10);
    coinsAmount.textContent = (dinero - cost) + "🪙";
}

/**
 * @author Danikileitor
 */
