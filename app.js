// Configuración
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbwnpHd0CJkH6-LZtpGZi5W2Ap0B4TZaoMtQF0p-oTJT3r8GA-9fiPxYHJVZR8XxMglXUA/exec',
    TIPOS_VACUNAS: {
        'Penta': ['PENTA 1', 'PENTA 2', 'PENTA 3', 'PENTA R1', 'PENTA R2'],
        'Polio': ['IPV 1', 'IPV 2', 'OPV 1', 'OPV R1', 'OPV R2'],
        'AA': ['AA'],
        'SRP': ['SRP 1', 'SRP 2']
    }
};

// Clase principal para manejar el dashboard
class VaccinationDashboard {
    constructor() {
        this.data = [];
        this.initializeEventListeners();
    }

    async initialize() {
        try {
            await this.loadData();
            this.setupFilters();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            this.showError('Error al cargar los datos');
        }
    }

    async loadData() {
        try {
            const response = await fetch(CONFIG.API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            
            this.data = await response.json();
            this.updateDashboard();
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    updateDashboard() {
        Object.keys(CONFIG.TIPOS_VACUNAS).forEach(tipo => {
            this.updateVaccinationTable(tipo);
        });
    }

    updateVaccinationTable(tipo) {
        const tbody = document.querySelector(`#collapse${tipo} tbody`);
        if (!tbody) return;

        tbody.innerHTML = '';
        const vacunasDelTipo = CONFIG.TIPOS_VACUNAS[tipo];

        const pacientesFiltrados = this.data.filter(registro => 
            registro.vacunasPendientes.some(v => vacunasDelTipo.includes(v.vacuna))
        );

        pacientesFiltrados.forEach(registro => {
            const vacunasFiltradas = registro.vacunasPendientes
                .filter(v => vacunasDelTipo.includes(v.vacuna));

            vacunasFiltradas.forEach(vacuna => {
                const row = this.createVaccinationRow(registro, vacuna);
                tbody.appendChild(row);
            });
        });

        this.updateBadgeCount(tipo, tbody.children.length);
    }

    createVaccinationRow(registro, vacuna) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${registro.paciente.nombre}</td>
            <td>${this.calcularEdad(registro.paciente.fechaNacimiento)}</td>
            <td>${vacuna.vacuna}</td>
            <td>${vacuna.ultimaDosis || '-'}</td>
            <td>${this.obtenerSector(registro.paciente.nro)}</td>
            <td>
                <button class="btn btn-sm btn-primary edit-btn" data-paciente="${registro.paciente.nro}" data-vacuna="${vacuna.vacuna}">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        return tr;
    }

    setupFilters() {
        const filterElements = ['tipoVacuna', 'fechaConsulta', 'sector'];
        filterElements.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', () => this.applyFilters());
            }
        });
    }

    applyFilters() {
        const tipoVacuna = document.getElementById('tipoVacuna').value;
        const fecha = document.getElementById('fechaConsulta').value;
        const sector = document.getElementById('sector').value;

        document.querySelectorAll('tbody tr').forEach(row => {
            let visible = true;

            if (tipoVacuna !== 'todas') {
                const vacunaCell = row.querySelector('td:nth-child(3)').textContent;
                visible = visible && vacunaCell.toLowerCase().includes(tipoVacuna.toLowerCase());
            }

            if (sector !== 'todos') {
                const sectorCell = row.querySelector('td:nth-child(5)').textContent;
                visible = visible && sectorCell.toLowerCase() === sector.toLowerCase();
            }

            if (fecha) {
                // Implementar filtrado por fecha si es necesario
            }

            row.style.display = visible ? '' : 'none';
        });

        this.updateFilteredCounts();
    }

    updateFilteredCounts() {
        Object.keys(CONFIG.TIPOS_VACUNAS).forEach(tipo => {
            const tbody = document.querySelector(`#collapse${tipo} tbody`);
            const visibleRows = Array.from(tbody.querySelectorAll('tr'))
                .filter(row => row.style.display !== 'none');
            this.updateBadgeCount(tipo, visibleRows.length);
        });
    }

    updateBadgeCount(tipo, count) {
        const badge = document.querySelector(`#collapse${tipo} .badge`);
        if (badge) {
            badge.textContent = count;
        }
    }

    calcularEdad(fechaNacimiento) {
        const nacimiento = new Date(fechaNacimiento);
        const hoy = new Date();
        const años = hoy.getFullYear() - nacimiento.getFullYear();
        const meses = hoy.getMonth() - nacimiento.getMonth();
        return `${años}a ${meses}m`;
    }

    obtenerSector(nroPaciente) {
        const sectores = ['Norte', 'Sur', 'Este', 'Oeste', 'Central'];
        return sectores[parseInt(nroPaciente) % sectores.length];
    }

    initializeEventListeners() {
        // Manejar botones de exportación
        document.querySelectorAll('.btn-success, .btn-danger, .btn-primary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('button').textContent.trim();
                switch(action) {
                    case 'Exportar a Excel':
                        this.exportToExcel();
                        break;
                    case 'Exportar a PDF':
                        this.exportToPDF();
                        break;
                    case 'Imprimir':
                        window.print();
                        break;
                }
            });
        });
    }

    showError(message) {
        // Implementar mostrar error en UI
        console.error(message);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new VaccinationDashboard();
    dashboard.initialize();
});