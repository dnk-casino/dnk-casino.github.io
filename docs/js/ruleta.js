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
    const colPremios = document.createElement('col');
    const apuestas = [
        { tipo: "Pleno", numeros: 1, premio: 35 },
        { tipo: "Caballo", numeros: 2, premio: 17 },
        { tipo: "Transversal", numeros: 3, premio: 11 },
        { tipo: "Cuadro", numeros: 4, premio: 8 },
        { tipo: "Seisena", numeros: 6, premio: 5 },
        { tipo: "Columna", numeros: 12, premio: 2 },
        { tipo: "Docena", numeros: 12, premio: 2 },
        { tipo: "Doble Columna", numeros: 24, premio: 1.5 },
        { tipo: "Doble Docena", numeros: 24, premio: 1.5 }
    ];

    premiosTitle.textContent = "PREMIOS";
    colApuestas.span = "1";
    colApuestas.style = "width: 60%";
    colPremios.span = "1";
    colPremios.style = "width: 40%";

    premiosTableGroup.appendChild(colApuestas);
    premiosTableGroup.appendChild(colPremios);
    premiosTable.appendChild(premiosTableGroup);

    apuestas.forEach((apuesta) => {
        const fila = document.createElement('tr');
        const colApuesta = document.createElement('td');
        const colPremio = document.createElement('td');

        colApuesta.textContent = apuesta.tipo;
        colApuesta.title = `x${apuesta.tipo}: ${apuesta.numeros} ` + (apuesta.numeros > 1 ? "Números" : "Número");
        colPremio.textContent = `x${apuesta.premio}\t🪙`;
        colPremio.title = `x${apuesta.premio} 🪙`;

        fila.appendChild(colApuesta);
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

            ruleta.src = "images/ruleta.png";
            ruleta.useMap = "#ruleta";
            mapa.name = "ruleta";

            // Números del 0 al 36
            for (let i = 0; i <= 36; i++) {
                const area = document.createElement('area');
                area.alt = i;
                area.title = i;
                area.shape = "rect";
                area.addEventListener('click', () => { apostar(i); });
                switch (i) {
                    case 0:
                        area.coords = "100,100,120,120";
                        area.href = "#";
                        break;
                    case 1:
                        area.coords = "120,80,140,100";
                        area.href = "#";
                        break;
                    case 2:
                        area.coords = "140,80,160,100";
                        area.href = "#";
                        break;
                    case 3:
                        area.coords = "160,80,180,100";
                        area.href = "#";
                        break;
                    case 4:
                        area.coords = "180,80,200,100";
                        area.href = "#";
                        break;
                    case 5:
                        area.coords = "200,80,220,100";
                        area.href = "#";
                        break;
                    case 6:
                        area.coords = "220,80,240,100";
                        area.href = "#";
                        break;
                    case 7:
                        area.coords = "240,80,260,100";
                        area.href = "#";
                        break;
                    case 8:
                        area.coords = "260,80,280,100";
                        area.href = "#";
                        break;
                    case 9:
                        area.coords = "280,80,300,100";
                        area.href = "#";
                        break;
                    case 10:
                        area.coords = "120,100,140,120";
                        area.href = "#";
                        break;
                    case 11:
                        area.coords = "140,100,160,120";
                        area.href = "#";
                        break;
                    case 12:
                        area.coords = "160,100,180,120";
                        area.href = "#";
                        break;
                    case 13:
                        area.coords = "180,100,200,120";
                        area.href = "#";
                        break;
                    case 14:
                        area.coords = "200,100,220,120";
                        area.href = "#";
                        break;
                    case 15:
                        area.coords = "220,100,240,120";
                        area.href = "#";
                        break;
                    case 16:
                        area.coords = "240,100,260,120";
                        area.href = "#";
                        break;
                    case 17:
                        area.coords = "260,100,280,120";
                        area.href = "#";
                        break;
                    case 18:
                        area.coords = "280,100,300,120";
                        area.href = "#";
                        break;
                    case 19:
                        area.coords = "120,120,140,140";
                        area.href = "#";
                        break;
                    case 20:
                        area.coords = "140,120,160,140";
                        area.href = "#";
                        break;
                    case 21:
                        area.coords = "160,120,180,140";
                        area.href = "#";
                        break;
                    case 22:
                        area.coords = "180,120,200,140";
                        area.href = "#";
                        break;
                    case 23:
                        area.coords = "200,120,220,140";
                        area.href = "#";
                        break;
                    case 24:
                        area.coords = "220,120,240,140";
                        area.href = "#";
                        break;
                    case 25:
                        area.coords = "240,120,260,140";
                        area.href = "#";
                        break;
                    case 26:
                        area.coords = "260,120,280,140";
                        area.href = "#";
                        break;
                    case 27:
                        area.coords = "280,120,300,140";
                        area.href = "#";
                        break;
                    case 28:
                        area.coords = "120,140,140,160";
                        area.href = "#";
                        break;
                    case 29:
                        area.coords = "140,140,160,160";
                        area.href = "#";
                        break;
                    case 30:
                        area.coords = "160,140,180,160";
                        area.href = "#";
                        break;
                    case 31:
                        area.coords = "180,140,200,160";
                        area.href = "#";
                        break;
                    case 32:
                        area.coords = "200,140,220,160";
                        area.href = "#";
                        break;
                    case 33:
                        area.coords = "220,140,240,160";
                        area.href = "#";
                        break;
                    case 34:
                        area.coords = "240,140,260,160";
                        area.href = "#";
                        break;
                    case 35:
                        area.coords = "260,140,280,160";
                        area.href = "#";
                        break;
                    case 36:
                        area.coords = "280,140,300,160";
                        area.href = "#";
                        break;
                    default:
                        area.coords = "0,0,0,0";
                        break;
                }
                mapa.appendChild(area);
            }

            // Apuestas especiales
            const apuestasEspeciales = [
                { nombre: "Par", coords: "400,50,450,80" },
                { nombre: "Impar", coords: "400,100,450,130" },
                { nombre: "Rojo", coords: "400,150,450,180" },
                { nombre: "Negro", coords: "400,200,450,230" },
                { nombre: "Bajo", coords: "400,250,450,280" },
                { nombre: "Alto", coords: "400,300,450,330" },
                { nombre: "1ª Docena", coords: "500,50,550,80" },
                { nombre: "2ª Docena", coords: "500,100,550,130" },
                { nombre: "3ª Docena", coords: "500,150,550,180" },
                { nombre: "Columna 1", coords: "550,50,600,80" },
                { nombre: "Columna 2", coords: "550,100,600,130" },
                { nombre: "Columna 3", coords: "550,150,600,180" },
            ];

            apuestasEspeciales.forEach((apuesta) => {
                const area = document.createElement('area');
                area.alt = apuesta.nombre;
                area.title = apuesta.nombre;
                area.shape = "rect";
                area.coords = apuesta.coords;
                area.href = "#";
                area.addEventListener('click', () => { apostar(apuesta.nombre); });
                mapa.appendChild(area);
            });

            ruletas.replaceChildren(ruleta, mapa);
        })
        .catch(error => console.error('Error:', error));
}

function apostar(casilla) {
    // Falta esto
}