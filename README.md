# ProyectoConsultorio

Sistema web desarrollado para la gestión integral de un consultorio de psicología. La aplicación permite administrar pacientes, gestionar citas médicas, generar facturas y almacenar Historias Clínicas Electrónicas (HCE) de forma digital, organizada y segura.


## Características Principales

- Registro y administración de pacientes
- Gestión de citas psicológicas
- Generación de facturas
- Manejo de Historias Clínicas Electrónicas (HCE)
- Sistema de autenticación de usuarios
- Interfaz moderna y responsiva
- Comunicación entre frontend y backend mediante API REST


## Tecnologías Utilizadas

### Backend
- Python
- Django
- Django REST Framework

### Frontend
- JavaScript
- React.js
- Tailwind CSS

### Base de Datos
- MySQL Server


## Arquitectura del Proyecto

El sistema está dividido en dos partes principales:

### Frontend
Aplicación desarrollada con React.js encargada de la interfaz gráfica y experiencia del usuario.

### Backend
API REST desarrollada con Django encargada de:
- autenticación,
- lógica del sistema,
- gestión de pacientes,
- citas,
- facturación,
- HCE,
- conexión con la base de datos.


## Funcionalidades del Sistema

- Registro de nuevos pacientes
- Consulta y edición de información
- Agenda de citas
- Facturación digital
- Gestión clínica digital
- Dashboard administrativo
- Formularios dinámicos
- Validaciones de datos


## Instalación del Proyecto

### Clonar el repositorio

```bash
git clone https://github.com/Kxvin05/ProyectoConsultorio.git
```


### Backend - Django

Entrar a la carpeta del backend:

```bash
cd backend
```

Crear entorno virtual:

```bash
python -m venv env
```

Activar entorno virtual:

#### Windows
```bash
.\env\Scripts\activate.ps1
```

Instalar dependencias:

```bash
pip install -r requirements.txt
```

Ejecutar servidor:

```bash
python manage.py runserver
```

---

### Frontend - React

Entrar a la carpeta del frontend:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar proyecto:

```bash
npm run dev
```


## Base de Datos

El proyecto utiliza MySQL Server como motor de base de datos.

Configurar las credenciales en el archivo:

```bash
settings.py
```


## Estado del Proyecto

Proyecto funcional  
CRUD de pacientes  
CRUD de citas  
Facturación  
HCE  
Frontend conectado con API REST  


## Autor

Desarrollado por Kevin Paya

GitHub:
https://github.com/Kxvin05

Repositorio del proyecto:
https://github.com/Kxvin05/ProyectoConsultorio
