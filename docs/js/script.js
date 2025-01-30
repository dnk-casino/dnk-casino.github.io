document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const gameSection = document.getElementById('game-section');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const restablecerForm = document.getElementById('restablecerForm');
    const showLoginButton = document.getElementById('showLogin');
    const showLoginButton2 = document.getElementById('showLogin2');
    const showRegisterButton = document.getElementById('showRegister');
    const showRestablecerButton = document.getElementById('showRestablecer');
    const logoutButton = document.getElementById('logout-button');
    const authSectionTitle = document.getElementById('auth-section-title');

    const toggleSections = () => {
        if (!!localStorage.getItem('token')) {
            authSection.style.display = 'none';
            gameSection.style.display = 'block';
        } else {
            gameSection.style.display = 'none';
            authSection.style.display = 'block';
        }
    };

    // Manejo del formulario de login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const token = await response.text(); // Podrías guardar un JWT si usas uno
            localStorage.setItem('token', token);
            loadCoins();
            cargarSkins();
            loadRanking();
            toggleSections();
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    });

    // Manejo del formulario de registro
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const email = document.getElementById('registerEmail').value;

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email, rol: 'ROLE_USER' })
        });

        if (response.ok) {
            alert('Usuario registrado exitosamente');
            authSectionTitle.innerText = 'Iniciar Sesión';
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        } else {
            const error = await response.text();
            alert(`Error: ${error}`);
        }
    });

    // Manejo del formulario de restablecer contraseña
    restablecerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const correo = document.getElementById('restablecerEmail').value.trim();
        const mensajeDiv = document.getElementById('restablecerMessage');

        if (correo !== '') {
            fetch('/api/auth/olvidar-contrasena', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: correo })
            })
                .then(response => response.text())
                .then(data => mensajeDiv.innerHTML = data)
                .catch(error => mensajeDiv.innerHTML = error);
        } else {
            mensajeDiv.innerHTML = 'Por favor, ingrese su correo electrónico.';
        }
    });

    // Alternar entre login y registro
    showLoginButton.addEventListener('click', () => {
        registerForm.style.display = 'none';
        authSectionTitle.innerText = 'Iniciar Sesión';
        loginForm.style.display = 'block';
    });

    showLoginButton2.addEventListener('click', () => {
        restablecerForm.style.display = 'none';
        authSectionTitle.innerText = 'Iniciar Sesión';
        loginForm.style.display = 'block';
    });

    showRegisterButton.addEventListener('click', () => {
        loginForm.style.display = 'none';
        authSectionTitle.innerText = 'Registrarse';
        registerForm.style.display = 'block';
    });

    showRestablecerButton.addEventListener('click', () => {
        loginForm.style.display = 'none';
        authSectionTitle.innerText = 'Restablecer Contraseña';
        restablecerForm.style.display = 'block';
    });

    // Manejo del cierre de sesión
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        toggleSections();
    });

    // Comprueba si hay token almacenado
    if (checkAuth()) {
        loadCoins();
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

function checkAuth() {
    try {
        const token = JSON.parse(atob(localStorage.getItem('token').split('.')[1]));
        return token.exp > Math.floor(Date.now() / 1000);
    } catch (error) {
        return false;
    }
}
