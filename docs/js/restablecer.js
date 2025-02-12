/**
 * Importa la variable HOST desde el archivo host.js
 */
import { HOST } from "./host.js";

/**
 * Selecciona elementos del DOM para su uso posterior
 */
const formulario = document.getElementById('formulario-restablecer');
const tokenInput = document.getElementById('token');
const nuevaContrasenaInput = document.getElementById('nuevaContrasena');
const confirmarContrasenaInput = document.getElementById('confirmarContrasena');
const mensajeDiv = document.getElementById('mensaje');

/**
 * Manejo del formulario de restablecer contraseña
 * @param {Event} e - Evento de envío del formulario
 */
formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const token = tokenInput.value.trim();
    const nuevaContrasena = nuevaContrasenaInput.value.trim();
    const confirmarContrasena = confirmarContrasenaInput.value.trim();

    /**
     * Verifica que todos los campos estén llenos
     */
    if (token !== '' && nuevaContrasena !== '' && confirmarContrasena !== '') {
        /**
         * Verifica que las contraseñas coincidan
         */
        if (nuevaContrasena === confirmarContrasena) {
            /**
             * Envía una solicitud POST al servidor para restablecer la contraseña
             */
            fetch(HOST + '/api/auth/restablecer-contrasena/' + token, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nuevaContrasena: nuevaContrasena })
            })
                .then(response => response.text())
                .then(data => {
                    /**
                     * Muestra el mensaje de respuesta del servidor
                     */
                    mensajeDiv.innerHTML = data;
                })
                .catch(error => {
                    /**
                     * Muestra el mensaje de error
                     */
                    mensajeDiv.innerHTML = error;
                });
        } else {
            /**
             * Muestra un mensaje de error si las contraseñas no coinciden
             */
            mensajeDiv.innerHTML = 'Las contraseñas no coinciden.';
        }
    } else {
        /**
         * Muestra un mensaje de error si no se han llenado todos los campos
         */
        mensajeDiv.innerHTML = 'Por favor, ingrese todos los campos.';
    }
});

/**
 * @author Danikileitor
 */
