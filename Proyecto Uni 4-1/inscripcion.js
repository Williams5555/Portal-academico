// Captura segura de la librería jsPDF
const { jsPDF } = window.jspdf || {};

// Elementos de la interfaz
const formRegistro = document.getElementById('formRegistro');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('theme-icon');

// Cargar alumnos existentes o iniciar lista vacía
let estudiantes = JSON.parse(localStorage.getItem('estudiantes_datos')) || [];

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

// Aplicar tema guardado al cargar
if (localStorage.getItem('modo-tema') === 'dark') {
    document.body.classList.add('dark');
    if (themeIcon) themeIcon.innerText = '☀️';
}

// --- PROCESAR INSCRIPCIÓN Y DESCARGAR PDF ---
formRegistro?.addEventListener('submit', (e) => {
    e.preventDefault();

    const nuevoAlumno = {
        nombre: document.getElementById('inputNombre').value.trim(),
        cedula: document.getElementById('inputCedula').value.trim(),
        edad: document.getElementById('inputEdad').value || 'N/A',
        grado: document.getElementById('inputGrado').value,
        representante: document.getElementById('inputRep').value.trim() || 'No asignado',
        telefono: document.getElementById('inputTelf').value.trim() || 'S/N',
        enfermedad: document.getElementById('inputEnfermedad').value.trim() || 'Ninguna',
        alergia: document.getElementById('inputAlergia').value.trim() || 'Ninguna'
    };

    // Validar duplicados básicos por cédula para evitar desorden
    const existe = estudiantes.some(est => est.cedula === nuevoAlumno.cedula);
    if (existe) {
        Swal.fire({
            icon: 'warning',
            title: 'Cédula ya registrada',
            text: 'Este número de identificación ya se encuentra inscrito.',
            confirmButtonColor: '#4f46e5'
        });
        return;
    }

    // Guardar en LocalStorage
    estudiantes.push(nuevoAlumno);
    localStorage.setItem('estudiantes_datos', JSON.stringify(estudiantes));

    // Alerta de éxito
    Swal.fire({
        icon: 'success',
        title: '¡Inscripción Registrada!',
        text: 'La planilla del estudiante se descargará automáticamente.',
        confirmButtonColor: '#4f46e5'
    });

    // Lanzar descarga del PDF
    generarComprobantePDF(nuevoAlumno);
    formRegistro.reset();
});

function generarComprobantePDF(alumno) {
    if (!jsPDF) return;
    const doc = new jsPDF();
    
    // Encabezado estético e institucional
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("COMPROBANTE DE INSCRIPCIÓN", 105, 22, { align: "center" });

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS GENERALES DEL ALUMNO:", 20, 55);
    
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
    doc.text("DATOS DE CONTACTO (REPRESENTANTE):", 20, 158);
    doc.setFont("helvetica", "normal");
    doc.text(`Representante: ${alumno.representante}`, 25, 168);
    doc.text(`Teléfono: ${alumno.telefono}`, 25, 178);

    doc.save(`Inscripcion_${alumno.cedula}.pdf`);
}