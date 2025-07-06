document.addEventListener('DOMContentLoaded', () => {
  cargarNoticias();
  cargarAutos();
  cargarEventos().then(() => {
    inicializarEventoCarrusel();
    iniciarEventoSlider();
  });
  cargarCarrusel().then(() => {
    inicializarAutoCarrusel();
    iniciarAutoSlider();
  });

  // ================= AUTO DE LA SEMANA - MODAL =================
  const modal = document.getElementById('modal-auto-semana');
  const cerrar = document.querySelector('.cerrar-modal');
  const tituloModal = document.getElementById('modal-titulo');
  const descripcionModal = document.getElementById('modal-descripcion');
  const tituloH2 = document.getElementById('titulo-auto-semana');

  tituloH2.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/carrusel');
      if (!res.ok) throw new Error('Error al cargar auto de la semana');
      const data = await res.json();
      if (data.length === 0) return;

      const auto = data[0];
      tituloModal.textContent = auto.titulo || 'Auto de la Semana';
      descripcionModal.textContent = auto.descripcion || 'Sin descripción disponible';

      modal.style.display = 'block';
    } catch (error) {
      console.error('Error cargando modal:', error);
    }
  });

  cerrar.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});

// ================= AUTO DE LA SEMANA - CARRUSEL =================
let autoSlideIndex = 0;
let autoSlideInterval = null;

async function cargarCarrusel() {
  try {
    const res = await fetch('/api/carrusel');
    if (!res.ok) throw new Error('Error al obtener carrusel');
    const data = await res.json();

    const slideTrack = document.getElementById('slide-track');
    if (!slideTrack) return;

    slideTrack.innerHTML = '';

    if (!data || data.length === 0) return;

    const carrusel = data[0];

    if (!carrusel.imagenes_json) return;

    const imagenes = JSON.parse(carrusel.imagenes_json);

    imagenes.forEach(imgPath => {
      const div = document.createElement('div');
      div.classList.add('slide');
      div.innerHTML = `<img src="${imgPath}" alt="Auto de la semana" />`;
      slideTrack.appendChild(div);
    });
  } catch (error) {
    console.error('Error al cargar el carrusel:', error);
  }
}

function inicializarAutoCarrusel() {
  const slides = document.querySelectorAll('#slide-track .slide');
  const prevBtn = document.querySelector('.slider-btn.prev');
  const nextBtn = document.querySelector('.slider-btn.next');

  if (slides.length === 0) return;

  actualizarAutoCarrusel();

  prevBtn?.addEventListener('click', () => {
    autoSlideIndex = (autoSlideIndex - 1 + slides.length) % slides.length;
    actualizarAutoCarrusel();
    reiniciarAutoSlider();
  });

  nextBtn?.addEventListener('click', () => {
    autoSlideIndex = (autoSlideIndex + 1) % slides.length;
    actualizarAutoCarrusel();
    reiniciarAutoSlider();
  });
}

function actualizarAutoCarrusel() {
  const slideTrack = document.getElementById('slide-track');
  slideTrack.style.transition = 'transform 0.5s ease';
  slideTrack.style.transform = `translateX(-${autoSlideIndex * 100}%)`;
}

function iniciarAutoSlider() {
  if (autoSlideInterval) clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    const slides = document.querySelectorAll('#slide-track .slide');
    if (slides.length <= 1) return;

    autoSlideIndex = (autoSlideIndex + 1) % slides.length;
    actualizarAutoCarrusel();
  }, 5000);
}

function reiniciarAutoSlider() {
  iniciarAutoSlider();
}

// ================= EVENTOS =================
let eventoIndex = 0;
let eventoInterval = null;

