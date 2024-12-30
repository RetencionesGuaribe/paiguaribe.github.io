// Variables globales
let modalDetalles;
let modalEdicion;

// Configuración de la URL del servidor - REEMPLAZAR CON TU URL DE GOOGLE APPS SCRIPT
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlYB0Vz1I0bSwNUlGZFDGD9s63oL8am2H1NwQuKhgcdtzlIT4n9xoyrG0D6ZWLOGc1hA/exec';

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar modales de Bootstrap
    modalDetalles = new bootstrap.Modal(document.getElementById('modalDetallesPaciente'));
    modalEdicion = new bootstrap.Modal(document.getElementById('modalEditarVacunas'));
    
    // Event listeners
    document.getElementById('botonBuscar').addEventListener('click', buscarPacientes);
    document.getElementById('valorBusqueda').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarPacientes();
        }
    });
});

// Función para buscar pacientes
async function buscarPacientes() {
    try {
        const tipoBusqueda = document.getElementById('tipoBusqueda').value;
        const valorBusqueda = document.getElementById('valorBusqueda').value.trim();
        
        if (!valorBusqueda) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo vacío',
                text: 'Por favor ingrese un valor para buscar'
            });
            return;
        }

        // Mostrar indicador de carga
        document.getElementById('cuerpoTabla').innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </td>
            </tr>`;

        const queryParams = new URLSearchParams({
            action: 'buscar',
            tipo: tipoBusqueda,
            valor: valorBusqueda
        });

        const response = await fetch(`${SCRIPT_URL}?${queryParams}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            mostrarResultados(data.pacientes);
        } else {
            throw new Error(data.message || 'Error al buscar pacientes');
        }
    } catch (error) {
        console.error('Error en buscarPacientes:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al conectar con el servidor. Por favor, verifica tu conexión e inténtalo de nuevo.'
        });
    }
}

