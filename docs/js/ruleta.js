/**
 * Importa la variable HOST desde el archivo host.js
 */
import { HOST } from "./host.js";

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

    /**
     * Función para alternar entre la sección de juego y la sección de inicio
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
        toggleSections();
    });

    /**
     * Comprueba si hay token almacenado
     */
    if (checkAuth()) {
        loadPremios();
        loadRuletas();
        loadCoins();
        loadRanking();
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
 * Función para cargar las ruletas
 */
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
            tabla.className = "tablaRuletas";
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

/**
 * Función para crear una ruleta
 */
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

/**
 * Función para ver una ruleta
 * @param {number} id - El id de la ruleta
 * @param {boolean} girar - Indica si se debe girar la ruleta
 */
function verRuleta(id, girar = false) {
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
            const div = document.createElement('div');
            const svg = generateSvg(data);
            const acciones = document.createElement('div');
            const salir = document.createElement('button');
            const { ruletaSVG, grupo, bola } = generarRuleta();

            div.className = "ruleta";
            salir.textContent = "↩️";
            salir.title = "Salir de la ruleta";

            salir.addEventListener("click", () => {
                loadRuletas();
            });

            if (data.ruletaAbierta) {
                const actualizar = document.createElement('button');
                const girar = document.createElement('button');

                actualizar.textContent = "🔄️";
                actualizar.title = "Refrescar ruleta";
                girar.textContent = "🎡";
                girar.title = "Girar ruleta";
                acciones.className = "buttons";

                actualizar.addEventListener("click", () => {
                    verRuleta(data.id);
                });

                girar.addEventListener("click", () => {
                    girarRuleta(data.id);
                });

                acciones.replaceChildren(salir, actualizar, girar);
            } else {
                acciones.replaceChildren(salir);
            }

            div.replaceChildren(svg, ruletaSVG);
            ruletas.replaceChildren(acciones, div);

            if (girar) {
                lanzarRuleta(grupo, bola, data.numeroGanador);
            }
        })
        .catch(error => console.error('Error:', error));
}

/**
 * Función para generar el código SVG
 * @param {Object} ruleta - El objeto de la ruleta
 * @returns {SVGElement} - El elemento SVG generado
 */
function generateSvg(ruleta) {
    const svgNamespaces = {
        svg: "http://www.w3.org/2000/svg",
        xlink: "http://www.w3.org/1999/xlink"
    };

    const imagePath = "images/ruleta.png";

    /**
     * Crear el contenedor SVG
     */
    const svg = document.createElementNS(svgNamespaces.svg, "svg");
    svg.setAttribute("version", "1.1");
    svg.setAttribute("xmlns", svgNamespaces.svg);
    svg.setAttribute("xmlns:xlink", svgNamespaces.xlink);
    svg.setAttribute("viewBox", "0 0 420 799");
    svg.id = ruleta.id;

    /**
     * Añadir la imagen
     */
    const image = document.createElementNS(svgNamespaces.svg, "image");
    image.setAttribute("width", "420");
    image.setAttribute("height", "799");
    image.setAttributeNS(svgNamespaces.xlink, "href", imagePath);
    svg.appendChild(image);

    /**
     * Función para crear los elementos <a> y <rect>
     * @param {number} x - La coordenada x del rectángulo
     * @param {number} y - La coordenada y del rectángulo
     * @param {number} width - El ancho del rectángulo
     * @param {number} height - El alto del rectángulo
     * @param {string} casilla - La casilla de la ruleta
     * @returns {SVGElement} - El elemento <a> creado
     */
    function createLink(x, y, width, height, casilla) {
        const a = document.createElementNS(svgNamespaces.svg, "a");
        a.setAttribute("href", "javascript:void(0)");  // Evitar navegación

        const rect = document.createElementNS(svgNamespaces.svg, "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", width);
        rect.setAttribute("height", height);
        rect.setAttribute("fill", "rgba(0, 0, 0, 0)");

        /**
         * Agregar evento para resaltar el rectángulo al pasar el mouse sobre él
         */
        rect.addEventListener("mouseover", () => {
            rect.setAttribute("fill", "rgba(255, 255, 0, 0.5)");  // Resaltar con color amarillo semitransparente
        });

        /**
         * Agregar evento para restaurar el color original del rectángulo al quitar el mouse
         */
        rect.addEventListener("mouseout", () => {
            rect.setAttribute("fill", "rgba(0, 0, 0, 0)");  // Restaurar al color original
        });

        /**
         * Agregar evento para llamar a la función apostar con la casilla al hacer click en el rectángulo
         */
        rect.addEventListener("click", () => {
            apostar(ruleta.id, casilla);
        });

        a.appendChild(rect);
        return a;
    }

    /**
     * Coordenadas y dimensiones para los rectángulos
     */
    const rects = [
        { x: 73, y: 87, width: 61, height: 106, casilla: "Bajo" },
        { x: 73, y: 193, width: 61, height: 105, casilla: "Par" },
        { x: 73, y: 298, width: 61, height: 106, casilla: "Rojo" },
        { x: 73, y: 404, width: 61, height: 106, casilla: "Negro" },
        { x: 73, y: 510, width: 61, height: 106, casilla: "Impar" },
        { x: 73, y: 616, width: 61, height: 106, casilla: "Alto" },
        { x: 134, y: 87, width: 62, height: 211, casilla: "Docena-1" },
        { x: 134, y: 298, width: 62, height: 212, casilla: "Docena-2" },
        { x: 134, y: 510, width: 62, height: 212, casilla: "Docena-3" },
        { x: 196, y: 32, width: 160, height: 55, casilla: "0" },
        ...Array.from({ length: 36 }, (_, i) => ({
            x: 196 + (i % 3) * 53,
            y: 87 + Math.floor(i / 3) * 53,
            width: 53,
            height: 53,
            casilla: (i + 1).toString()
        })),
        { x: 196, y: 722, width: 53, height: 33, casilla: "Columna-1" },
        { x: 249, y: 722, width: 53, height: 33, casilla: "Columna-2" },
        { x: 302, y: 722, width: 53, height: 33, casilla: "Columna-3" }
    ];

    /**
     *  Crear los enlaces y rectángulos
     */
    rects.forEach(rectData => {
        svg.appendChild(createLink(rectData.x, rectData.y, rectData.width, rectData.height, rectData.casilla));
    });

    return svg;
}