async function cargarEventos() {
  const eventosCont = document.getElementById('contenedor-eventos');
  if (!eventosCont) return;
  eventosCont.innerHTML = '';

  try {
    const res = await fetch('/api/eventos');
    if (!res.ok) throw new Error('Error al obtener eventos');
    const eventos = await res.json();

    if (eventos.length === 0) {
      eventosCont.innerHTML = '<p>No hay eventos disponibles.</p>';
      return;
    }

    eventos.forEach(ev => {
      const div = document.createElement('div');
      div.classList.add('evento');

      div.innerHTML = `
        <div class="evento-card">
          <img src="${ev.imagen}" alt="${ev.titulo}" class="evento-img-redonda" />
          <div class="evento-texto">
            <h4>${ev.titulo}</h4>
            <p>${ev.descripcion}</p>
          </div>
        </div>
      `;

      div.addEventListener('click', () => abrirModalEvento(ev));
      eventosCont.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    eventosCont.innerHTML = '<p>Error al cargar eventos.</p>';
  }
}

function inicializarEventoCarrusel() {
  const prevBtn = document.querySelector('.evento-btn.prev');
  const nextBtn = document.querySelector('.evento-btn.next');

  prevBtn?.addEventListener('click', () => {
    moverEvento(-1);
    reiniciarEventoSlider();
  });

  nextBtn?.addEventListener('click', () => {
    moverEvento(1);
    reiniciarEventoSlider();
  });

  actualizarEventoSlider();
}

function moverEvento(direccion) {
  const eventos = document.querySelectorAll('#contenedor-eventos .evento');
  if (eventos.length === 0) return;

  eventoIndex = (eventoIndex + direccion + eventos.length) % eventos.length;
  actualizarEventoSlider();
}

function actualizarEventoSlider() {
  const slider = document.getElementById('contenedor-eventos');
  if (!slider) return;

  slider.style.transition = 'transform 0.5s ease';
  slider.style.transform = `translateX(-${eventoIndex * 320}px)`;
}

function iniciarEventoSlider() {
  if (eventoInterval) clearInterval(eventoInterval);
  eventoInterval = setInterval(() => {
    moverEvento(1);
  }, 4000);
}

function reiniciarEventoSlider() {
  iniciarEventoSlider();
}

function abrirModalEvento(evento) {
  const modal = document.getElementById('modalEvento');
  const contenido = document.getElementById('contenidoModalEvento');
  if (!modal || !contenido) return;

  contenido.innerHTML = `
    <h2>${evento.titulo}</h2>
    <img src="${evento.imagen}" alt="${evento.titulo}" style="width:100%; border-radius:10px;">
    <p>${evento.detalle}</p>
  `;
  modal.style.display = 'flex';

  document.getElementById('cerrarModalEvento').onclick = () => {
    modal.style.display = 'none';
  };
}

// ================= NOTICIAS =================
async function cargarNoticias() {
  const noticiasCont = document.getElementById('contenedor-noticias');
  if (!noticiasCont) return;
  noticiasCont.innerHTML = '';

  try {
    const res = await fetch('/api/noticias');
    if (!res.ok) throw new Error('Error al obtener noticias');
    const noticias = await res.json();

    if (noticias.length === 0) {
      noticiasCont.innerHTML = '<p>No hay noticias disponibles.</p>';
      return;
    }

    noticias.forEach(noticia => {
      const div = document.createElement('div');
      div.classList.add('noticia');
      div.innerHTML = `
        <h4>${noticia.titulo}</h4>
        <p>${noticia.contenido}</p>
      `;
      noticiasCont.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    noticiasCont.innerHTML = '<p>Error al cargar noticias.</p>';
  }
}

// ================= AUTOS GALERÍA =================
async function cargarAutos() {
  const galeria = document.getElementById('galeria-autos');
  if (!galeria) return;
  galeria.innerHTML = '';

  try {
    const res = await fetch('/api/autos');
    if (!res.ok) throw new Error('Error al obtener autos');
    const autos = await res.json();

    if (autos.length === 0) {
      galeria.innerHTML = '<p>No hay autos disponibles.</p>';
      return;
    }

    autos.forEach(auto => {
      const div = document.createElement('div');
      div.classList.add('auto-tarjeta');

      let imagenes = [];
      try {
        imagenes = JSON.parse(auto.imagenes_json);
      } catch {
        imagenes = [];
      }

      const imgSrc = imagenes.length > 0 ? `/${imagenes[0]}` : 'placeholder.jpg';

      div.innerHTML = `
        <img src="${imgSrc}" alt="${auto.modelo}" />
        <h4>${auto.modelo}</h4>
        <p>${auto.descripcion}</p>
      `;
      galeria.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    galeria.innerHTML = '<p>Error al cargar autos.</p>';
  }
}

// Variables globales para el modal de galería autos
const modalGaleria = document.getElementById('img-overlay');
const modalImagen = modalGaleria?.querySelector('img.img-principal-modal');
const modalInfo = modalGaleria?.querySelector('.info-extra');
const modalGaleriaExtra = modalGaleria?.querySelector('.galeria-extra');
const btnCerrarModal = modalGaleria?.querySelector('.cerrar-modal');

let imagenesActuales = [];
let imagenIndex = 0;
let botonesInsertados = false;

function insertarBotonesModal() {
  if (botonesInsertados) return;
  if (!modalGaleria) return;

  const btnPrev = document.createElement('button');
  btnPrev.textContent = '◀️';
  btnPrev.classList.add('nav-btn');
  btnPrev.id = 'btnPrev';

  const btnNext = document.createElement('button');
  btnNext.textContent = '▶️';
  btnNext.classList.add('nav-btn');
  btnNext.id = 'btnNext';

  const modalContenido = modalGaleria.querySelector('.modal-contenido');
  if (!modalContenido) return;

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

function mostrarImagenActual() {
  if (modalImagen && imagenesActuales.length > 0) {
    modalImagen.src = imagenesActuales[imagenIndex];
    modalImagen.alt = `Imagen ${imagenIndex + 1}`;
  }
}

function abrirGaleriaModal(auto) {
  if (!modalGaleria || !modalImagen || !modalInfo || !modalGaleriaExtra) return;

  insertarBotonesModal();

  let imagenes = [];
  try {
    imagenes = JSON.parse(auto.imagenes_json);
  } catch {
    imagenes = [];
  }
  imagenesActuales = imagenes.length > 0 ? imagenes.map(img => '/' + img) : ['placeholder.jpg'];

  imagenIndex = 0;
  mostrarImagenActual();

  modalInfo.textContent = auto.articulo || '';

  modalGaleriaExtra.innerHTML = '';
  imagenesActuales.forEach((imgSrc, i) => {
    const thumb = document.createElement('img');
    thumb.src = imgSrc;
    thumb.alt = `${auto.modelo} imagen ${i + 1}`;
    thumb.classList.add('miniatura');
    thumb.addEventListener('click', () => {
      imagenIndex = i;
      mostrarImagenActual();
    });
    modalGaleriaExtra.appendChild(thumb);
  });

  modalGaleria.style.display = 'flex';
}

function cerrarModalGaleria() {
  if (!modalGaleria || !modalImagen || !modalInfo || !modalGaleriaExtra) return;

  modalGaleria.style.display = 'none';
  modalImagen.src = '';
  modalInfo.textContent = '';
  modalGaleriaExtra.innerHTML = '';
  imagenesActuales = [];
  imagenIndex = 0;
}

if (btnCerrarModal) {
  btnCerrarModal.addEventListener('click', cerrarModalGaleria);
}
if (modalGaleria) {
  window.addEventListener('click', (e) => {
    if (e.target === modalGaleria) cerrarModalGaleria();
  });
  window.addEventListener('keydown', (e) => {
    if (modalGaleria.style.display === 'flex') {
      if (e.key === 'ArrowLeft') {
        imagenIndex = (imagenIndex - 1 + imagenesActuales.length) % imagenesActuales.length;
        mostrarImagenActual();
      } else if (e.key === 'ArrowRight') {
        imagenIndex = (imagenIndex + 1) % imagenesActuales.length;
        mostrarImagenActual();
      } else if (e.key === 'Escape') {
        cerrarModalGaleria();
      }
    }
  });
}

// Modificar la función cargarAutos para que agregue evento click a cada auto
async function cargarAutos() {
  const galeria = document.getElementById('galeria-autos');
  if (!galeria) return;
  galeria.innerHTML = '';

  try {
    const res = await fetch('/api/autos');
    if (!res.ok) throw new Error('Error al obtener autos');
    const autos = await res.json();

    if (autos.length === 0) {
      galeria.innerHTML = '<p>No hay autos disponibles.</p>';
      return;
    }

    autos.forEach(auto => {
      const div = document.createElement('div');
      div.classList.add('auto-tarjeta');

      let imagenes = [];
      try {
        imagenes = JSON.parse(auto.imagenes_json);
      } catch {
        imagenes = [];
      }

      const imgSrc = imagenes.length > 0 ? `/${imagenes[0]}` : 'placeholder.jpg';

      div.innerHTML = `
        <img src="${imgSrc}" alt="${auto.modelo}" />
        <h4>${auto.modelo}</h4>
        <p>${auto.descripcion}</p>
      `;

      // Al hacer clic en la tarjeta, abrir modal con más imágenes e info
      div.addEventListener('click', () => abrirGaleriaModal(auto));

      galeria.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    galeria.innerHTML = '<p>Error al cargar autos.</p>';
  }
}
// --- Modal para eventos (solo texto, sin foto) ---
const modalEventos = document.getElementById('modal-eventos');
const modalEventosContenido = modalEventos?.querySelector('.contenido-evento');
const btnCerrarModalEventos = modalEventos?.querySelector('.cerrar-modal-eventos');

function abrirModalEvento(eventoData) {
  if (!modalEventos || !modalEventosContenido) return;
  modalEventosContenido.textContent = eventoData.descripcion || 'No hay información disponible.';
  modalEventos.style.display = 'flex';
}

function cerrarModalEventos() {
  if (!modalEventos) return;
  modalEventos.style.display = 'none';
  if (modalEventosContenido) modalEventosContenido.textContent = '';
}

if (btnCerrarModalEventos) {
  btnCerrarModalEventos.addEventListener('click', cerrarModalEventos);
}
if (modalEventos) {
  window.addEventListener('click', (e) => {
    if (e.target === modalEventos) cerrarModalEventos();
  });
  window.addEventListener('keydown', (e) => {
    if (modalEventos.style.display === 'flex' && e.key === 'Escape') {
      cerrarModalEventos();
    }
  });
}

// Suponiendo que tienes un contenedor con id "contenedor-eventos" y eventos ya cargados ahí
const contenedorEventos = document.getElementById('contenedor-eventos');
if (contenedorEventos) {
  contenedorEventos.querySelectorAll('.evento-tarjeta').forEach(tarjeta => {
    tarjeta.addEventListener('click', () => {
      const descripcion = tarjeta.dataset.descripcion || tarjeta.querySelector('.descripcion')?.textContent || '';
      abrirModalEvento({ descripcion });
    });
  });
}

// ============ Modal Galería Autos ============
const modalAuto = document.getElementById('modal-auto');
const modalTituloAuto = document.getElementById('modal-titulo-auto');
const modalImagenesAuto = document.getElementById('modal-imagenes-auto');
const modalDescripcionAuto = document.getElementById('modal-descripcion-auto');
const modalCerrarAuto = document.getElementById('modal-cerrar-auto');

function abrirModalAuto({ titulo, imagenes = [], descripcion = '' }) {
  modalTituloAuto.textContent = titulo || '';
  modalDescripcionAuto.textContent = descripcion || '';

  modalImagenesAuto.innerHTML = '';
  imagenes.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `${titulo} imagen ${i + 1}`;
    img.classList.add('img-modal-auto');
    modalImagenesAuto.appendChild(img);
  });

  modalAuto.style.display = 'flex';
}

modalCerrarAuto.addEventListener('click', () => {
  modalAuto.style.display = 'none';
});


// ============ Modal Evento ============
const modalEvento = document.getElementById('modalEvento');
const contenidoModalEvento = document.getElementById('contenidoModalEvento');
const cerrarModalEvento = document.getElementById('cerrarModalEvento');

function abrirModalEvento(infoHtml = '') {
  contenidoModalEvento.innerHTML = infoHtml;
  modalEvento.style.display = 'flex';
}

cerrarModalEvento.addEventListener('click', () => {
  modalEvento.style.display = 'none';
});

// ============ Modal Artículo ============
const modalArticulo = document.getElementById('modalArticulo');
const contenidoModalArticulo = document.getElementById('contenidoModalArticulo');
const cerrarModalArticulo = document.getElementById('cerrarModalArticulo');

function abrirModalArticulo(contenidoHtml = '') {
  contenidoModalArticulo.innerHTML = contenidoHtml;
  modalArticulo.style.display = 'flex';
}

cerrarModalArticulo.addEventListener('click', () => {
  modalArticulo.style.display = 'none';
});

// ============ Cierre global ============
window.addEventListener('click', (e) => {
  if (e.target === modalAuto) modalAuto.style.display = 'none';
  if (e.target === modalEvento) modalEvento.style.display = 'none';
  if (e.target === modalArticulo) modalArticulo.style.display = 'none';
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    modalAuto.style.display = 'none';
    modalEvento.style.display = 'none';
    modalArticulo.style.display = 'none';
  }
});