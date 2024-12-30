document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formulario-registro');
    
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Captura de Datos Personales
        const datosPersonales = {
            nro: document.getElementById('numeroRegistro').value,
            nombreCompleto: document.getElementById('nombreCompleto').value,
            fechaNacimiento: document.getElementById('fechaNacimiento').value,
            numeroRegistro: document.getElementById('numeroRegistro').value,
            direccion: document.getElementById('direccion').value,
            referencia: document.getElementById('sector').value,
			numeroPagina: document.getElementById('numeroPagina').value, // Nuevo campo
            nombreMadre: document.getElementById('nombreMadre').value
        };

        // Captura de Vacunas
        const vacunas = {
            BCG: document.getElementById('fechaBCG').value,
            HEPATITIS_B: document.getElementById('fechaHepatitisB').value,
            PENTA_1: document.getElementById('fechaPenta1').value,
            PENTA_2: document.getElementById('fechaPenta2').value,
            PENTA_3: document.getElementById('fechaPenta3').value,
            PENTA_R1: document.getElementById('fechaPentaR1').value,
            PENTA_R2: document.getElementById('fechaPentaR2').value,
            IPV_1: document.getElementById('fechaIPV1').value,
            IPV_2: document.getElementById('fechaIPV2').value,
            OPV_1: document.getElementById('fechaOPV1').value,
            OPV_R1: document.getElementById('fechaOPVR1').value,
            OPV_R2: document.getElementById('fechaOPVR2').value,
            AA: document.getElementById('fechaAA').value,
            SRP_1: document.getElementById('fechaSRP1').value,
            SRP_2: document.getElementById('fechaSRP2').value
        };

        // Captura de Toxoides
        const toxoides = {
            TD_1: document.getElementById('fechaTD1').value,
            TD_2: document.getElementById('fechaTD2').value,
            TD_3: document.getElementById('fechaTD3').value,
            TD_4: document.getElementById('fechaTD4').value,
            TD_5: document.getElementById('fechaTD5').value,
            TD_6: document.getElementById('fechaTD6').value
        };

        // Combinar todos los datos
        const datosCompletos = {
            ...datosPersonales,
            ...vacunas,
            ...toxoides
        };

        // Enviar a Google Sheets
        enviarDatosAGoogleSheets(datosCompletos);
    });

    function enviarDatosAGoogleSheets(datos) {
        const URL_GOOGLE_APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbw3GPEl39-jyALS6jP4OX-ioD3vDU_PU8SkG9ZlUa1ErJNQmDD9niPkYL4_WVoVxXbP/exec'; // Reemplazar con tu URL

        fetch(URL_GOOGLE_APPS_SCRIPT, {
            method: 'POST',
            mode: 'no-cors', // Importante para Apps Script
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(response => {
            // Mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: 'Registro Exitoso',
                text: 'El paciente ha sido registrado correctamente'
            });
            
            // Limpiar formulario
            formulario.reset();
        })
        .catch(error => {
            // Mensaje de error
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al registrar el paciente'
            });
            console.error('Error:', error);
        });
    }
});

// Función para generar número de registro automático
function generarNumeroRegistro() {
    const fechaActual = new Date();
    const año = fechaActual.getFullYear().toString().slice(-2);
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
    const numeroAleatorio = Math.floor(10 + Math.random() * 90);
    
    return `${año}${mes}${numeroAleatorio}`;
}

// Asignar número de registro al cargar página
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('numeroRegistro').value = generarNumeroRegistro();
});