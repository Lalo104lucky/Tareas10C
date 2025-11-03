if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Registro SW exitoso: ', reg))
            .catch(err => console.error('Error de registro SW: ', err));
    });
}

function showToast(msg, color = "#222") {
    const toast = document.getElementById('toast-msg');
    toast.textContent = msg;
    toast.style.background = color;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 300);
    }, 1800);
}

const db = new PouchDB('tareas');

const inputName = document.getElementById('nombre');
const inputFecha = document.getElementById('fecha');

const btnAdd = document.getElementById('btnAdd');
const btnList = document.getElementById('btnList');
const taskList = document.getElementById('taskList');

btnAdd.addEventListener('click', () => {
    const tarea = {
        _id: new Date().toISOString(),
        nombre: inputName.value,
        fecha: inputFecha.value,
        status: false
    }

    db.put(tarea)
    .then((result) => {
        console.log('Exito', result);
        showToast('¡Tarea agregada!', '#28a745');
        inputName.value = '';
        inputFecha.value = '';
    })
    .catch((err) => {
        showToast('Error al agregar tarea', '#dc3545');
        console.error(err);
    })
})

btnList.addEventListener('click', () => {
    db.allDocs(
        { 
            include_docs: true
        }
    )
    .then(result => {
        console.log('Resultado', result);
        taskList.innerHTML = '';
        result.rows.forEach(row => {
            const tarea = row.doc;
            const lista = document.createElement('lista');
            lista.className = 'task-item';
            lista.innerHTML = `
                <div class="task-info">
                    <span class="task-name">${tarea.nombre}</span><br>
                    <span class="task-date">${tarea.fecha}</span>
                </div>
                <input type="checkbox" class="status-checkbox" ${tarea.status ? 'checked' : ''}>
            `;
            lista.querySelector('.status-checkbox').addEventListener('change', (e) => {
                db.get(tarea._id).then(doc => {
                    return db.put({
                        ...doc,
                        status: e.target.checked
                    });
                }).catch(err => {
                    console.error('No quiso jalar xD: ', err);
                })
            });
            taskList.appendChild(lista);
        });
    });
});