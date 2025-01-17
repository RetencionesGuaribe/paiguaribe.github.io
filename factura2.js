
function manejarSeleccionProducto() {
    document.addEventListener('change', function(e) {
        if (e.target && e.target.classList.contains('input-descripcion')) {
            const selectedOption = Array.from(document.getElementById('productos-list').options).find(option => option.value === e.target.value);
            if (selectedOption) {
                const precio = selectedOption.getAttribute('data-precio');
                const row = e.target.closest('.product-row');
                const precioInput = row.querySelector('.input-precio-unitario');
                precioInput.value = precio;
                calcularTotal(precioInput);
            }
        }
    });
}

function guardarFactura() {

    guardarFacturaEnArchivo();

    cerrarPopupArchivos();

}

function cargarFactura() {

    const input = document.createElement('input');

    input.type = 'file';

    input.accept = '.json';

    input.onchange = function(event) {

        const file = event.target.files[0];

        const reader = new FileReader();

        reader.onload = function(e) {

            const facturaData = JSON.parse(e.target.result);

            cargarFacturaEnInterfaz(facturaData);

        };

        reader.readAsText(file);

    };

    input.click();

    cerrarPopupArchivos();

}




    // Habilitar el arrastre del contenedor
    const container = document.getElementById('draggableContainer');
    
    container.onmousedown = function(event) {
        let shiftX = event.clientX - container.getBoundingClientRect().left;
        let shiftY = event.clientY - container.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            container.style.left = pageX - shiftX + 'px';
            container.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.onmouseup = function() {
            document.removeEventListener('mousemove', onMouseMove);
            document.onmouseup = null;
        };
    };

    container.ondragstart = function() {
        return false; // Previene el comportamiento de arrastre por defecto
    };

    // Mostrar el popup al cargar la página
    window.onload = function() {
    document.getElementById('popup').style.display = 'flex';
    inicializarAutocompletado();
    manejarSeleccionProducto();
};

function inicializarAutocompletado() {
    document.addEventListener('input', function(e) {
        if (e.target && e.target.classList.contains('input-descripcion')) {
            const valor = e.target.value.toLowerCase();
            const sugerencias = productosComunes.filter(producto => 
                producto.descripcion.toLowerCase().includes(valor)
            );
            
            // Actualizar el datalist
            const datalist = document.getElementById('productos-list');
            datalist.innerHTML = sugerencias.map(producto => `<option value="${producto.descripcion}" data-precio="${producto.precio}">`).join('');
        }
    });
}

    function seleccionarProveedor() {
        const fecha = document.getElementById('popupFecha').value;
        const proveedorSelect = document.getElementById('popupProveedor');
        const retencionSelect = document.getElementById('popupRetencion');
        const nroOperacion = document.getElementById('popupNroOperacion').value;
        const montoDeseado = document.getElementById('popupMontoDeseado').value;

        let proveedorText;
        if (proveedorSelect.value === 'manual') {
            proveedorText = document.getElementById('proveedorManual').value;
        } else {
            proveedorText = proveedorSelect.options[proveedorSelect.selectedIndex].text;
        }

        // Actualiza los campos en la interfaz
        document.getElementById('fecha').value = fecha;
        document.getElementById('proveedorText').innerText = proveedorText;

        // Actualiza la retención
        document.getElementById('retencionText').innerText = `Ret: ${retencionSelect.value}%`;

        document.getElementById('nroOperacionText').innerText = nroOperacion;

        // Guarda el monto deseado en localStorage
        if (montoDeseado) {
            localStorage.setItem('montoDeseado', montoDeseado);
        }
        
        if (proveedorSelect) {
            localStorage.setItem('proveedorSelect', proveedorSelect);
        }

        // Oculta la ventana modal
        document.getElementById('popup').style.display = 'none';

        // Actualiza el resumen general para reflejar los cambios actualizarResumenGeneral();
    }