/**
 * Función para apostar en una ruleta
 * @param {number} id - El id de la ruleta
 * @param {string} casilla - La casilla en la que se apuesta
 */
function apostar(id, casilla) {
    const cantidad = parseInt(prompt(`Introduce la cantidad de monedas a apostar a ${casilla}:`), 10);
    if (isNaN(cantidad)) {
        cantidad = 0;
    }
    let apuesta;

    switch (casilla) {
        case "Bajo":
            apuesta = { tipo: "BAJO", cantidad: cantidad };
            break;
        case "Alto":
            apuesta = { tipo: "ALTO", cantidad: cantidad };
            break;
        case "Par":
            apuesta = { tipo: "PAR", cantidad: cantidad };
            break;
        case "Impar":
            apuesta = { tipo: "IMPAR", cantidad: cantidad };
            break;
        case "Rojo":
            apuesta = { tipo: "ROJO", cantidad: cantidad };
            break;
        case "Negro":
            apuesta = { tipo: "NEGRO", cantidad: cantidad };
            break;
        case "Docena-1":
            apuesta = { tipo: "DOCENA1", cantidad: cantidad };
            break;
        case "Docena-2":
            apuesta = { tipo: "DOCENA2", cantidad: cantidad };
            break;
        case "Docena-3":
            apuesta = { tipo: "DOCENA3", cantidad: cantidad };
            break;
        case "Columna-1":
            apuesta = { tipo: "COLUMNA1", cantidad: cantidad };
            break;
        case "Columna-2":
            apuesta = { tipo: "COLUMNA2", cantidad: cantidad };
            break;
        case "Columna-3":
            apuesta = { tipo: "COLUMNA3", cantidad: cantidad };
            break;
        default:
            apuesta = { tipo: "PLENO", n1: parseInt(casilla, 10), cantidad: cantidad }
    }

    fetch(HOST + `/api/ruleta/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(apuesta)
    })
        .then(response => response.json())
        .then(data => {
            verRuleta(id);
            pagarCoins(cantidad);
        })
        .catch(error => console.error('Error:', error));
}

/**
 * Función para cerrar una ruleta
 * @param {number} id - El id de la ruleta
 */
function cerrarRuleta(id) {
    fetch(HOST + `/api/ruleta/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(data => {
            verRuleta(id);
        })
        .catch(error => console.error('Error:', error));
}

/**
 * Función para girar una ruleta
 * @param {number} id - El id de la ruleta
 */
function girarRuleta(id) {
    fetch(HOST + `/api/ruleta/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(data => {
            verRuleta(id, true);
        })
        .catch(error => console.error('Error:', error));
}

/**
 * Función para generar el SVG de la ruleta
 * @returns {Object} - Un objeto con el SVG de la ruleta, la ruleta y la bola
 */
function generarRuleta() {
    // Creamos el SVG
    const ruletaSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    ruletaSVG.setAttribute("viewBox", "0 0 400 400");

    // Creamos el grupo de la ruleta
    const grupo = document.createElementNS("http://www.w3.org/2000/svg", "g");
    ruletaSVG.appendChild(grupo);

    // Creamos el círculo de la ruleta
    const ruleta = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ruleta.setAttribute("cx", 200);
    ruleta.setAttribute("cy", 200);
    ruleta.setAttribute("r", 180);
    ruleta.setAttribute("fill", "none");
    ruleta.setAttribute("stroke", "black");
    ruleta.setAttribute("stroke-width", 2);
    grupo.appendChild(ruleta);

    // Creamos las casillas de la ruleta
    for (let i = 0; i < 37; i++) {
        const anguloInicio = (i * 9.73) * Math.PI / 180;
        const anguloFin = ((i + 1) * 9.73) * Math.PI / 180;
        const radioExterno = 170;
        const radioInterno = 50;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `
        M ${200 + radioExterno * Math.cos(anguloInicio)} ${200 + radioExterno * Math.sin(anguloInicio)}
        A ${radioExterno} ${radioExterno} 0 0 1 ${200 + radioExterno * Math.cos(anguloFin)} ${200 + radioExterno * Math.sin(anguloFin)}
        L ${200 + radioInterno * Math.cos(anguloFin)} ${200 + radioInterno * Math.sin(anguloFin)}
        A ${radioInterno} ${radioInterno} 0 0 0 ${200 + radioInterno * Math.cos(anguloInicio)} ${200 + radioInterno * Math.sin(anguloInicio)}
        Z
      `);
        path.setAttribute("fill", i === 0 ? "green" : (i % 2 === 0 ? "black" : "red"));
        path.setAttribute("stroke", "black");
        path.setAttribute("stroke-width", 1);
        grupo.appendChild(path);

        // Agregamos el texto de la casilla
        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        const radio = radioExterno - 20;
        const anguloTexto = (anguloInicio + anguloFin) / 2;
        texto.setAttribute("x", 200 + radio * Math.cos(anguloTexto));
        texto.setAttribute("y", 200 + radio * Math.sin(anguloTexto));
        texto.setAttribute("dominant-baseline", "middle");
        texto.setAttribute("text-anchor", "middle");
        texto.setAttribute("font-size", 14);
        texto.setAttribute("fill", i === 0 ? "black" : (i % 2 === 0 ? "white" : "black"));
        texto.setAttribute("transform", `rotate(${(anguloTexto * 180 / Math.PI) - 90} ${200 + radio * Math.cos(anguloTexto)} ${200 + radio * Math.sin(anguloTexto)})`);
        texto.textContent = i.toString();
        grupo.appendChild(texto);
    }

    // Creamos la bola
    const bola = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bola.setAttribute("cx", 200);
    bola.setAttribute("cy", 200);
    bola.setAttribute("r", 10);
    bola.setAttribute("fill", "white");
    ruletaSVG.appendChild(bola);

    return { ruletaSVG, grupo, bola };
}

/**
 * Función para lanzar la ruleta
 * @param {SVGElement} grupo - La ruleta con los números
 * @param {SVGElement} bola - La bola
 * @param {number} resultado - El resultado de la ruleta
 */
function lanzarRuleta(grupo, bola, resultado) {
    // Animamos la ruleta y la bola
    let angulo = 0;
    let anguloBola = 0;
    const intervalo = setInterval(() => {
        angulo += 10;
        grupo.setAttribute("transform", `rotate(${angulo} 200 200)`);
        anguloBola += 5;
        const radio = 150;
        const x = 200 + radio * Math.cos(anguloBola * Math.PI / 180);
        const y = 200 + radio * Math.sin(anguloBola * Math.PI / 180);
        bola.setAttribute("cx", x);
        bola.setAttribute("cy", y);
        if (angulo >= 360 * 10) {
            clearInterval(intervalo);
            // Animamos la bola hacia el resultado
            const anguloInicio = (resultado * 9.73) * Math.PI / 180;
            const anguloFin = ((resultado + 1) * 9.73) * Math.PI / 180;
            const radioExterno = 170;
            const radio = radioExterno - 20;
            const x = 200 + radio * Math.cos((anguloInicio + anguloFin) / 2);
            const y = 200 + radio * Math.sin((anguloInicio + anguloFin) / 2);
            const intervaloBola = setInterval(() => {
                const cx = parseFloat(bola.getAttribute("cx"));
                const cy = parseFloat(bola.getAttribute("cy"));
                if (Math.abs(cx - x) < 1 && Math.abs(cy - y) < 1) {
                    clearInterval(intervaloBola);
                    alert(`El resultado es: ${resultado}`);
                    loadCoins();
                } else {
                    bola.setAttribute("cx", cx + (x - cx) / 10);
                    bola.setAttribute("cy", cy + (y - cy) / 10);
                }
            }, 16);
        }
    }, 16);
}

/**
 * @author Danikileitor
 */
