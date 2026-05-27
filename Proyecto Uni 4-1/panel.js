const { jsPDF } = window.jspdf || {};

const tablaInscritos = document.getElementById('tablaInscritos');
const tablaVaciaMensaje = document.getElementById('tablaVaciaMensaje');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('theme-icon');

// Cargar la base de datos común de LocalStorage
let estudiantes = JSON.parse(localStorage.getItem('estudiantes_datos')) || [];

// --- FILTRO DE SEGURIDAD INTERNO ---
// Si un curioso intenta entrar a panel.html sin pasar por el login, lo expulsa.
if (sessionStorage.getItem('sesionDocente') !== 'true') {
    window.location.href = "login.html";
}

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

// --- CERRAR SESIÓN ---
btnCerrarSesion?.addEventListener('click', () => {
    sessionStorage.removeItem('sesionDocente');
    window.location.href = "login.html";
});

// --- RENDERIZAR INTERFAZ ADMINISTRATIVA ---
function cargarPanelAdministrativo() {
    actualizarContadores();
    construirTabla();
}

function actualizarContadores() {
    const conteos = {
        "2do Grupo Maternal": 0,
        "3er Grupo Maternal": 0,
        "1er Grupo Preescolar": 0,
        "2do Grupo Preescolar": 0,
        "3er Grupo Preescolar": 0,
        "1er Grado": 0
    };

    estudiantes.forEach(est => {
        if (conteos[est.grado] !== undefined) {
            conteos[est.grado]++;
        }
    });

    if(document.getElementById('count-2doMaternal')) document.getElementById('count-2doMaternal').innerText = conteos["2do Grupo Maternal"];
    if(document.getElementById('count-3erMaternal')) document.getElementById('count-3erMaternal').innerText = conteos["3er Grupo Maternal"];
    if(document.getElementById('count-1erPreescolar')) document.getElementById('count-1erPreescolar').innerText = conteos["1er Grupo Preescolar"];
    if(document.getElementById('count-2doPreescolar')) document.getElementById('count-2doPreescolar').innerText = conteos["2do Grupo Preescolar"];
    if(document.getElementById('count-3erPreescolar')) document.getElementById('count-3erPreescolar').innerText = conteos["3er Grupo Preescolar"];
    if(document.getElementById('count-1erGrado')) document.getElementById('count-1erGrado').innerText = conteos["1er Grado"];
}

function construirTabla() {
    if (!tablaInscritos) return;
    tablaInscritos.innerHTML = "";

    if (estudiantes.length === 0) {
        tablaVaciaMensaje?.classList.remove('hidden');
        return;
    }

    tablaVaciaMensaje?.classList.add('hidden');

    estudiantes.forEach((alumno) => {
        const fila = document.createElement('tr');
        fila.style.borderBottom = "1px solid var(--border-color)";
        
        fila.innerHTML = `
            <td style="padding: 1rem; font-weight: 600;">${alumno.cedula}</td>
            <td style="padding: 1rem;">${alumno.nombre}</td>
            <td style="padding: 1rem;"><span style="font-size:0.85rem; background:rgba(79,70,229,0.1); color:var(--primary); padding:0.2rem 0.6rem; border-radius:8px; font-weight:600;">${alumno.grado}</span></td>
            <td style="padding: 1rem;">${alumno.representante}</td>
            <td style="padding: 1rem; text-align: center;">
                <button class="btn-primario btn-descargar-fila" data-cedula="${alumno.cedula}" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; border-radius: 6px;">
                    Descargar PDF
                </button>
            </td>
        `;
        tablaInscritos.appendChild(fila);
    });

    // Escuchar los clicks de los botones dinámicos de la tabla
    document.querySelectorAll('.btn-descargar-fila').forEach(boton => {
        boton.addEventListener('click', (e) => {
            const cedulaBuscar = e.target.getAttribute('data-cedula');
            const alumnoEncontrado = estudiantes.find(est => est.cedula === cedulaBuscar);
            if (alumnoEncontrado) {
                reGenerarPDF(alumnoEncontrado);
            }
        });
    });
}

function reGenerarPDF(alumno) {
    if (!jsPDF) return;
    const doc = new jsPDF();
    
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("COMPROBANTE DE INSCRIPCIÓN", 105, 22, { align: "center" });

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS GENERALES DEL ALUMNO (COPIA MAESTRO):", 20, 55);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre Completo: ${alumno.nombre}`, 20, 68);
    doc.text(`Cédula / Identificación: ${alumno.cedula}`, 20, 78);
    doc.text(`Grado Asignado: ${alumno.grado}`, 20, 88);
    doc.text(`Edad: ${alumno.edad} años`, 20, 98);

    doc.setFont("helvetica", "bold");
    doc.text("INFORMACIÓN MÉDICA:", 20, 118);
    doc.setFont("helvetica", "normal");
    doc.text(`Condición Médica: ${alumno.enfermedad}`, 25, 128);
    doc.text(`Alergias: ${alumno.alergia}`, 25, 138);

    doc.setFont("helvetica", "bold");
    doc.text("DATOS DE CONTACTO:", 20, 158);
    doc.setFont("helvetica", "normal");
    doc.text(`Representante: ${alumno.representante}`, 25, 168);
    doc.text(`Teléfono: ${alumno.telefono}`, 25, 178);

    doc.save(`Re_Inscripcion_${alumno.cedula}.pdf`);
}

// Inicializar vistas al cargar la pantalla
document.addEventListener('DOMContentLoaded', () => {
    cargarPanelAdministrativo();
    
    // Configurar fecha del panel
    const fechaActual = document.getElementById('fechaActual');
    if(fechaActual) {
        fechaActual.innerText = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
});