// Función para mostrar resultados en la tabla
function mostrarResultados(pacientes) {
    // Depuración inicial
    console.log("Pacientes recibidos:", pacientes);

    const tbody = document.getElementById('cuerpoTabla');
    tbody.innerHTML = '';
    
    if (!pacientes || pacientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron resultados</td></tr>';
        return;
    }

    pacientes.forEach(paciente => {
        // Depuración de cada paciente
        console.log("Datos de paciente individual:", paciente);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${paciente.NRO || '-'}</td>
            <td>${paciente['NOMBRE Y APELLIDO'] || '-'}</td>
            <td>${formatearFecha(paciente['Fecha Nacimiento']) || 'No registrada'}</td>
            <td>${paciente.MADRE || '-'}</td>
            <td>${paciente['Dirección'] || 'No registrada'}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="verDetalles('${paciente.NRO}')">
                    <i class="fas fa-eye me-1"></i> Ver
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Función para ver detalles del paciente
async function verDetalles(nroRegistro) {
    try {
        document.getElementById('modalDetallesPaciente').querySelector('.modal-body').innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            </div>`;
        
        modalDetalles.show();

        const queryParams = new URLSearchParams({
            action: 'detalles',
            nro: nroRegistro
        });

        const response = await fetch(`${SCRIPT_URL}?${queryParams}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Restaurar el contenido original del modal
            document.getElementById('modalDetallesPaciente').querySelector('.modal-body').innerHTML = `
                <!-- Datos Personales -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <h6 class="border-bottom pb-2">Información Personal</h6>
                        <div class="mb-2"><strong>Nombre:</strong> <span id="nombrePaciente"></span></div>
                        <div class="mb-2"><strong>Fecha de Nacimiento:</strong> <span id="fechaNacimiento"></span></div>
                        <div class="mb-2"><strong>Número de Registro:</strong> <span id="numeroRegistro"></span></div>
                    </div>
                    <div class="col-md-6">
                        <h6 class="border-bottom pb-2">Información de Contacto</h6>
                        <div class="mb-2"><strong>Dirección:</strong> <span id="direccion"></span></div>
                        <div class="mb-2"><strong>Sector:</strong> <span id="sector"></span></div>
                        <div class="mb-2"><strong>Nombre de la Madre:</strong> <span id="nombreMadre"></span></div>
                    </div>
                </div>

                <!-- Registro de Vacunas -->
                <h5 class="border-bottom pb-2 mb-3">Registro de Vacunación</h5>
                <div class="row">
                    <!-- Vacunas Básicas -->
                    <div class="col-md-3 mb-4">
                        <h6 class="text-primary mb-3">Vacunas Básicas</h6>
                        <div class="mb-2"><strong>BCG:</strong> <span id="fechaBCG"></span></div>
                        <div class="mb-2"><strong>Hepatitis B:</strong> <span id="fechaHepB"></span></div>
                    </div>

                    <!-- Pentavalente -->
                    <div class="col-md-3 mb-4">
                        <h6 class="text-primary mb-3">Pentavalente</h6>
                        <div class="mb-2"><strong>Penta 1:</strong> <span id="fechaPenta1"></span></div>
                        <div class="mb-2"><strong>Penta 2:</strong> <span id="fechaPenta2"></span></div>
                        <div class="mb-2"><strong>Penta 3:</strong> <span id="fechaPenta3"></span></div>
                        <div class="mb-2"><strong>Penta R1:</strong> <span id="fechaPentaR1"></span></div>
                        <div class="mb-2"><strong>Penta R2:</strong> <span id="fechaPentaR2"></span></div>
                    </div>

                    <!-- Polio -->
                    <div class="col-md-3 mb-4">
                        <h6 class="text-primary mb-3">Polio</h6>
                        <div class="mb-2"><strong>IPV 1:</strong> <span id="fechaIPV1"></span></div>
                        <div class="mb-2"><strong>IPV 2:</strong> <span id="fechaIPV2"></span></div>
                        <div class="mb-2"><strong>OPV 1:</strong> <span id="fechaOPV1"></span></div>
                        <div class="mb-2"><strong>OPV R1:</strong> <span id="fechaOPVR1"></span></div>
                        <div class="mb-2"><strong>OPV R2:</strong> <span id="fechaOPVR2"></span></div>
                    </div>

                    <!-- Otras Vacunas -->
                    <div class="col-md-3 mb-4">
                        <h6 class="text-primary mb-3">Otras Vacunas</h6>
                        <div class="mb-2"><strong>AA:</strong> <span id="fechaAA"></span></div>
                        <div class="mb-2"><strong>SRP 1:</strong> <span id="fechaSRP1"></span></div>
                        <div class="mb-2"><strong>SRP 2:</strong> <span id="fechaSRP2"></span></div>
                    </div>

                    <!-- Toxoides (TD) -->
                    <div class="col-12 mt-3">
                        <h6 class="text-primary mb-3">Tétanos/Difteria (TD)</h6>
                        <div class="row">
                            <div class="col-md-4">
                                <div class="mb-2"><strong>TD 1:</strong> <span id="fechaTD1"></span></div>
                                <div class="mb-2"><strong>TD 2:</strong> <span id="fechaTD2"></span></div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-2"><strong>TD 3:</strong> <span id="fechaTD3"></span></div>
                                <div class="mb-2"><strong>TD 4:</strong> <span id="fechaTD4"></span></div>
                            </div>
                            <div class="col-md-4">
                                <div class="mb-2"><strong>TD 5:</strong> <span id="fechaTD5"></span></div>
                                <div class="mb-2"><strong>TD 6:</strong> <span id="fechaTD6"></span></div>
                            </div>
                        </div>
                    </div>
                </div>`;
            
            mostrarDetallesPaciente(data.paciente);
        } else {
            throw new Error(data.message || 'No se pudieron cargar los detalles del paciente');
        }
    } catch (error) {
        console.error('Error en verDetalles:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar los detalles del paciente. Por favor, inténtalo de nuevo.'
        });
        modalDetalles.hide();
    }
}

// Función para mostrar detalles en el modal
function mostrarDetallesPaciente(paciente) {
    // Información personal
    document.getElementById('nombrePaciente').textContent = paciente['NOMBRE Y APELLIDO'] || 'N/A';
    document.getElementById('fechaNacimiento').textContent = formatearFecha(paciente['Fecha Nacimiento']);
    document.getElementById('numeroRegistro').textContent = paciente.NRO || 'N/A';
    document.getElementById('direccion').textContent = paciente['Dirección'] || 'N/A';
    document.getElementById('sector').textContent = paciente['Referencia'] || 'N/A';
    document.getElementById('nombreMadre').textContent = paciente.MADRE || 'N/A';
    
    // Mapeo de todas las vacunas
    const vacunas = {
        'BCG': 'BCG',
        'HepB': 'HEPATITIS B',
        'Penta1': 'PENTA 1',
        'Penta2': 'PENTA 2',
        'Penta3': 'PENTA 3',
        'PentaR1': 'PENTA R1',
        'PentaR2': 'PENTA R2',
        'IPV1': 'IPV 1',
        'IPV2': 'IPV 2',
        'OPV1': 'OPV 1',
        'OPVR1': 'OPV R1',
        'OPVR2': 'OPV R2',
        'AA': 'AA',
        'SRP1': 'SRP 1',
        'SRP2': 'SRP 2',
        'TD1': 'TD1',
        'TD2': 'TD2',
        'TD3': 'TD3',
        'TD4': 'TD4',
        'TD5': 'TD5',
        'TD6': 'TD6'
    };
    
    // Actualizar cada campo de vacuna
    Object.entries(vacunas).forEach(([elementId, sheetColumn]) => {
        const elemento = document.getElementById(`fecha${elementId}`);
        if (elemento) {
            const fecha = paciente[sheetColumn];
            elemento.textContent = fecha ? formatearFecha(fecha) : 'No aplicada';
            elemento.classList.toggle('text-danger', !fecha);
        }
    });
}

// Función para preparar la edición de vacunas
function prepararEdicionVacunas(nroRegistro) {
    const vacunas = [
        'BCG', 'HepB', 
        'Penta1', 'Penta2', 'Penta3', 'PentaR1', 'PentaR2',
        'IPV1', 'IPV2', 'OPV1', 'OPVR1', 'OPVR2',
        'AA', 'SRP1', 'SRP2',
        'TD1', 'TD2', 'TD3', 'TD4', 'TD5', 'TD6'
    ];
    
    vacunas.forEach(vacuna => {
        const fechaElement = document.getElementById(`fecha${vacuna}`);
        const inputElement = document.getElementById(`edit${vacuna}`);
        if (fechaElement && inputElement) {
            const fechaTexto = fechaElement.textContent;
            inputElement.value = fechaTexto !== 'No aplicada' ? fechaTexto : '';
        }
    });
    
    modalDetalles.hide();
    modalEdicion.show();
}

// Función para guardar cambios en las vacunas
async function guardarVacunas() {
    try {
        const nroRegistro = document.getElementById('numeroRegistro').textContent;
        const vacunas = {};
        
        // Recolectar todas las fechas de vacunación
        const campos = [
            'BCG', 'HepB', 
            'Penta1', 'Penta2', 'Penta3', 'PentaR1', 'PentaR2',
            'IPV1', 'IPV2', 'OPV1', 'OPVR1', 'OPVR2',
            'AA', 'SRP1', 'SRP2',
            'TD1', 'TD2', 'TD3', 'TD4', 'TD5', 'TD6'
        ];
        
        campos.forEach(campo => {
            const valor = document.getElementById(`edit${campo}`).value;
            if (valor) {
                vacunas[campo] = valor;
            }
        });

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'actualizar',
                nroRegistro: nroRegistro,
                vacunas: vacunas
            })
        });

        const data = await response.json();
        
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Vacunas actualizadas correctamente'
            }).then(() => {
                modalEdicion.hide();
                verDetalles(nroRegistro);
            });
        } else {
            throw new Error(data.message || 'Error al actualizar las vacunas');
        }
    } catch (error) {
        console.error('Error en guardarVacunas:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al guardar los cambios. Por favor, inténtalo de nuevo.'
        });
    }
}

// Función auxiliar para formatear fechas
function formatearFecha(fecha) {
    // Si la fecha ya está en formato dd/mm/yyyy, devolverla directamente
    if (typeof fecha === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
        return fecha;
    }
    
    // Manejar otros formatos de fecha
    try {
        if (!fecha) return 'No registrada';
        
        const fechaObj = new Date(fecha);
        
        if (isNaN(fechaObj.getTime())) {
            return 'Fecha inválida';
        }
        
        return fechaObj.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        console.error("Error al formatear fecha:", error);
        return 'No registrada';
    }
}