function actualizarRetencion() {
    const proveedorSelect = document.getElementById('popupProveedor');
    const retencionSelect = document.getElementById('popupRetencion');
    const selectedOption = proveedorSelect.selectedOptions[0];

    if (proveedorSelect.value !== '' && proveedorSelect.value !== 'manual') {
        const retencion = selectedOption.getAttribute('data-retencion');
        retencionSelect.value = retencion;
    }
}
    function limpiarLocalStorage() {
        localStorage.clear();
        console.log("LocalStorage ha sido limpiado");
    }

    function ajustarPrecios() {
        const montoDeseado = localStorage.getItem('montoDeseado');
        console.log('montoDeseado:', montoDeseado);

        if (montoDeseado === null) {
            alert("Por favor, seleccione un proveedor y ingrese un monto deseado válido en el popup.");
            return;
        }

        const montoDeseadoFloat = parseFloat(montoDeseado);
        console.log('montoDeseadoFloat:', montoDeseadoFloat);

        if (montoDeseadoFloat <= 0) {
            alert("Por favor, ingrese un monto deseado válido en el popup.");
            return;
        }

        const rows = document.querySelectorAll('.product-row');
        let subtotalConIVA = 0;
        let subtotalExento = 0;

        rows.forEach(row => {
            const cantidad = parseFloat(row.querySelector('.input-cantidad').value) || 0;
            const precioUnitario = parseFloat(row.querySelector('.input-precio-unitario').value) || 0;
            const isExento = row.querySelector('.input-exento').checked;

            const subtotal = cantidad * precioUnitario;

            if (isExento) {
                subtotalExento += subtotal;
            } else {
                subtotalConIVA += subtotal;
            }
        });

        console.log('subtotalConIVA:', subtotalConIVA);
        console.log('subtotalExento:', subtotalExento);

        const totalActual = calcularTotalAPagar(subtotalConIVA, subtotalExento);
        console.log('totalActual:', totalActual);

        if (totalActual === 0) {
            alert("El total actual es cero. No se puede ajustar.");
            return;
        }

        const factorAjuste = montoDeseadoFloat / totalActual;
        console.log('factorAjuste:', factorAjuste);

        rows.forEach(row => {
            const precioUnitarioInput = row.querySelector('.input-precio-unitario');
            const nuevoPrecioUnitario = parseFloat(precioUnitarioInput.value) * factorAjuste;

            precioUnitarioInput.value = nuevoPrecioUnitario.toFixed(2);

            calcularTotal(precioUnitarioInput);
        });

        actualizarResumenGeneral();
    }

    function calcularTotalAPagar(subConIVA, subExento) {
        const iva = subConIVA * 0.16;
        const porcentajeRetencion = parseInt(document.getElementById('retencionText').innerText.match(/\d+/)[0]) || 0;
        const ivaAPagar = porcentajeRetencion === 75 ? iva * 0.25 : (porcentajeRetencion === 0 ? iva : 0);
        const timbreFiscal = (subConIVA + subExento) * 0.001;
        return subConIVA + subExento + ivaAPagar - timbreFiscal;
    }

    function toggleProveedorManual() {
        const proveedorSelect = document.getElementById('popupProveedor');
        const proveedorManualContainer = document.getElementById('proveedorManualContainer');

        if (proveedorSelect.value === 'manual') {
            proveedorManualContainer.style.display = 'block';
        } else {
            proveedorManualContainer.style.display = 'none';
        }
    }

    function redondear(numero, decimales = 2) {
        return Number(Math.round(numero + 'e' + decimales) + 'e-' + decimales);
    }

    function ajustarPrecio(event, input) {
        event.preventDefault(); // Previene el comportamiento por defecto

        let valor = parseFloat(input.value) || 0;

        if (event.deltaY < 0) {
            // Scroll hacia arriba, incrementar
            valor += 0.01;
        } else {
            // Scroll hacia abajo, decrementar
            valor -= 0.01;
        }

        // Redondear a 2 decimales
        valor = Math.round(valor * 100) / 100;

        // Asegurarse de que el valor no sea negativo
        valor = Math.max(0, valor);

        // Actualizar el valor del input
        input.value = valor.toFixed(2);

        // Recalcular el total
        calcularTotal(input);
    }

    function eliminarFila(button) {
        const row = button.closest('.product-row'); // Localiza la fila correspondiente
        row.remove(); // Elimina la fila del DOM

        // Actualiza el resumen general
        actualizarResumenGeneral();

        // Guarda los datos en el almacenamiento local
        guardarDatos();
    }

    function agregarFila() {
        const productContainer = document.getElementById('productContainer');
        const newRow = document.createElement('div');
        newRow.className = 'product-row';
        newRow.innerHTML = `

<input type="number" class="input-cantidad" placeholder="0" min="0" oninput="calcularTotal(this)">

<input type="text" class="input-descripcion" placeholder="Descripción del producto" list="productos-list">

<datalist id="productos-list">

    ${productosComunes.map(producto => `<option value="${producto.descripcion}" data-precio="${producto.precio}">`).join('')}

</datalist>
            <input type="number" class="input-precio-unitario" placeholder="0.00" step="0.01" oninput="calcularTotal(this)" onwheel="ajustarPrecioUnitario(event, this)">
            <input type="number" class="input-precio-total" placeholder="0.00" step="0.01" readonly>
            <input type="number" class="input-total-con-descuento" placeholder="0.00" step="0.01" readonly>
            <label>
                <input type="checkbox" class="input-exento" onchange="actualizarResumenGeneral()"> E
            </label>
            <button class="btn-eliminar" onclick="eliminarFila(this)">X</button>
        `;
        productContainer.appendChild(newRow);
        actualizarResumenGeneral();
    }

    function guardarDatos() {
        const rows = document.querySelectorAll('.product-row');
        const data = Array.from(rows).map(row => {
            return {
                cantidad: row.querySelector('.input-cantidad').value,
                descripcion: row.querySelector('.input-descripcion').value,
                precioUnitario: row.querySelector('.input-precio-unitario').value,
                precioTotal: row.querySelector('.input-precio-total').value,
                totalConDescuento: row.querySelector('.input-total-con-descuento').value,
                exentoIVA: row.querySelector('.input-exento').checked // Estado del checkbox
            };
        });
        localStorage.setItem('productos', JSON.stringify(data)); // Almacena los datos en localStorage
    }

    function mostrarPopup() {
        document.getElementById('popup').style.display = 'flex';

        // Reiniciar campos
        document.getElementById('popupFecha').value = '';
        document.getElementById('popupProveedor').selectedIndex = 0;
        document.getElementById('popupRetencion').selectedIndex = 0;
        document.getElementById('popupNroOperacion').value = '';

        // Cargar el monto deseado guardado
        const montoDeseadoGuardado = localStorage.getItem('montoDeseado');
        if (montoDeseadoGuardado) {
            document.getElementById('popupMontoDeseado').value = montoDeseadoGuardado;
        } else {
            document.getElementById('popupMontoDeseado').value = '';
        }
    }
    

    function ajustarPrecioUnitario(event, input) {
        event.preventDefault(); // Previene el comportamiento por defecto del scroll

        let valor = parseFloat(input.value) || 0;

        if (event.deltaY < 0) {
            // Scroll hacia arriba, incrementar
            valor += 0.01;
        } else {
            // Scroll hacia abajo, decrementar
            valor -= 0.01;
        }

        // Redondear a 2 decimales
        valor = Math.round(valor * 100) / 100;

        // Asegurarse de que el valor no sea negativo
        valor = Math.max(0, valor);

        // Actualizar el valor del input
        input.value = valor.toFixed(2);

        // Recalcular el total
        calcularTotal(input);
    }

    function calcularTotal(element) {
        const row = element.closest('.product-row');
        const cantidad = parseFloat(row.querySelector('.input-cantidad').value) || 0;
        const precioUnitario = parseFloat(row.querySelector('.input-precio-unitario').value) || 0;

        // Calcular el total de la fila
        const precioTotal = cantidad * precioUnitario;
        const totalConDescuento = precioTotal * 0.999; // 0.1% de descuento

        // Actualizar los campos de la fila
        row.querySelector('.input-precio-total').value = precioTotal.toFixed(2);
        row.querySelector('.input-total-con-descuento').value = totalConDescuento.toFixed(2);

        // Actualizar el resumen general
        actualizarResumenGeneral();
    }

    function actualizarResumenGeneral() {
        const productRows = document.querySelectorAll('.product-row');
        let subtotalGeneral = 0;
        let exentoGeneral = 0;

        productRows.forEach(row => {
            const precioTotal = parseFloat(row.querySelector('.input-precio-total').value) || 0;
            const exentoCheckbox = row.querySelector('.input-exento');

            // Sumar al subtotal general todos los productos
            subtotalGeneral += precioTotal;

            // Sumar al exento general solo los productos marcados como exentos
            if (exentoCheckbox.checked) {
                exentoGeneral += precioTotal;
            }
        });

        // El resto de la función permanece igual

        const ivaGeneral = (subtotalGeneral - exentoGeneral) * 0.16;
        const totalFactura = subtotalGeneral + ivaGeneral;

        document.getElementById('subtotalGeneral').innerText = subtotalGeneral.toFixed(2);
        document.getElementById('exentoGeneral').innerText = exentoGeneral.toFixed(2);
        document.getElementById('ivaGeneral').innerText = ivaGeneral.toFixed(2);
        document.getElementById('totalGeneral').innerText = totalFactura.toFixed(2);

        // Cálculos adicionales
        const retencionText = document.getElementById('retencionText').innerText;
        const porcentajeRetencion = parseInt(retencionText.match(/\d+/)[0]) || 0;

        let ivaAPagar = 0;

        if (porcentajeRetencion === 75) {
            ivaAPagar = ivaGeneral * 0.25;
        } else if (porcentajeRetencion === 0) {
            ivaAPagar = ivaGeneral;
        }

        const pagoSinTimbre = subtotalGeneral + ivaAPagar;
        const timbreFiscal = subtotalGeneral * 0.001;
        const totalAPagar = subtotalGeneral - timbreFiscal + ivaAPagar;

        document.getElementById('ivaAPagar').innerText = ivaAPagar.toFixed(2);
        document.getElementById('pagoSinTimbre').innerText = pagoSinTimbre.toFixed(2);
        document.getElementById('timbreFiscal').innerText = timbreFiscal.toFixed(2);
        document.getElementById('totalAPagar').innerText = totalAPagar.toFixed(2);
    }

    // Obtener la lista de plantillas en la carpeta plantillas
    const plantillasFolder = 'plantillas/';
    const plantillas = [];

    fetch(plantillasFolder)
        .then(response => response.text())
        .then(data => {
            const files = data.split('\n');
            files.forEach(file => {
                if (file.endsWith('.txt')) {
                    plantillas.push({
                        nombre: file.replace('.txt', ''),
                        ruta: plantillasFolder + file
                    });
                }
            });

            // Crear la lista desplegable de plantillas
            const select = document.getElementById('plantilla-select');
            select.innerHTML = ''; // Limpiar la lista desplegable
            plantillas.forEach(plantilla => {
                const option = document.createElement('option');
                option.value = plantilla.nombre;
                option.text = plantilla.nombre;
                select.appendChild(option);
            });
        });

    // Crear la lista desplegable de plantillas
    const select = document.getElementById('plantilla-select');
    plantillas.forEach(plantilla => {
        const option = document.createElement('option');
        option.value = plantilla.nombre;
        option.text = plantilla.nombre; // Reemplazar {{nombre}} con el nombre real de la plantilla
        select.appendChild(option);
    });

    function cargarDatos() {
        const data = JSON.parse(localStorage.getItem('productos'));
        if (data) {
            data.forEach(item => {
                const productContainer = document.getElementById('productContainer');
                const newRow = document.createElement('div');
                newRow.className = 'product-row';
                newRow.innerHTML = `
                    <input type="number" class="input-cantidad" value="${item.cantidad}" oninput="calcularTotal(this)">
                    <input type="text" class="input-descripcion" value="${item.descripcion}">
                    <input type="number" class="input-precio-unitario" value="${item.precioUnitario}" step="0.01" oninput="calcularTotal(this)" onwheel="ajustarPrecioUnitario(event, this)">
                    <input type="number" class="input-precio-total" value="${item.precioTotal}" readonly>
                    <input type="number" class="input-total-con-descuento" value="${item.totalConDescuento}" readonly>
                    <label>
                        <input type="checkbox" class="input-exento" ${item.exentoIVA ? 'checked' : ''} onchange="actualizarResumenGeneral()"> E
                    </label>
                    <button class="btn-eliminar" onclick="eliminarFila(this)">X</button>
                `;
                productContainer.appendChild(newRow); // Agrega la nueva fila al contenedor
            });
        }
    }


