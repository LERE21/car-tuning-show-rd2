const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const app = express();
const port = 3000;

// Configuración de base de datos
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Graper21',
  database: 'car_tuning_show_rd',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Multer
const createStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, `public/image/${folder}`)),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const uploadCarrusel = multer({ storage: createStorage('carrusel') });
const uploadSubpaginas = multer({ storage: createStorage('subpaginas') });
const uploadGeneral = multer({ storage: createStorage('') });

// Endpoints

// Autos principales
app.post('/autos', uploadGeneral.array('imagenes', 5), async (req, res) => {
  try {
    const { modelo, descripcion, articulo } = req.body;
    const imagenes = req.files;
    if (!modelo || !descripcion || !imagenes?.length) {
      return res.status(400).json({ error: 'Faltan datos' });
    }
    const imagenes_json = JSON.stringify(imagenes.map(img => `image/${img.filename}`));
    await pool.query('INSERT INTO autos (modelo, descripcion, articulo, imagenes_json) VALUES (?, ?, ?, ?)',
      [modelo, descripcion, articulo || null, imagenes_json]);
    res.json({ message: 'Auto guardado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar auto' });
  }
});

// Autos subpáginas
app.post('/autos-subpaginas', uploadSubpaginas.array('imagenes', 5), async (req, res) => {
  try {
    const { modelo, descripcion, marca, categoria_pagina, articulo } = req.body;
    const archivos = req.files;
    if (!modelo || !descripcion || !marca || !categoria_pagina || !archivos?.length) {
      return res.status(400).json({ error: 'Faltan datos' });
    }
    // Aquí guardamos las rutas relativas solo con subcarpeta "subpaginas"
    const imagenes_json = JSON.stringify(archivos.map(file => `subpaginas/${file.filename}`));
    await pool.query(
      'INSERT INTO autos_subpaginas (modelo, descripcion, marca, categoria_pagina, articulo, imagenes) VALUES (?, ?, ?, ?, ?, ?)',
      [modelo, descripcion, marca, categoria_pagina, articulo || null, imagenes_json]);
    res.json({ message: 'Auto subpágina guardado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error auto subpágina' });
  }
});

// Carrusel (reemplazar imágenes anteriores)
app.post('/api/carrusel', uploadCarrusel.array('imagenes', 5), async (req, res) => {
  const { titulo, descripcion } = req.body;
  const archivos = req.files;

  if (!titulo || !descripcion) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  let imagenes_json = null;

  if (archivos && archivos.length > 0) {
    imagenes_json = JSON.stringify(archivos.map(file => `image/carrusel/${file.filename}`));
  }

  try {
    const [rows] = await pool.query('SELECT id FROM carrusel LIMIT 1');

    if (rows.length === 0) {
      await pool.query(
        'INSERT INTO carrusel (titulo, descripcion, imagenes_json, created_at) VALUES (?, ?, ?, NOW())',
        [titulo, descripcion, imagenes_json]
      );
      res.json({ message: 'Auto del carrusel creado' });
    } else {
      const id = rows[0].id;
      if (imagenes_json) {
        await pool.query(
          'UPDATE carrusel SET titulo = ?, descripcion = ?, imagenes_json = ? WHERE id = ?',
          [titulo, descripcion, imagenes_json, id]
        );
      } else {
        await pool.query(
          'UPDATE carrusel SET titulo = ?, descripcion = ? WHERE id = ?',
          [titulo, descripcion, id]
        );
      }
      res.json({ message: 'Auto del carrusel actualizado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar carrusel' });
  }
});

// Noticias
app.post('/noticias', uploadGeneral.none(), async (req, res) => {
  try {
    const { titulo, contenido } = req.body;
    if (!titulo || !contenido) return res.status(400).json({ error: 'Faltan datos' });
    await pool.query('INSERT INTO noticias (titulo, contenido) VALUES (?, ?)', [titulo, contenido]);
    res.json({ message: 'Noticia guardada' });
  } catch (err) {
    res.status(500).json({ error: 'Error noticia' });
  }
});

// Eventos
app.post('/api/eventos', uploadGeneral.single('imagen'), async (req, res) => {
  try {
    const { titulo, descripcion, detalle } = req.body;
    const imagen = req.file?.filename;

    if (!titulo || !descripcion || !detalle || !imagen) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const imagenRuta = `image/${imagen}`;
    await pool.query(
      'INSERT INTO eventos (titulo, descripcion, detalle, imagen) VALUES (?, ?, ?, ?)',
      [titulo, descripcion, detalle, imagenRuta]
    );

    res.json({ message: 'Evento guardado correctamente' });
  } catch (err) {
    console.error('Error guardando evento:', err);
    res.status(500).json({ error: 'Error interno al guardar el evento' });
  }
});


// GET endpoints
app.get('/api/autos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM autos ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error autos' });
  }
});

app.get('/api/noticias', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM noticias ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error noticias' });
  }
});

app.get('/api/eventos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM eventos ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

app.get('/api/carrusel', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM carrusel ORDER BY created_at DESC');
    console.log('Datos carrusel:', rows);  // <--- Aquí vemos qué trae la DB
    res.json(rows);
  } catch (error) {
    console.error('Error en /api/carrusel:', error);  // <--- Imprime el error real
    res.status(500).json({ error: 'Error al obtener datos del carrusel' });
  }
});

// Autos subpáginas con filtro opcional por categoría
app.get('/autos-subpaginas', async (req, res) => {
  try {
    const { categoriaPagina } = req.query;
    let query = 'SELECT *, imagenes AS imagenes_json FROM autos_subpaginas';
    const params = [];
    if (categoriaPagina && categoriaPagina !== 'todos') {
      query += ' WHERE categoria_pagina = ?';
      params.push(categoriaPagina);
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error subpaginas' });
  }
});

// DELETE endpoints
app.delete('/api/noticias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM noticias WHERE id = ?', [id]);
    res.json({ message: 'Noticia eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar noticia' });
  }
});

// Eliminar evento
app.delete('/api/eventos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM eventos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    res.json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});



app.delete('/api/autos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('SELECT imagenes_json FROM autos WHERE id = ?', [id]);
    if (result.length === 0) return res.status(404).json({ error: 'Auto no encontrado' });

    const imagenes = JSON.parse(result[0].imagenes_json || '[]');

    // Eliminar imágenes del disco
    imagenes.forEach(nombre => {
      const ruta = path.join(__dirname, 'public/image', nombre);
      if (fs.existsSync(ruta)) {
        fs.unlinkSync(ruta);
      }
    });

    await pool.query('DELETE FROM autos WHERE id = ?', [id]);
    res.json({ mensaje: 'Auto eliminado con imágenes' });
  } catch (error) {
    console.error('Error al eliminar auto:', error);
    res.status(500).json({ error: 'Error interno al eliminar auto' });
  }
});


// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
