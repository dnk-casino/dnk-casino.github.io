import { HOST } from "./host.js";

document.addEventListener('DOMContentLoaded', () => {
    const gameSection = document.getElementById('game-section');
    const logoutButton = document.getElementById('logout-button');

    const toggleSections = () => {
        if (!!localStorage.getItem('token')) {
            gameSection.style.display = 'block';
        } else {
            location.replace("/");
        }
    };

    // Manejo del cierre de sesión
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        toggleSections();
    });

    // Comprueba si hay token almacenado
    if (checkAuth()) {
        loadPremios();
        loadRuletas();
        loadCoins();
        loadRanking();
    } else {
        localStorage.removeItem('token');
    }

    // Inicializa el estado inicial
    toggleSections();
});

// Función para cargar las monedas del usuario
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

function loadPremios() {
    const premiosPanel = document.getElementById('premios-panel');
    const premiosTitle = document.createElement('h3');
    const hr = document.createElement('hr');
    const premiosTable = document.createElement('table');
    const premiosTableGroup = document.createElement('colgroup');
    const colApuestas = document.createElement('col');
    const colResultados = document.createElement('col');
    const colPremios = document.createElement('col');
    const apuestas = [
        ["Pleno", { numeros: 1, premio: 35 }],
        ["Caballos", { numeros: 2, premio: 17 }],
        ["Transversal", { numeros: 3, premio: 11 }],
        ["Cuadro", { numeros: 4, premio: 8 }],
        ["Seisena", { numeros: 6, premio: 5 }],
        ["Columna", { numeros: 12, premio: 2 }],
        ["Decena", { numeros: 12, premio: 2 }],
        ["Doble Columna", { numeros: 24, premio: 1.5 }],
        ["Doble Docena", { numeros: 24, premio: 1.5 }]
    ];

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
        const fila = document.createElement('tr');
        const colApuesta = document.createElement('td');
        const colResultado = document.createElement('td');
        const colPremio = document.createElement('td');

        colApuesta.textContent = apuesta;
        colApuesta.title = colApuesta.textContent;
        colResultado.textContent = apuesta.numeros + apuesta.numeros > 1 ? "Números" : "Número";
        colResultado.title = colResultado.textContent;
        colPremio.textContent = `x${apuesta.premio}\t🪙`;
        colPremio.title = `x${apuesta.premio} 🪙`;

        fila.appendChild(colApuesta);
        fila.appendChild(colResultado);
        fila.appendChild(colPremio);
        premiosTable.appendChild(fila);
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

function loadRuletas() {
    fetch(HOST + '/api/ruleta/abiertas', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(data => {
            const ruletas = document.getElementById('ruletas');
            const tabla = document.createElement('table');
            data.forEach((ruleta, i) => {
                const fila = document.createElement('tr');
                const nombre = document.createElement('td');
                const acciones = document.createElement('td');
                const entrar = document.createElement('button');

                nombre.textContent = "Ruleta #" + (i + 1);
                nombre.title = nombre.textContent;
                entrar.textContent = "👁️"
                entrar.title = "Ver ruleta #" + (i + 1);
                entrar.addEventListener('click', () => { verRuleta(ruleta.id); });
                acciones.appendChild(entrar);
                fila.appendChild(nombre);
                fila.appendChild(acciones);
                tabla.appendChild(fila);
            });
            ruletas.replaceChildren(tabla);

            if (data.length < 5) {
                const addRuleta = document.createElement('button');
                addRuleta.textContent = "Añadir ruleta";
                addRuleta.title = addRuleta.textContent;
                addRuleta.addEventListener('click', () => { crearRuleta(); });
                ruletas.appendChild(addRuleta);
            }
        })
        .catch(error => console.error('Error:', error));
}

function crearRuleta() {
    fetch(HOST + '/api/ruleta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            loadRuletas();
        })
        .catch(error => console.error('Error:', error));
}

function verRuleta(id) {
    fetch(HOST + `/api/ruleta/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(data => {
            const ruletas = document.getElementById('ruletas');
            const ruleta = document.createElement('img');
            const mapa = document.createElement('map');

            ruleta.src = "images/ruleta.jpg";
            ruleta.useMap = "#ruleta";
            mapa.name = "ruleta";
            for (let i = 0; i <= 36; i++) {
                const area = document.createElement('area');
                area.alt = i;
                area.title = i;
                area.shape = "rect";
                area.addEventListener('click', () => { apostar(i); });
                switch (i) {
                    case 1:
                        area.coords = "10,10,10,10";
                        break;

                    //case 0
                    default:
                        area.coords = "0,0,0,0";
                        break;
                }
                mapa.appendChild(area);
            }
            //Falta las areas para las apuestas que no son Plenos

            ruletas.replaceChildren(ruleta, mapa);
        })
        .catch(error => console.error('Error:', error));
}

function apostar(casilla) {
    // Falta esto
}