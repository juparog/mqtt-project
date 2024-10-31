# Simulación de un Dispositivo Serial en Linux

Esta guía te ayudará a configurar un puerto serial virtual en Linux, que podrás usar para pruebas y simulaciones sin necesidad de un dispositivo serial físico.

## Requisitos Previos

Asegúrate de tener instalado el paquete `socat`, que se utiliza para crear puertos seriales virtuales en Linux.

### Instalar `socat`

En la mayoría de las distribuciones basadas en Debian o Ubuntu, puedes instalar `socat` ejecutando:

```bash
sudo apt update
sudo apt install socat
```

### Crear Puertos Seriales Virtuales

Con socat, puedes crear dos puertos seriales virtuales conectados entre sí. Esto te permite enviar datos desde un puerto y recibirlos en el otro, simulando así una conexión serial entre dos dispositivos.

#### Paso 1: Crear la Conexión Serial Virtual

Ejecuta el siguiente comando para crear un par de puertos seriales virtuales conectados entre sí:

```bash
sudo socat -d -d PTY,link=/tmp/ttyV0,raw,echo=0 PTY,link=/tmp/ttyV1,raw,echo=0
```

##### Explicación de los Parámetros
- -d -d: Habilita la depuración para ver mensajes detallados de socat.
- PTY: Crea un dispositivo de terminal virtual.
- link=/tmp/ttyV0: Crea un enlace simbólico para /tmp/ttyV0 como un dispositivo de puerto serial.
- raw: Configura el puerto en modo "raw", necesario para la mayoría de las comunicaciones seriales.
- echo=0: Desactiva el eco de caracteres.

#### Paso 2: Verificar los Puertos Seriales Virtuales
Puedes abrir dos terminales diferentes para verificar la comunicación entre los dos puertos. En una terminal, ejecuta:

```bash
cat /tmp/ttyV1
```
En otra terminal, envía datos al puerto /tmp/ttyV0 con el siguiente comando:

```bash
echo "Mensaje de prueba" > /tmp/ttyV0
```

Deberías ver el mensaje "Mensaje de prueba" en la primera terminal, lo que confirma que la conexión serial virtual está funcionando.
