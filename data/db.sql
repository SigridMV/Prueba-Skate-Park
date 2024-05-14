-- Crear la base de datos llamada skatepark
CREATE DATABASE skatepark;

-- Crear la tabla skaters para almacenar la información de los skaters
CREATE TABLE
    skaters (
        id SERIAL PRIMARY KEY, -- Columna para el ID del skater, autoincremental y clave primaria
        email VARCHAR(255) NOT NULL, -- Correo electrónico del skater, no puede ser nulo
        nombre VARCHAR(50) NOT NULL, -- Nombre del skater, no puede ser nulo
        password VARCHAR(255) NOT NULL, -- Contraseña del skater, no puede ser nula
        anos_experiencia INT NOT NULL, -- Años de experiencia del skater, no puede ser nulo
        especialidad VARCHAR(100) NOT NULL, -- Especialidad del skater, no puede ser nulo
        foto VARCHAR(255) NOT NULL, -- Ruta de la foto del skater, no puede ser nulo
        estado BOOLEAN NOT NULL DEFAULT true -- Estado del skater (activo/inactivo), valor predeterminado activo
    );

-- Insertar un registro en la tabla skater con los datos de Tony Hawk
INSERT INTO
    skaters (
        email,
        nombre,
        password,
        anos_experiencia,
        especialidad,
        foto,
        estado
    )
VALUES
    (
        'tonyhawk@skate.com',
        'Tony Hawk',
        'hashed_password',
        12,
        'Kickflip',
        'tony.jpg',
        true -- Tony Hawk inicialmente activo
    );

-- Insertar otro registro en la tabla skater con los datos de Evelien Bouilliart
INSERT INTO
    skaters (
        email,
        nombre,
        password,
        anos_experiencia,
        especialidad,
        foto,
        estado
    )
VALUES
    (
        'b@b.com',
        'Evelien Bouilliart',
        'hashed_password',
        10,
        'Heelflip',
        'Evelien.jpg',
        true -- Evelien Bouilliart inicialmente activo
    );