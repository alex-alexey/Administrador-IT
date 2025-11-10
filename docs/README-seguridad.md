# Seguridad: Contraseñas y política

## Contraseñas con bcrypt
- Todas las contraseñas de usuarios se almacenan en la base de datos usando el algoritmo bcrypt, nunca en texto plano.
- En el registro y creación de usuarios, la contraseña se hashea antes de guardarse.
- En el login, la contraseña se compara usando bcrypt.compare.

## Política de contraseñas fuertes
- Las contraseñas deben tener al menos 8 caracteres.
- Deben incluir al menos una mayúscula, una minúscula, un número y un símbolo especial.
- El backend valida la fortaleza antes de aceptar el registro o cambio de contraseña.

## Implementación
- Se utiliza la librería `bcryptjs` para el hash y comparación.
- El modelo de usuario nunca expone la contraseña en las respuestas.
- El usuario admin creado por defecto también se almacena con hash bcrypt.

## Ejemplo de uso
```js
import bcrypt from 'bcryptjs';
const hash = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, user.password);
```

## Recomendaciones
- Cambia la contraseña del usuario admin tras el primer login.
- No compartas contraseñas por correo ni canales inseguros.
- Revisa periódicamente las contraseñas y fuerza el cambio si se detecta debilidad.