async function guardarFacturaSheety() {

    const nroOperacion = document.getElementById('nroOperacionText').innerText.replace('OP: ', '');

    if (!nroOperacion) {

        alert('Por favor, ingrese un número de operación válido.');

        return;

    }


    const fecha = document.getElementById('fecha').value;

    const proveedor = document.getElementById('proveedorText').innerText;

    const subtotalGeneral = document.getElementById('subtotalGeneral').innerText;

    const exentoGeneral = document.getElementById('exentoGeneral').innerText;

    const ivaGeneral = document.getElementById('ivaGeneral').innerText;

    const totalGeneral = document.getElementById('totalGeneral').innerText;

    const ivaAPagar = document.getElementById('ivaAPagar').innerText;

    const timbreFiscal = document.getElementById('timbreFiscal').innerText;

    const totalAPagar = document.getElementById('totalAPagar').innerText;

    const retencion = document.getElementById('retencionText').innerText;


    // Obtener productos

    const productos = Array.from(document.querySelectorAll('.product-row')).map(row => ({

        cantidad: row.querySelector('.input-cantidad').value,

        descripcion: row.querySelector('.input-descripcion').value,

        precioUnitario: row.querySelector('.input-precio-unitario').value,

        total: row.querySelector('.input-precio-total').value,

        exento: row.querySelector('.input-exento').checked

    }));


    const facturaData = {

        sheet1: {

            nroOperacion,

            fecha,

            proveedor,

            subtotalGeneral,

            exentoGeneral,

            ivaGeneral,

            totalGeneral,

            ivaAPagar,

            timbreFiscal,

            totalAPagar,

            productos: JSON.stringify(productos),

            retencion

        }

    };


    try {

        const apiUrl = API_FACTURA.getRandomApi(); // Cambiado aquí

        const response = await fetch(apiUrl, {

            method: 'POST',

            headers: {

                'Content-Type': 'application/json',

            },

            body: JSON.stringify(facturaData)

        });


        if (response.ok) {

            alert(`Factura guardada exitosamente en Sheety con número de operación: ${nroOperacion}`);

        } else {

            throw new Error('Error al guardar la factura');

        }

    } catch (error) {

        console.error('Error:', error);

        alert('Error al guardar la factura: ' + error.message);

    }
document.getElementById('popupSheety').style.display = 'none';

}

