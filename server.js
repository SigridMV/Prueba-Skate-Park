// Importar el módulo dotenv para cargar variables de entorno desde un archivo .env
require('dotenv').config();
// Importar express para la creación del servidor web
const express = require("express");
// Importar expressFileUpload para manejar la carga de archivos
const expressFileUpload = require('express-fileupload');
// Importar el módulo jwt para la autenticación de usuarios mediante tokens JWT
const jwt = require('jsonwebtoken');
// Importar el motor de plantillas Handlebars para renderizar vistas HTML
const { engine } = require('express-handlebars');
// Importar funciones de consultas desde el controlador
const { getUsuarios, updateStatusUsuario, insertUsuario, updateUsuario, deleteUsuario, verUsuario } = require('./controller/consultas');
// Importar el módulo path para manipulación de rutas de archivo
const path = require('path')
// Definir las extensiones permitidas para la carga de archivos
const permitFile = ['.gif', '.png', '.jpg', '.jpeg'];

// Crear instancia de express
const app = express();
// Definir el puerto en el que se ejecutará el servidor
const PORT = process.env.PORT;
const secreto = process.env.JWT;


// Configurar el análisis de datos de formularios y JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configurar el servidor para servir archivos estáticos
app.use(express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/axios', express.static(__dirname + '/node_modules/axios/dist'));

// Propiedades de configuración para express-fileupload
const efu_properties = {
    limits: { fileSize: 5000000 }, // Límite de tamaño de archivo
    abortOnLimit: true,  // Abortar la carga si se supera el límit
    responseOnLimit: "El peso del archivo que intentas subir supera el limite permitido", // Respuesta en caso de superar el límite
};
app.use(expressFileUpload(efu_properties));


// Configurar el motor de plantillas Handlebars
app.engine('hbs',
    engine({
        defaultLayout: 'main',
        layoutsDir: __dirname + '/views/mainLayout', // Directorio de diseños
        extname: '.hbs', // Extensión de archivo de plantilla
        helpers: {
            fixInde: function (valor) {
                return parseInt(valor) + 1;
            }
        }
    })
);

app.set('view engine', 'hbs');
app.set('views', './views/layouts');

// Definicion de las rutas

// Ruta principal para mostrar la página de inicio
app.get('/', (req, res) => {
    res.render('index');
});

// Ruta para mostrar el formulario de registro
app.get('/registro', (req, res) => {
    res.render('Registro');
});

// Ruta para mostrar el formulario de inicio de sesión
app.get('/login', (req, res) => {
    res.render('Login');
});

// Ruta para listar usuarios en el panel de administración
app.get('/admin', async (req, res) => {
    try {
        const usuarios = await getUsuarios();
        console.log(usuarios);
        res.render('Admin', { usuarios });
    } catch (error) {
        res.status(500).send({
            error: `Error en conseguir lista de users en admin... ${error}`,
            code: 500
        })
    }
});

// Ruta para obtener la lista de usuarios
app.get('/usuarios', async (req, res) => {
    const respuesta = await getUsuarios();
    res.status(200).send(respuesta);
});

// Ruta para modificar el estado de un usuario
app.put('/usuarios', async (req, res) => {
    const { id, estado } = req.body
    try {
        const usuarios = await updateStatusUsuario(id, estado);
        res.status(200).send(JSON.stringify(usuarios));
    } catch (error) {
        res.status(500).send(`Error en edicion de usuarios...${error}`);
    }
});

// Ruta para registrar un nuevo usuario
app.post('/registrar', async (req, res) => {
    try {
        // Capturar datos del formulario de registro y del archivo de imagen
        const { email, nombre, password, password2, experiencia, especialidad } = req.body;

        // Validar que las contraseñas coincidan
        if (password !== password2) {
            return res.status(401).send('<script>alert("Las contraseñas no coinciden."); window.location.href = "/registro"; </script>');
        }

        // Verificar si se han enviado archivos
        if (!req.files || !req.files.foto) {
            return res.status(400).send('No se han enviado imágenes.');
        }

        const foto = req.files.foto;
        const { name } = foto;
        const extension = path.extname(name);

        // Verificar el formato de la imagen
        if (!permitFile.includes(extension)) {
            return res.status(403).send('Formato inválido.');
        }

        // Insertar usuario en la base de datos
        await insertUsuario(email, nombre, password, experiencia, especialidad, name);

        // Mover la imagen al directorio de carga
        foto.mv(`${__dirname}/public/uploads/${name}`, (err) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.status(200).send('<script>alert("Se ha registrado con éxito."); window.location.href = "/"; </script>');
        });
    } catch (error) {
        res.status(500).send({
            error: `Algo salió mal... ${error}`,
            code: 500
        });
    }
});


