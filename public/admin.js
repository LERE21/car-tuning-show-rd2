// ===================== Referencias a formularios =====================
const formNoticias = document.getElementById('form-noticias');
const formEventos = document.getElementById('form-eventos');
const formAutos = document.getElementById('form-autos');
const formCarrusel = document.getElementById('form-carrusel');

const selectTipo = document.getElementById('select-tipo');
const selectId = document.getElementById('select-id');
const btnEliminar = document.getElementById('btn-eliminar');

// ===================== SUBIR NOTICIAS =====================
if (formNoticias) {
  formNoticias.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(formNoticias);
    try {
      const res = await fetch('/api/noticias', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Error al subir noticia');
      alert('Noticia subida correctamente');
      formNoticias.reset();
    } catch (err) {
      console.error(err);
      alert('Error al subir noticia');
    }
  });
}

// ===================== SUBIR EVENTOS =====================
if (formEventos) {
  formEventos.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(formEventos);
    try {
      const res = await fetch('/api/eventos', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Error al subir evento');
      alert('Evento subido correctamente');
      formEventos.reset();
    } catch (err) {
      console.error(err);
      alert('Error al subir evento');
    }
  });
}

// ===================== SUBIR AUTOS =====================
if (formAutos) {
  formAutos.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(formAutos);
    try {
      const res = await fetch('/api/autos', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Error al subir auto');
      alert('Auto subido correctamente');
      formAutos.reset();
    } catch (err) {
      console.error(err);
      alert('Error al subir auto');
    }
  });
}


// ===================== SUBIR AUTOS A SUBPÁGINAS =====================
const formAutoSubpaginas = document.getElementById('form-auto-subpaginas');

if (formAutoSubpaginas) {
  formAutoSubpaginas.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(formAutoSubpaginas);

    try {
      const res = await fetch('/autos-subpaginas', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Error al subir auto');

      alert('Auto subido correctamente');
      formAutoSubpaginas.reset();

    } catch (err) {
      console.error(err);
      alert('Error al subir auto');
    }
  });
}

// Ejemplo opcional: función para cargar autos subpáginas y listarlos en consola o para otro uso
async function cargarAutosSubpaginas(categoria = '') {
  try {
    let url = '/autos-subpaginas';
    if (categoria && categoria !== 'todos') {
      url += `?categoriaPagina=${categoria}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar autos subpáginas');
    const autos = await res.json();
    console.log('Autos subpáginas cargados:', autos);
    return autos;
  } catch (error) {
    console.error(error);
  }
}


// ===================== SUBIR CARRUSEL =====================
if (formCarrusel) {
  formCarrusel.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(formCarrusel);
    try {
      const res = await fetch('/api/carrusel', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Error al subir carrusel');
      alert('Carrusel actualizado correctamente');
      formCarrusel.reset();
      cargarDatosCarrusel(); // Volver a cargar datos actualizados
    } catch (err) {
      console.error(err);
      alert('Error al subir carrusel');
    }
  });

  // Cargar datos existentes en carrusel
  cargarDatosCarrusel();
}

async function cargarDatosCarrusel() {
  if (!formCarrusel) return;
  try {
    const res = await fetch('/api/carrusel');
    if (!res.ok) throw new Error('Error al obtener carrusel');
    const data = await res.json();
    if (data.length === 0) return;

    const carrusel = data[0];
    formCarrusel.titulo.value = carrusel.titulo || '';
    formCarrusel.descripcion.value = carrusel.descripcion || '';

    // Borrar contenedor previo si existe
    const previo = formCarrusel.querySelector('.imagenes-actuales');
    if (previo) previo.remove();

    if (carrusel.imagenes_json) {
      let imagenes = [];
      try {
        imagenes = JSON.parse(carrusel.imagenes_json);
      } catch {
        imagenes = [];
      }
      const contenedor = document.createElement('div');
      contenedor.classList.add('imagenes-actuales');
      contenedor.innerHTML = `<p>Imágenes actuales:</p>`;
      imagenes.forEach(img => {
        const imgEl = document.createElement('img');
        imgEl.src = `/${img}`;
        contenedor.appendChild(imgEl);
      });

      // Insertar antes del input file
      const inputImagenes = formCarrusel.querySelector('input[name="imagenes"]');
      formCarrusel.insertBefore(contenedor, inputImagenes);
    }
  } catch (e) {
    console.error('Error cargando carrusel:', e);
  }
}



// ===================== ELIMINAR =====================
if (selectTipo && selectId && btnEliminar) {
  selectTipo.addEventListener('change', async () => {
    const tipo = selectTipo.value;
    selectId.innerHTML = '<option value="">Cargando...</option>';
    if (!tipo) {
      selectId.innerHTML = '<option value="">Selecciona ID</option>';
      return;
    }

    try {
      const res = await fetch(`/api/${tipo}`);
      if (!res.ok) throw new Error('Error cargando datos');
      const data = await res.json();

      selectId.innerHTML = '<option value="">Selecciona ID</option>';
      data.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        if (item.titulo) {
          opt.textContent = `${item.id} - ${item.titulo}`;
        } else if (item.modelo) {
          opt.textContent = `${item.id} - ${item.modelo}`;
        } else {
          opt.textContent = `${item.id} - Elemento`;
        }
        selectId.appendChild(opt);
      });
    } catch (err) {
      console.error(err);
      selectId.innerHTML = '<option value="">Error al cargar IDs</option>';
    }
  });

  btnEliminar.addEventListener('click', async () => {
    const tipo = selectTipo.value;
    const id = selectId.value;

    if (!tipo || !id) {
      alert('Selecciona tipo e ID');
      return;
    }

    if (!confirm(`¿Seguro que quieres eliminar el ${tipo.slice(0, -1)} con ID ${id}?`)) return;

    try {
      const res = await fetch(`/api/${tipo}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error eliminando');

      alert(data.message || 'Elemento eliminado');
      selectTipo.dispatchEvent(new Event('change')); // Recargar lista de IDs
    } catch (err) {
      console.error(err);
      alert('Error al eliminar');
    }
  });
}