function mostrarPopupId() {

    return new Promise((resolve) => {

        document.getElementById('idFacturaPopup').style.display = 'flex';

        

        window.confirmarGuardarFactura = function() {

            const idFactura = document.getElementById('idFactura').value;

            if (idFactura) {

                cerrarPopupId();

                resolve(idFactura);

            } else {

                alert('Por favor, ingrese un ID de factura válido.');

            }

        };


        window.cerrarPopupId = function() {

            document.getElementById('idFacturaPopup').style.display = 'none';

            resolve(null);

        };

    });

}


function copiarAlPortapapeles() {
    const idFactura = document.getElementById('idFactura').value;
    const fecha = document.getElementById('fecha').value;
    const proveedor = document.getElementById('proveedorText').innerText;
    const nroOperacion = document.getElementById('nroOperacionText').innerText;
    const subtotalGeneral = document.getElementById('subtotalGeneral').innerText;
    const exentoGeneral = document.getElementById('exentoGeneral').innerText;
    const ivaGeneral = document.getElementById('ivaGeneral').innerText;
    const totalGeneral = document.getElementById('totalGeneral').innerText;
    const ivaAPagar = document.getElementById('ivaAPagar').innerText;
    const timbreFiscal = document.getElementById('timbreFiscal').innerText;
    const totalAPagar = document.getElementById('totalAPagar').innerText;
    const retencion = document.getElementById('retencionText').innerText;

    const productos = Array.from(document.querySelectorAll('.product-row')).map(row => ({
        cantidad: row.querySelector('.input-cantidad').value,
        descripcion: row.querySelector('.input-descripcion').value,
        precioUnitario: row.querySelector('.input-precio-unitario').value,
        total: row.querySelector('.input-precio-total').value,
        exento: row.querySelector('.input-exento').checked
    }));

    const datos = `${idFactura}\t${fecha}\t${proveedor}\t${nroOperacion}\t${subtotalGeneral}\t${exentoGeneral}\t${ivaGeneral}\t${totalGeneral}\t${ivaAPagar}\t${timbreFiscal}\t${totalAPagar}\t${JSON.stringify(productos)}\t${retencion}\t`;

    navigator.clipboard.writeText(datos).then(() => {
        alert('Datos copiados al portapapeles.');
    }).catch((error) => {
        console.error('Error al copiar al portapapeles:', error);
    });
}