// Ruta para autenticar un usuario en el formulario de inicio de sesión
app.post('/autenticar', async (req, res) => {
    // Obtener datos de inicio de sesión del formulario
    const { email, password } = req.body;

    // Verificar si se llenaron ambos campos
    if (!email || !password) {
        return res.status(401).send('<script>alert("Debe llenar ambos campos."); window.location.href = "/login"; </script>');
    }

    // Verificar si el usuario existe y la contraseña es correcta
    const user = await verUsuario(email, password);
    if (!user) {
        return res.status(404).send('<script>alert("Usuario no existe o la contraseña está incorrecta."); window.location.href = "/login"; </script>');
    }

    if (!user.estado) {
        return res.status(401).send(`<script>alert("Usuario en estado revisión."); window.location.href = "/login";</script>`);
    }

    // Generar token JWT y redirigir a la página de datos
    const token = jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + 180,
            data: user,
        },
        secreto
    );
    res.redirect(`/Datos?token=${token}`);
});

// Ruta para mostrar los datos de un usuario autenticado
app.get('/datos', (req, res) => {
    const { token } = req.query;

    // Verificar el token JWT y renderizar la vista de datos
    jwt.verify(token, secreto, (err, skaters) => {
        if (err) {
            return res.status(401).json({
                error: "401 Unauthorized",
                message: err.message,
            });
        }
        const { data } = skaters;
        console.log('DATOS SKATER', skaters);
        res.render('Datos', { token, data });
    });
});


// Ruta para obtener los datos de todos los usuarios
app.get('/datos_usuario', async (req, res) => {
    const respuesta = await getUsuarios();
    res.send(respuesta);
});


app.post('/actualizar', async (req, res) => {
    const { email, nombre, password, password2, experiencia, especialidad } = req.body;

    // Verificar que las contraseñas coincidan
    if (password !== password2) {
        return res.status(401).send('<script>alert("Las contraseñas no coinciden."); window.location.href = "/Login"; </script>');
    }

    try {
        // Actualizar los datos del usuario en la base de datos
        const usuarioActualizado = await updateUsuario(email, nombre, password, experiencia, especialidad);
        if (usuarioActualizado) {
            res.send('<script>alert("Datos actualizados con éxito."); window.location.href = "/"; </script>');
        } else {
            res.status(404).send('<script>alert("Usuario no encontrado."); window.location.href = "/"; </script>');
        }
    } catch (error) {
        res.status(500).send(`Error en actualización de datos... ${error.message}`);
    }
});

// Ruta para eliminar un usuario
app.post('/eliminar', async (req, res) => {
    try {
        const { id } = req.query;
        // Eliminar el usuario de la base de datos
        await deleteUsuario(id);
        res.send('<script>alert("Cuenta eliminada con éxito."); window.location.href = "/"; </script>');
    } catch (error) {
        res.status(500).send(`Error en borrar usuario... ${error}`);
    }
});

// Iniciar el servidor en el puerto
app.listen(PORT, () => console.log(`Servidor inicializado en el puerto ${PORT}`));
