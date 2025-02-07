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
            const svg = generateSvg();
            ruletas.replaceChildren(svg);
        })
        .catch(error => console.error('Error:', error));
}

// Función para generar el código SVG
function generateSvg() {
    // Configuración de la ruleta
    const ruletaConfig = {
        image: 'images/ruleta.png',
        width: 420,
        height: 799,
        zones: [
            { name: '1-18', x: 20, y: 20, width: 120, height: 60 },
            { name: '19-36', x: 150, y: 20, width: 120, height: 60 },
            { name: 'Par', x: 20, y: 90, width: 120, height: 60 },
            { name: 'Impar', x: 150, y: 90, width: 120, height: 60 },
            { name: '1ª docena', x: 20, y: 160, width: 120, height: 60 },
            { name: '2ª docena', x: 150, y: 160, width: 120, height: 60 },
            { name: '3ª docena', x: 280, y: 160, width: 120, height: 60 },
            { name: 'Columna 1', x: 20, y: 230, width: 40, height: 120 },
            { name: 'Columna 2', x: 70, y: 230, width: 40, height: 120 },
            { name: 'Columna 3', x: 120, y: 230, width: 40, height: 120 },
        ],
        numbers: [
            { x: 50, y: 200, num: "0" },
            { x: 70, y: 220, num: "1" },
            { x: 90, y: 240, num: "2" },
            { x: 110, y: 260, num: "3" },
            { x: 130, y: 280, num: "4" },
            { x: 150, y: 300, num: "5" },
            { x: 170, y: 320, num: "6" },
            { x: 190, y: 340, num: "7" },
            { x: 210, y: 360, num: "8" },
            { x: 230, y: 380, num: "9" },
            { x: 250, y: 400, num: "10" },
            { x: 270, y: 420, num: "11" },
            { x: 290, y: 440, num: "12" },
            { x: 310, y: 460, num: "13" },
            { x: 330, y: 480, num: "14" },
            { x: 350, y: 500, num: "15" },
            { x: 370, y: 520, num: "16" },
            { x: 390, y: 540, num: "17" },
            { x: 410, y: 560, num: "18" },
            { x: 390, y: 580, num: "19" },
            { x: 370, y: 600, num: "20" },
            { x: 350, y: 620, num: "21" },
            { x: 330, y: 640, num: "22" },
            { x: 310, y: 660, num: "23" },
            { x: 290, y: 680, num: "24" },
            { x: 270, y: 700, num: "25" },
            { x: 250, y: 720, num: "26" },
            { x: 230, y: 740, num: "27" },
            { x: 210, y: 760, num: "28" },
            { x: 190, y: 780, num: "29" },
            { x: 170, y: 700, num: "30" },
            { x: 150, y: 680, num: "31" },
            { x: 130, y: 660, num: "32" },
            { x: 110, y: 640, num: "33" },
            { x: 90, y: 620, num: "34" },
            { x: 70, y: "600", num: "35" },
            { x: 50, y: 580, num: "36" },
        ]
    };
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', ruletaConfig.width);
    svg.setAttribute('height', ruletaConfig.height);
    svg.setAttribute('viewBox', `0 0 ${ruletaConfig.width} ${ruletaConfig.height}`);

    // Agregar la imagen de la ruleta
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('href', ruletaConfig.image);
    image.setAttribute('x', 0);
    image.setAttribute('y', 0);
    image.setAttribute('width', ruletaConfig.width);
    image.setAttribute('height', ruletaConfig.height);
    svg.appendChild(image);

    // Agregar las zonas de apuesta
    ruletaConfig.zones.forEach((zone) => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'a');
        rect.setAttribute('href', `#${zone.name}`);
        rect.setAttribute('alt', zone.name);
        rect.setAttribute('title', zone.name);
        const rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectElement.setAttribute('x', zone.x);
        rectElement.setAttribute('y', zone.y);
        rectElement.setAttribute('width', zone.width);
        rectElement.setAttribute('height', zone.height);
        rectElement.setAttribute('fill', 'none');
        rectElement.setAttribute('stroke', 'black');
        rectElement.setAttribute('stroke-width', 2);
        rect.appendChild(rectElement);
        svg.appendChild(rect);
    });

    // Agregar los números de la ruleta
    ruletaConfig.numbers.forEach((numero) => {
        const a = document.createElementNS("http://www.w3.org/2000/svg", "a");
        a.setAttribute("href", "#");
        a.setAttribute("alt", numero.num);
        a.setAttribute("title", numero.num);
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", numero.x);
        circle.setAttribute("cy", numero.y);
        circle.setAttribute("r", "20");
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke", "black");
        circle.setAttribute("stroke-width", "2");
        a.appendChild(circle);
        svg.appendChild(a);
    });

    return svg;
}

function apostar(casilla) {
    // Falta esto
}