async function buscarFacturaSheety() {

    const nroOperacion = prompt('Ingrese el número de operación a buscar:');

    if (!nroOperacion) return; // Salir si no se ingresa ningún valor


    try {

        const apiUrl = API_FACTURA.getRandomApi(); // Cambiado aquí

        const response = await fetch(apiUrl);

        if (!response.ok) {

            throw new Error(`Error en la solicitud a Sheety: ${response.status} ${response.statusText}`);

        }

        const data = await response.json();


        // Filtrar por número de operación (OP)

        const facturas = data.sheet1.filter(factura => 

            factura.nroOperacion.toLowerCase() === nroOperacion.toLowerCase() 

        );


        if (facturas.length > 0) {

            const selectedFactura = facturas[0]; // Tomar la primera coincidencia


            // Cargar datos de la factura en la interfaz

            document.getElementById('fecha').value = selectedFactura.fecha;

            document.getElementById('proveedorText').innerText = selectedFactura.proveedor;

            document.getElementById('nroOperacionText').innerText = selectedFactura.nroOperacion;

            document.getElementById('subtotalGeneral').innerText = selectedFactura. subtotalGeneral;

            document.getElementById('exentoGeneral').innerText = selectedFactura.exentoGeneral;

            document.getElementById('ivaGeneral').innerText = selectedFactura.ivaGeneral;

            document.getElementById('totalGeneral').innerText = selectedFactura.totalGeneral;

            document.getElementById('ivaAPagar').innerText = selectedFactura.ivaAPagar;

            document.getElementById('timbreFiscal').innerText = selectedFactura.timbreFiscal;

            document.getElementById('totalAPagar').innerText = selectedFactura.totalAPagar;

            document.getElementById('retencionText').innerText = selectedFactura.retencion;


            // Cargar productos

            const productContainer = document.getElementById('productContainer');

            productContainer.innerHTML = ''; // Limpiar productos existentes


            const productos = JSON.parse(selectedFactura.productos);

            productos.forEach(producto => {

                agregarFilaConProducto(producto);

            });


            actualizarResumenGeneral();

            alert('Factura cargada exitosamente');

        } else {

            alert('No se encontraron facturas con el número de operación: ' + nroOperacion);

        }

    } catch (error) {

        console.error('Error al buscar la factura:', error);

        alert('Error al buscar la factura: ' + error.message);

    }
document.getElementById('popupSheety').style.display = 'none';

}

