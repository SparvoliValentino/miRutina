# Mi Rutina

Prototipo frontend para organizar rutinas de gimnasio por día. Permite crear varias rutinas para un mismo día, elegir ejercicios de un catálogo de 66 opciones, registrar peso, repeticiones y una nota, y editar o eliminar rutinas.

## Ejecutar

Desde esta carpeta:

```sh
python3 -m http.server 4173
```

Abrí [http://localhost:4173](http://localhost:4173) en el navegador. No hay dependencias ni paso de compilación.

## Datos

Las rutinas se guardan en `localStorage` del navegador, asociadas al origen donde se abre la app. No hay cuentas ni sincronización entre dispositivos. La opción **Exportar copia** descarga un archivo JSON y **Importar copia** reemplaza las rutinas actuales con las de ese archivo.

## Imágenes

62 ejercicios usan ilustraciones con fondo blanco de [GymBells](https://gymbells.gellyfish.dev/), bajo licencia [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Se incluyen localmente para que funcionen sin conexión. Los cuatro ejercicios de cardio que faltan en ese catálogo usan ilustraciones SVG simples. Ver [licencia y fuentes](assets/exercises/LICENSE.txt). Este prototipo usa las imágenes solo con fines personales y no comerciales.

## Instalar en iPhone

Después de publicar la app en una URL HTTPS, abrila en Safari, tocá **Compartir** y luego **Agregar a pantalla de inicio**. La app tiene manifest, íconos para iOS y un service worker que guarda la interfaz y las imágenes para uso sin conexión. Las rutinas siguen guardadas en el almacenamiento local de ese navegador o instalación.

## Publicar con GitHub Pages

GitHub Pages sirve para esta app estática. Subí el contenido de esta carpeta a la raíz de un repositorio y, en **Settings → Pages**, elegí **Deploy from a branch**, la rama principal y la carpeta **/ (root)**. La URL del proyecto será `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/`. Los archivos usan rutas relativas para funcionar bajo ese subdirectorio.

La URL de Pages y `localhost` tienen almacenamientos locales distintos: exportá una copia desde la versión local e importala en la publicada si querés conservar las rutinas. Para uso personal, el sitio puede ser visible públicamente, pero los datos de las rutinas no se suben a GitHub Pages.
