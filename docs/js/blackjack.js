const palos = {
    OCULTO: { nombre: "Oculto", simbolo: "🔳" },
    CORAZONES: { nombre: "Corazones", simbolo: "♥️" },
    DIAMANTES: { nombre: "Diamantes", simbolo: "♦️" },
    PICAS: { nombre: "Picas", simbolo: "♠️" },
    TREBOLES: { nombre: "Tréboles", simbolo: "♣️" }
};

const valores = {
    OCULTO: { nombre: "Oculto", valor: 0, simbolo: "?" },
    AS: { nombre: "As", valor: 11, simbolo: "A" },
    DOS: { nombre: "Dos", valor: 2, simbolo: "2" },
    TRES: { nombre: "Tres", valor: 3, simbolo: "3" },
    CUATRO: { nombre: "Cuatro", valor: 4, simbolo: "4" },
    CINCO: { nombre: "Cinco", valor: 5, simbolo: "5" },
    SEIS: { nombre: "Seis", valor: 6, simbolo: "6" },
    SIETE: { nombre: "Siete", valor: 7, simbolo: "7" },
    OCHO: { nombre: "Ocho", valor: 8, simbolo: "8" },
    NUEVE: { nombre: "Nueve", valor: 9, simbolo: "9" },
    DIEZ: { nombre: "Diez", valor: 10, simbolo: "10" },
    JOTA: { nombre: "Jota", valor: 10, simbolo: "J" },
    REINA: { nombre: "Reina", valor: 10, simbolo: "Q" },
    REY: { nombre: "Rey", valor: 10, simbolo: "K" }
};

document.addEventListener('DOMContentLoaded', () => {
    const gameSection = document.getElementById('game-section');
    const logoutButton = document.getElementById('logout-button');
    const pedirCarta = document.getElementById('pedir-carta');
    const plantarse = document.getElementById('plantarse');

    pedirCarta.addEventListener('click', () => {
        const id = localStorage.getItem('juegoID');
        fetch(`/pedir-carta/${id}`, {
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

    plantarse.addEventListener('click', () => {
        const id = localStorage.getItem('juegoID');
        fetch(`/plantarse/${id}`, {
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

    const toggleSections = () => {
        if (!!localStorage.getItem('token')) {
            gameSection.style.display = 'block';
        } else {
            location.replace = "/"
        }
    };

    // Manejo del cierre de sesión
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('juegoID');
        toggleSections();
    });

    // Comprueba si hay token almacenado
    if (checkAuth()) {
        loadPremios();
        loadCoins();
        loadRanking();
        recuperarJuego();
    } else {
        localStorage.removeItem('token');
    }

    // Inicializa el estado inicial
    toggleSections();
});

// Función para cargar las monedas del usuario
function loadCoins() {
    const coinsAmount = document.getElementById('coins-amount');
    fetch('/coins', {
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

// Función para empezar el juego
function playGame(apuesta) {
    // Obtén los botones de apuestas y las secciones de juego y apuestas
    const buttons = document.querySelectorAll('.play-button');
    const apuestas = document.querySelector('.apuestas');
    const juego = document.querySelector('.juego');

    // Añade la clase disabled a todos los botones de apuestas
    buttons.forEach(button => button.classList.add('disabled'));

    // Envía la solicitud al servidor
    fetch(`/crear-juego/${apuesta}`, {
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

function calcularResultado(juego) {
    if (juego.valorJugador === 21 && juego.valorIA === 21) { return 0; }
    else if (juego.valorJugador === 21) { return 1; }
    else { return 2; }
}

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

// No hace falta pero esta wapo tenerlo
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

function recuperarJuego() {
    const apuestas = document.querySelector('.apuestas');
    const juego = document.querySelector('.juego');

    if (localStorage.getItem('juegoID') !== null) {
        fetch(`/juego/${localStorage.getItem('juegoID')}`, {
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
        fetch('/juegoActivo', {
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

// Agrega eventos de clic a los botones de apuestas
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

function loadRanking() {
    fetch('/ranking', {
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

function checkAuth() {
    try {
        const token = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
        return token.exp > Math.floor(Date.now() / 1000);
    } catch (error) {
        return false;
    }
}

function pagarCoins(cost) {
    const coinsAmount = document.getElementById('coins-amount');
    const dinero = parseInt(coinsAmount.textContent.slice(0, -2), 10);
    coinsAmount.textContent = (dinero - cost) + "🪙";
}