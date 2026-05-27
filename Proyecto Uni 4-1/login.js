const formLogin = document.getElementById('formLogin');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('theme-icon');

// --- MODO OSCURO / CLARO ---
themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    if (document.body.classList.contains('dark')) {
        themeIcon.innerText = '☀️';
        localStorage.setItem('modo-tema', 'dark');
    } else {
        themeIcon.innerText = '🌙';
        localStorage.setItem('modo-tema', 'light');
    }
});

if (localStorage.getItem('modo-tema') === 'dark') {
    document.body.classList.add('dark');
    if (themeIcon) themeIcon.innerText = '☀️';
}

// --- LOG_IN DE DOCENTES ---
formLogin?.addEventListener('submit', (e) => {
    e.preventDefault();
    const usuario = document.getElementById('loginUser').value.trim();
    const clave = document.getElementById('loginPass').value;

    // Credenciales fijadas del sistema
    if (usuario === 'docente2026' && clave === 'colegio123') {
        // Guardamos una marca temporal de sesión iniciada
        sessionStorage.setItem('sesionDocente', 'true');
        formLogin.reset();
        
        Swal.fire({
            icon: 'success',
            title: '¡Acceso Concedido!',
            text: 'Redireccionando al panel administrativo...',
            showConfirmButton: false,
            timer: 1300
        });

        // Redirección directa hacia la tercera hoja
        setTimeout(() => {
            window.location.href = "panel.html";
        }, 1300);
        
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'Usuario o contraseña incorrectos.',
            confirmButtonColor: '#e11d48'
        });
    }
});