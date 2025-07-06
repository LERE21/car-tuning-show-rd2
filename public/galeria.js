document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('contenedor-autos-subpagina');
  const botonesFiltro = document.querySelectorAll('.filtro-marca');
  const tituloCategoria = document.getElementById('titulo-categoria');

  const modal = document.getElementById('img-overlay');
  const modalImagen = modal.querySelector('img.img-principal-modal');
  const modalInfo = modal.querySelector('.info-extra');
  const modalGaleriaExtra = modal.querySelector('.galeria-extra');
  const btnCerrar = modal.querySelector('.cerrar-modal');

  if (!contenedor) console.error('No se encontró el contenedor de autos');
  if (!botonesFiltro.length) console.error('No se encontraron botones de filtro');
  if (!modal) console.error('No se encontró el modal');
  if (!modalImagen) console.error('No se encontró la imagen principal del modal');

  let autosCargados = [];
  let imagenesActuales = [];
  let imagenIndex = 0;

  let botonesInsertados = false;
  function insertarBotonesModal() {
    if (botonesInsertados) return;

    const btnPrev = document.createElement('button');
    btnPrev.textContent = '◀️';
    btnPrev.classList.add('nav-btn');
    btnPrev.id = 'btnPrev';

    const btnNext = document.createElement('button');
    btnNext.textContent = '▶️';
    btnNext.classList.add('nav-btn');
    btnNext.id = 'btnNext';

    const modalContenido = modal.querySelector('.modal-contenido');
    if (!modalContenido) {
      console.error('No se encontró el contenido del modal para insertar botones');
      return;
    }
    modalContenido.insertBefore(btnPrev, modalImagen);
    modalContenido.insertBefore(btnNext, modalInfo);

    btnPrev.addEventListener('click', () => {
      imagenIndex = (imagenIndex - 1 + imagenesActuales.length) % imagenesActuales.length;
      mostrarImagenActual();
    });

    btnNext.addEventListener('click', () => {
      imagenIndex = (imagenIndex + 1) % imagenesActuales.length;
      mostrarImagenActual();
    });

    botonesInsertados = true;
  }

  function obtenerRutaImagen(nombreOPath) {
    if (!nombreOPath) return 'placeholder.jpg';
    if (nombreOPath.startsWith('subpaginas/')) {
      return `/image/${nombreOPath}`;
    } else {
      return `/image/subpaginas/${nombreOPath}`;
    }
  }

  const categoriaActual = (() => {
    const path = window.location.pathname;
    const file = path.substring(path.lastIndexOf('/') + 1);
    const cat = file.split('.')[0].toLowerCase();
    console.log('Categoría detectada:', cat);
    return cat;
  })();

  async function cargarAutos() {
    try {
      console.log(`Cargando autos para categoría: ${categoriaActual}`);
      const res = await fetch(`/autos-subpaginas?categoriaPagina=${categoriaActual}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const autos = await res.json();
      console.log('Autos recibidos:', autos);
      autosCargados = autos;
      mostrarAutosFiltrados('todos');
    } catch (error) {
      console.error('Error al cargar autos:', error);
      if (contenedor) contenedor.innerHTML = '<p>Error al cargar autos.</p>';
    }
  }

  function mostrarAutosFiltrados(marca) {
    if (!contenedor) return;
    contenedor.innerHTML = '';
    tituloCategoria.textContent = marca === 'todos' ? 'Todos los autos' : marca.charAt(0).toUpperCase() + marca.slice(1);

    const autosFiltrados = autosCargados.filter(auto =>
      marca === 'todos' || (auto.marca && auto.marca.toLowerCase() === marca)
    );

    if (autosFiltrados.length === 0) {
      contenedor.innerHTML = '<p>No hay autos para esta categoría o marca.</p>';
      return;
    }

    autosFiltrados.forEach(auto => {
      const imagenes = JSON.parse(auto.imagenes_json || '[]');
      const imgSrc = imagenes.length > 0 ? obtenerRutaImagen(imagenes[0]) : 'placeholder.jpg';

      const tarjeta = document.createElement('div');
      tarjeta.classList.add('tarjeta');
      tarjeta.dataset.marca = auto.marca ? auto.marca.toLowerCase() : '';
      tarjeta.dataset.extra = auto.articulo || '';
      tarjeta.dataset.imagenes = JSON.stringify(imagenes);
      tarjeta.dataset.modelo = auto.modelo;

      tarjeta.innerHTML = `
        <img src="${imgSrc}" alt="${auto.modelo}" class="expandible" />
        <h3>${auto.modelo}</h3>
        <p>${auto.descripcion}</p>
      `;

      contenedor.appendChild(tarjeta);

      tarjeta.querySelector('.expandible').addEventListener('click', () => abrirGaleriaModal(tarjeta));
    });
  }

  function abrirGaleriaModal(tarjeta) {
    insertarBotonesModal();

    imagenesActuales = JSON.parse(tarjeta.dataset.imagenes || '[]');
    imagenIndex = 0;

    mostrarImagenActual();

    modalInfo.textContent = tarjeta.dataset.extra || '';

    modalGaleriaExtra.innerHTML = '';
    imagenesActuales.forEach((imgNombre, index) => {
      const thumb = document.createElement('img');
      thumb.src = obtenerRutaImagen(imgNombre);
      thumb.alt = `${tarjeta.dataset.modelo} imagen ${index + 1}`;
      thumb.classList.add('miniatura');
      thumb.addEventListener('click', () => {
        imagenIndex = index;
        mostrarImagenActual();
      });
      modalGaleriaExtra.appendChild(thumb);
    });

    modal.style.display = 'flex';
  }

  function mostrarImagenActual() {
    if (imagenesActuales.length > 0) {
      modalImagen.src = obtenerRutaImagen(imagenesActuales[imagenIndex]);
      modalImagen.alt = `Imagen ${imagenIndex + 1}`;
    }
  }

  function cerrarModal() {
    modal.style.display = 'none';
    modalImagen.src = '';
    modalInfo.textContent = '';
    modalGaleriaExtra.innerHTML = '';
    modalImagen.classList.remove('ampliada');
  }

  btnCerrar.addEventListener('click', cerrarModal);
  window.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
  });

  window.addEventListener('keydown', (e) => {
    if (modal.style.display === 'flex') {
      if (e.key === 'ArrowLeft') {
        imagenIndex = (imagenIndex - 1 + imagenesActuales.length) % imagenesActuales.length;
        mostrarImagenActual();
      } else if (e.key === 'ArrowRight') {
        imagenIndex = (imagenIndex + 1) % imagenesActuales.length;
        mostrarImagenActual();
      } else if (e.key === 'Escape') {
        cerrarModal();
      }
    }
  });

  modalImagen.addEventListener('click', () => {
    modalImagen.classList.toggle('ampliada');
  });

  botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
      mostrarAutosFiltrados(boton.dataset.marca);
      botonesFiltro.forEach(b => b.classList.remove('activo'));
      boton.classList.add('activo');
    });
  });

  cargarAutos();

  botonesFiltro.forEach(b => b.classList.remove('activo'));
  if (botonesFiltro.length > 0) botonesFiltro[0].classList.add('activo');
});


const selector = document.getElementById('selector-galeria');

if (selector) {
  selector.addEventListener('change', () => {
    const url = selector.value;
    if (url && url.endsWith('.html')) {
      window.location.href = url;
    }

    // Mantener la opción "Galería" visible después de seleccionar
    selector.selectedIndex = 0;
  });

  // Evitar que se seleccione una opción automáticamente al entrar a la subpágina
  // para que siempre diga "Galería"
  selector.selectedIndex = 0;
}