function agregarFilaConProducto(producto) {
    const productContainer = document.getElementById('productContainer');
    const newRow = document.createElement('div');
    newRow.className = 'product-row';
    newRow.innerHTML = `
        <input type="number" class="input-cantidad" value="${producto.cantidad}" oninput="calcularTotal(this)">
        <input type="text" class="input-descripcion" value="${producto.descripcion}">
        <input type="number" class="input-precio-unitario" value="${producto.precioUnitario}" step="0.01" oninput="calcularTotal(this)" onwheel="ajustarPrecioUnitario(event, this)">
        <input type="number" class="input-precio-total" value="${producto.total}" readonly>
        <input type="number" class="input-total-con-descuento" value="${(producto.total * 0.999).toFixed(2)}" readonly>
        <label>
            <input type="checkbox" class="input-exento" ${producto.exento ? 'checked' : ''} onchange="actualizarResumenGeneral()"> E
        </label>
        <button class="btn-eliminar" onclick="eliminarFila(this)">X</button>
    `;
    productContainer.appendChild(newRow);
}


function cargarFacturaDesdeArchivo() {

    const input = document.createElement('input');

    input.type = 'file';

    input.accept = '.json';

    input.onchange = function(event) {

        const file = event.target.files[0];

        const reader = new FileReader();

        reader.onload = function(e) {

            const facturaData = JSON.parse(e.target.result);

            cargarFacturaEnInterfaz(facturaData);

        };

        reader.readAsText(file);

    };

    input.click();

}


