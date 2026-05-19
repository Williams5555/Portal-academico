// 1. Inicialización de herramientas
const { jsPDF } = window.jspdf;

// 2. Referencias de Elementos
const formRegistro = document.getElementById('formRegistro');
const tablaEstudiantes = document.getElementById('tablaEstudiantes');
const mensajeVacio = document.getElementById('mensajeVacio');
const contadorAlumnos = document.getElementById('contador');
const fechaEncabezado = document.getElementById('fechaActual');

// Referencias para el Modo Oscuro
const themeToggleBtn = document.getElementById('themeToggle');
const themeToggleDarkIcon = document.getElementById('themeToggleDarkIcon');
const themeToggleLightIcon = document.getElementById('themeToggleLightIcon');

// Inputs
const inputNombre = document.getElementById('inputNombre');
const inputCedula = document.getElementById('inputCedula');
const inputGrado = document.getElementById('inputGrado');
const inputEdad = document.getElementById('inputEdad');
const inputRep = document.getElementById('inputRep');
const inputTelf = document.getElementById('inputTelf');
const inputEnfermedad = document.getElementById('inputEnfermedad');
const inputAlergia = document.getElementById('inputAlergia');

// 3. Lógica Principal
const gestionarEstudiantes = {
    
    // --- CONTROL DE TEMA (MODO OSCURO / CLARO) ---
    inicializarTema() {
        // Verifica si hay una preferencia guardada o usa la del sistema operativo
        if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            themeToggleLightIcon.classList.remove('hidden'); // Muestra el Sol
        } else {
            document.documentElement.classList.remove('dark');
            themeToggleDarkIcon.classList.remove('hidden');  // Muestra la Luna
        }
    },

    alternarTema() {
        // Cambia la visibilidad de los iconos
        themeToggleDarkIcon.classList.toggle('hidden');
        themeToggleLightIcon.classList.toggle('hidden');

        // Modifica la clase en la etiqueta HTML y guarda el estado
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    },
    // ---------------------------------------------

    mostrarFecha() {
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        fechaEncabezado.innerText = new Date().toLocaleDateString('es-ES', opciones);
    },

    async agregar(event) {
        event.preventDefault();

        const estudiante = {
            nombre: inputNombre.value.trim(),
            cedula: inputCedula.value.trim(),
            grado: inputGrado.value.trim(),
            edad: inputEdad.value.trim() || "N/A",
            representante: inputRep.value.trim() || "No asignado",
            telefono: inputTelf.value.trim() || "S/N",
            enfermedad: inputEnfermedad.value.trim() || "Ninguna",
            alergia: inputAlergia.value.trim() || "Ninguna",
            fecha: new Date().toLocaleDateString()
        };

        if (estudiante.nombre === "" || estudiante.cedula === "" || estudiante.grado === "") {
            Swal.fire({
                icon: 'error',
                title: 'Atención',
                text: 'Los campos Nombre, Cédula y Grado son obligatorios.',
                confirmButtonColor: '#4f46e5'
            });
            return;
        }

        this.crearFila(estudiante);
        
        // Alerta de éxito con opción de PDF
        const resultado = await Swal.fire({
            title: '¡Inscripción Exitosa!',
            text: `¿Deseas descargar la constancia de ${estudiante.nombre}?`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Descargar PDF',
            cancelButtonText: 'Cerrar'
        });

        if (resultado.isConfirmed) {
            this.generarPDF(estudiante);
        }

        this.limpiarFormulario();
        this.actualizarVista();
    },

    crearFila(data) {
        const fila = document.createElement('tr');
        fila.className = "fila-estudiante transition-colors border-b border-slate-100 dark:border-slate-800";
        
        const dataString = JSON.stringify(data).replace(/'/g, "&apos;");

        fila.innerHTML = `
            <td class="px-8 py-5">
                <div class="text-sm font-bold text-slate-800 dark:text-slate-100">${data.nombre}</div>
                <div class="text-[11px] text-slate-400 font-medium tracking-wide uppercase dark:text-slate-500">CI: ${data.cedula} • ${data.edad} Años</div>
            </td>
            <td class="px-8 py-5 text-center">
                <span class="badge badge-activo">${data.grado}</span>
            </td>
            <td class="px-8 py-5">
                <div class="text-[11px] ${data.alergia !== 'Ninguna' ? 'text-orange-600 font-bold dark:text-orange-400' : 'text-slate-400 dark:text-slate-600'}">
                    ${data.alergia !== 'Ninguna' ? '⚠️ ' + data.alergia : 'Sin novedades'}
                </div>
            </td>
            <td class="px-8 py-5 text-right space-x-1">
                <button onclick='gestionarEstudiantes.generarPDF(${dataString})' class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all dark:text-indigo-400 dark:hover:bg-indigo-950/40" title="Descargar PDF">
                    <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                </button>
                <button onclick="gestionarEstudiantes.graduar(this)" class="btn-graduar text-xs font-extrabold uppercase tracking-tighter">Graduar</button>
                <button onclick="gestionarEstudiantes.eliminar(this)" class="btn-eliminar text-xs font-extrabold uppercase tracking-tighter">Borrar</button>
            </td>
        `;

        tablaEstudiantes.appendChild(fila);
    },

    generarPDF(data) {
        const doc = new jsPDF();
        
        doc.setFillColor(79, 70, 229); 
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("CONSTANCIA DE INSCRIPCIÓN", 105, 25, { align: "center" });

        doc.setTextColor(40, 40, 40);
        doc.setFontSize(10);
        doc.text(`Fecha: ${data.fecha}`, 190, 50, { align: "right" });

        doc.setFontSize(14);
        doc.text("DATOS ACADÉMICOS", 20, 65);
        doc.line(20, 67, 80, 67);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Nombre: ${data.nombre}`, 20, 80);
        doc.text(`Cédula: ${data.cedula}`, 20, 90);
        doc.text(`Grado: ${data.grado}`, 20, 100);

        doc.setFont("helvetica", "bold");
        doc.text("FICHA MÉDICA:", 20, 120);
        doc.setFont("helvetica", "normal");
        doc.text(`Alergias: ${data.alergia}`, 25, 130);
        doc.text(`Enfermedades: ${data.enfermedad}`, 25, 140);

        doc.setFont("helvetica", "bold");
        doc.text("REPRESENTANTE:", 20, 160);
        doc.setFont("helvetica", "normal");
        doc.text(`Nombre: ${data.representante}`, 25, 170);
        doc.text(`Teléfono: ${data.telefono}`, 25, 180);

        doc.line(70, 250, 140, 250);
        doc.setFontSize(10);
        doc.text("Sello y Firma Autorizada", 105, 255, { align: "center" });

        doc.save(`Inscripcion_${data.cedula}.pdf`);
    },

    graduar(boton) {
        const fila = boton.closest('tr');
        const badge = fila.querySelector('.badge');
        badge.innerText = "Graduado";
        badge.className = "badge badge-graduado";
        boton.remove();
        
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Estado actualizado',
            showConfirmButton: false,
            timer: 2000
        });
    },

    async eliminar(boton) {
        const resultado = await Swal.fire({
            title: '¿Confirmar eliminación?',
            text: "El registro se borrará permanentemente de la vista actual.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f43f5e',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (resultado.isConfirmed) {
            const fila = boton.closest('tr');
            fila.classList.add('opacity-0', 'translate-x-4');
            setTimeout(() => {
                fila.remove();
                this.actualizarVista();
            }, 300);
        }
    },

    limpiarFormulario() {
        formRegistro.reset();
        inputNombre.focus();
    },

    actualizarVista() {
        const total = tablaEstudiantes.children.length;
        mensajeVacio.style.display = total > 0 ? "none" : "block";
        contadorAlumnos.innerText = `${total} Alumnos Inscritos`;
    }
};

// 4. Inicialización y Event Listeners
formRegistro.addEventListener('submit', (e) => gestionarEstudiantes.agregar(e));
themeToggleBtn.addEventListener('click', () => gestionarEstudiantes.alternarTema());

window.onload = () => {
    gestionarEstudiantes.inicializarTema(); // Carga el tema guardado
    gestionarEstudiantes.mostrarFecha();
    gestionarEstudiantes.actualizarVista();
};