function guardarFacturaEnArchivo() {

    const facturaData = obtenerDatosFactura();

    const dataStr = JSON.stringify(facturaData, null, 2);

    const blob = new Blob([dataStr], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = `factura_${facturaData.proveedor}_${facturaData.nroOperacion}_Total_${facturaData.totalAPagar}.json`;

    a.click();

    URL.revokeObjectURL(url);

}

function obtenerDatosFactura() {

    const rows = Array.from(document.querySelectorAll('.product-row')).map(row => ({

        cantidad: row.querySelector('.input-cantidad').value,

        descripcion: row.querySelector('.input-descripcion').value,

        precioUnitario: row.querySelector('.input-precio-unitario').value,

        precioTotal: row.querySelector('.input-precio-total').value,

        totalConDescuento: row.querySelector('.input-total-con-descuento').value,

        exento: row.querySelector('.input-exento').checked

    }));


    return {

        fecha: document.getElementById('fecha').value,

        proveedor: document.getElementById('proveedorText').innerText,

        retencion: document.getElementById('retencionText').innerText,

        nroOperacion: document.getElementById('nroOperacionText').innerText,

        productos: rows,

        subtotal: document.getElementById('subtotalGeneral').innerText,

        exento: document.getElementById('exentoGeneral').innerText,

        iva: document.getElementById('ivaGeneral').innerText,

        total: document.getElementById('totalGeneral').innerText,

        ivaAPagar: document.getElementById('ivaAPagar').innerText,

        timbreFiscal: document.getElementById('timbreFiscal').innerText,

        totalAPagar: document.getElementById('totalAPagar').innerText

    };

}


function cargarFacturaEnInterfaz(facturaData) {

    document.getElementById('fecha').value = facturaData.fecha;

    document.getElementById('proveedorText').innerText = facturaData.proveedor;

    document.getElementById('retencionText').innerText = facturaData.retencion;

    document.getElementById('nroOperacionText').innerText = facturaData.nroOperacion;


    const productContainer = document.getElementById('productContainer');

    productContainer.innerHTML = ''; // Limpiar el contenedor de productos


    facturaData.productos.forEach(producto => {

        const newRow = document.createElement('div');

        newRow.className = 'product-row';

        newRow.innerHTML = `

            <input type="number" class="input-cantidad" value="${producto.cantidad}" oninput="calcularTotal(this)">

            <input type="text" class="input-descripcion" value="${producto.descripcion}">

            <input type="number" class="input-precio-unitario" value="${producto.precioUnitario}" step="0.01" oninput="calcularTotal(this)" onwheel="ajustarPrecioUnitario(event, this)">

            <input type="number" class="input-precio-total" value="${producto.precioTotal}" readonly>

            <input type="number" class="input-total-con-descuento" value="${producto.totalConDescuento}" readonly>

            <label>

                <input type="checkbox" class="input-exento" ${producto.exento ? 'checked' : ''} onchange="actualizarResumenGeneral()"> E

            </label>

            <button class="btn-eliminar" onclick="eliminarFila(this)">X</button>

        `;

        productContainer.appendChild(newRow);

    });


    document.getElementById('subtotalGeneral').innerText = facturaData.subtotal;

    document.getElementById('exentoGeneral').innerText = facturaData.exento;

    document.getElementById('ivaGeneral').innerText = facturaData.iva;

    document.getElementById('totalGeneral').innerText = facturaData.total;

    document.getElementById('ivaAPagar').innerText = facturaData.ivaAPagar;

    document.getElementById('timbreFiscal').innerText = facturaData.timbreFiscal;

    document.getElementById('totalAPagar').innerText = facturaData.totalAPagar;


    actualizarResumenGeneral();

    cerrarPopupArchivos();

}

function mostrarPopupArchivos() {

    document.getElementById('popupArchivos').style.display = 'block';

}


function cerrarPopupArchivos() {

    document.getElementById('popupArchivos').style.display = 'none';

}

function mostrarPopupSheety() {
    document.getElementById('popupSheety').style.display = 'block';
}

function cerrarPopupSheety() {
    document.getElementById('popupSheety').style.display = 'none';
}

function cargarProveedores() {
    const proveedorSelect = document.getElementById('popupProveedor');
    
    // Mantener las opciones por defecto
    const defaultOptions = proveedorSelect.innerHTML;
    
    // Ordenar proveedores alfabéticamente
    proveedores.sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    // Agregar los proveedores de la lista
    const proveedoresOptions = proveedores.map(proveedor => 
        `<option value="${proveedor.nombre}" 
                data-rif="${proveedor.rif}" 
                data-retencion="${proveedor.retencion}">
            ${proveedor.nombre}
        </option>`
    ).join('');
    
    proveedorSelect.innerHTML = defaultOptions + proveedoresOptions;
}

// Llamar a la función cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    cargarProveedores();
});