# Ecos de la Mazmorra — revisión 6.1

## Auditoría de tu último mensaje, punto por punto

**Resultado: la petición no está cerrada al 100%.** Esta revisión corrige fallos reales y amplía las pruebas. Las funciones listadas como implementadas existen en el código y tienen comprobaciones; los límites de 3D acelerado, conectividad online y equilibrio jugado siguen explícitos.

| Petición | Estado después de la revisión | Evidencia y alcance |
|---|---|---|
| 1. Puertas y atajos interactivos | Implementado y probado | Cambian la colisión; llaves de un uso; cierre seguro; atajos con técnica, clase o gasto de PM. Las escaleras siguen siendo alcanzables. |
| 1. Suspensión de partida | Implementado para solitario/local | Conserva piso, niebla, enemigos, recursos, técnicas y estados. No suspende salas online ni sincroniza entre dispositivos. |
| 1. Equilibrio de campaña | Ajustado; validación parcial | Curva de EXP de 80 pisos y 55 ensayos de recursos. No se ha medido una campaña humana completa ni tasas de victoria. |
| 2. Analizar un motor superior | Análisis realizado e integración aplicada | Three.js para la presentación 3D; Phaser y la simulación RPG se conservan. No se ha sustituido todo el motor ni se afirma que una biblioteca sea universalmente superior. |
| 3. Gráficos 3D modernos con sprites Pokémon | Implementación parcial de la meta visual | Escenarios con geometría, cámara ortográfica, luces y sprites. Matemáticas y geometría comprobadas en 16 biomas. Falta validar el dibujo acelerado y el rendimiento en hardware WebGL. La alternativa Canvas es una vista inclinada, no 3D acelerado. |
| 3. Sprites de Blanco y Negro | Implementado con alcance definido | Animaciones B/W en selector y libro. Caminata, reposo y combate de mazmorra conservan Mundo Misterioso. No hay modelos Pokémon nuevos ni imágenes generadas con IA. |
| 4. Puertas, llaves y obstáculos con varias soluciones, no en todos los pisos | Implementado y probado | Aparecen en parte de los pisos normales; no son decoración sin función. Invitados online reciben la elección de solución, no una resolución automática distinta a la del anfitrión. |
| 5. Encuentros y patrones de familias | Implementado; balance parcial | Sanadores, controladores, cargadores, protectores, bombarderos y evasivos; combinaciones según bioma. Las cargas avisan y mantienen orientación/animación. No cada especie tiene una IA completamente exclusiva. |
| Especie y clase con identidad propia | Implementado; profundidad compartida | 146 formas jugables × 11 clases con movimientos asignados. Bulbasaur Soporte: Síntesis; Squirtle Soporte: Acua Aro. Hay efectos compartidos y concesiones RPG identificadas; no 1.606 mecánicas únicas. |
| Ataques Pokémon, sin nombres inventados | Implementado para nombres; matiz sobre MT | Las habilidades activas usan nombres Pokémon. El catálogo de 78 MT usa movimientos aprendibles por máquina y compatibilidad de varias generaciones. No todos los movimientos de especie o clase son literalmente una MT canónica; se mantienen también los movimientos solicitados y las concesiones de clase. |
| Iconos de ataques más claros | Mejorado y comprobado | Iconos originales por movimiento/función; Impactrueno, Onda Trueno y Rayo se distinguen. 588 definiciones de habilidades resuelven a iconos incluidos. Algunas comparten recurso; no se inventan ilustraciones para aparentar variedad. |
| Interfaz RPG/MMO de hasta diez habilidades | Implementado y probado | Básico + dos de especie + clase + seis configurables. Libro, costes visibles, recargas, ayudas y selección de jugador local. Diez espacios no significa diez habilidades gratuitas. |
| Objetos y MT que conceden habilidades | Implementado y probado | Aprender consume una MT compatible; equipo concede acceso mientras esté equipado. Evolucionar conserva el aprendizaje de la expedición. |
| Potencia/rareza y MT fuertes en pisos altos | Implementado y probado | Danza Espada desde 18, Terremoto desde 35, Hiperrayo desde 55; sorteos limitados por piso y compatibilidad. Se verifica que no aparezcan antes del umbral. |
| Maná valioso sin escasez extrema ni spam | Implementado y ajustado; sensación pendiente de juego | Regeneración 0,9/2,2 PM/s, recargas individuales y global, Éter con recarga, básico gratuito. 55 combinaciones inicial/clase se sometieron a uso sostenido. Falta medir consumo y dificultad con personas. |

## Qué se corrigió específicamente en 6.1

- **Tierra Oculta:** un atlas sin variantes decorativas provocaba un acceso a una celda inexistente. Las vistas Three.js, Phaser y Canvas ahora recurren a su suelo base.
- **Cambio de piso online:** se rechazan mensajes antiguos o de otro piso antes de modificar puertas, trampas, eventos o efectos auxiliares.
- **Pausa y estado del actor:** las acciones de invitados no pueden gastar objetos ni alterar preparación durante la pausa del anfitrión; se rechazan acciones de actores desconectados, caídos o evolucionando.
- **Obstáculos online:** el anfitrión envía al invitado la elección de método. Se valida distancia, método, clase y PM al resolverla.
- **Reconexión de invitado:** botón para volver al mismo personaje, sin duplicar miembros ni reemplazar inventario. Funciona mientras el anfitrión conserva la expedición y la pestaña del invitado conserva su sesión. No sobrevive a una recarga/cierre de esa pestaña, no migra al anfitrión y no es suspensión online.
- **Animación:** interpolación de posiciones para actores y proyectiles en las vistas inclinadas; las cargas orientan al enemigo hacia su recorrido.
- **Robustez gráfica:** líneas de efecto de longitud cero no generan posiciones inválidas. La pérdida del contexto WebGL oculta la superficie fallida y permite la vista compatible.
- **Recargas:** el Estuche MT y la especialización Acelerador modifican también las recargas compartidas, evitando que la interfaz prometa un reinicio que el combate rechace.
- **Libro y maná:** coste/recarga visibles en las tarjetas; regeneración mostrada incluye equipo; el estado de combate viaja a los invitados. Las descripciones de Refugio, recuperación y Descanso coinciden con el efecto aplicado.

### MT que ahora hacen cosas distintas

| Movimiento | Efecto RPG aplicado |
|---|---|
| Danza Espada | Daño físico +50% durante 8 s. |
| Corpulencia | Daño físico +25% y daño recibido −20% durante 8 s. |
| Paz Mental | Daño especial +30% y daño recibido −20% durante 8 s. |
| Danza Dragón | Daño físico +25% y velocidad +25% durante 6 s. |
| Maquinación | Daño especial +50% durante 8 s. |
| Tambor | Consume 50% de PS máximos; daño físico +80% durante 8 s. Requiere más de la mitad de PS y no gasta PM si ese requisito falla. |

Las categorías física/especial proceden de los datos de movimientos. Los porcentajes, duración y coste de PM son adaptaciones de combate en tiempo real de este juego, no reglas oficiales de Pokémon.

### Qué demuestran las pruebas nuevas

- `verify-online-integration.cjs`: cuatro instancias del juego con transporte determinista; habilidades, inventario, pausa, mensajes antiguos, reconexión, cambio de piso y conservación del personaje. **No es una prueba WebRTC real.**
- `verify-render3d.cjs`: Three.js real para escena, geometría, materiales y cámara en 16 biomas; el dispositivo de dibujo GPU se sustituye por un doble de prueba. Detectó el fallo de Tierra Oculta. **No comprueba píxeles renderizados en GPU ni FPS reales.**
- `verify-techniques-balance.cjs`: regeneración exacta en combate/descanso, básico sin PM, seis mejoras diferenciadas y su caducidad, requisito de Tambor, reinicio de recargas, antispam y 55 ensayos de recursos.
- Se mantuvieron las comprobaciones de generación de 80 + 240 pisos, evoluciones, jefes, Blue, tienda de bases y suspensión. El portal `index.html` se conserva idéntico.

### Prueba real de red y bloqueo encontrado

En el navegador se pudo crear una sala mediante el servicio real. Un segundo participante no llegó a establecer el canal de datos, ni tras un reintento. Por tanto, **no se valida una partida real de dos o cuatro clientes**. No hay evidencia suficiente para atribuir el fallo a una causa concreta de la red.

`net-config.js` permite al responsable del alojamiento configurar PeerServer e ICE/TURN; viene vacío y usa los valores existentes de PeerJS. No se ha aprovisionado ni probado un servidor TURN propio. No se incluyen credenciales inventadas o permanentes. Si se añade TURN, las credenciales expuestas al navegador deben ser temporales.

La revisión visual final no pudo repetirse después de las últimas correcciones: al reabrir la vista previa, el navegador bloqueó la observación por su política de acceso. Se conserva la comprobación previa de menú 6.1 y selector de Squirtle Soporte; no se presenta como validación visual completa de todos los últimos cambios.

### Lo que falta para considerar cerrada la petición

1. Validación visual y de rendimiento del 3D acelerado en hardware con WebGL: escenas de costa, bosque, cueva y arenas con muchos efectos, además de pérdida/recuperación del contexto.
2. Una expedición real entre cuatro dispositivos y redes distintas, con conexión, desconexión y regreso. La reconexión de lógica ya tiene prueba, pero el canal real sigue sin validar en este entorno.
3. Pruebas humanas de combate, jefes y consumo de recursos. La progresión matemática y los límites de recursos no garantizan por sí solos una campaña divertida y equilibrada.
4. Si se exige suspensión también online, hay que añadir un guardado de sesión compartida y su restauración de sala. No está incluido ni se presenta como terminado.

No se necesita reemplazar de nuevo todo el motor para corregir estos puntos. La prioridad es validar el renderizado y la conexión reales y ajustar con resultados de partidas. Los objetivos adicionales de música, móvil/mando y acertijos más complejos quedan fuera de lo que esta revisión declara terminado.

---

La revisión añade puertas y atajos funcionales, suspensión local, movimientos Pokémon para las clases, aprendizaje de MT, equipo que concede técnicas y una barra de diez espacios. La progresión conserva los 80 pisos, los cinco iniciales gratuitos, el reclutamiento exclusivo de formas base y las evoluciones a nivel 16/36 o 26.

## 1. Exploración y obstáculos

Las puertas ocupan toda la sección de un pasillo: cerradas bloquean movimiento y proyectiles; abiertas permiten cruzar. Una puerta bloqueada consume una llave al abrirse por primera vez y después puede operarse sin otra llave. No se permite cerrarla sobre un personaje o enemigo. Las llaves se encuentran en cofres y se pueden entregar como otros objetos.

El generador coloca puertas en determinados pisos normales, no en todos. Antes de aceptarlas comprueba mediante recorrido del mapa que siguen siendo alcanzables las escaleras y las llaves ya colocadas. Los jefes conservan arenas despejadas. No se exige derrotar a todos los enemigos para ascender por una escalera normal.

Los atajos de vegetación o escombros abren una celda antes bloqueada y conectan rutas. Se descartan candidatos cuyos extremos ya estén conectados por un recorrido de ocho pasos o menos. Las opciones son:

- Corte o Golpe Roca, si se dispone del movimiento, con su coste de PM.
- Especialidad de Luchador, Guardián, Ingeniero o Explorador: 10 PM.
- Despejar mediante esfuerzo: 22 PM, disponible para cualquier combinación.

No hace falta llevar una especie obligatoria para completar el mapa. Las puertas y los atajos abiertos forman parte del guardado y de los mensajes de estado online.

## 2. Suspender y continuar

Desde **Pausa → Suspender y guardar**, el juego espera a que terminen acciones y ataques diferidos pendientes, guarda la expedición y vuelve al menú. **Continuar expedición** restaura el piso completo: mapa, niebla, puertas, enemigos —también los alejados de la cámara—, cofres abiertos, botín, mochila, equipo, experiencia, evoluciones, movimientos aprendidos, preparación, PM, recargas, proyectiles y efectos persistentes.

El guardado incluye el identificador de expedición para conservar el control de Poké ya acreditados. Perder o abandonar esa expedición elimina su suspensión. Hay un espacio de suspensión por navegador y dominio; una suspensión posterior lo reemplaza. Los reclutas y Poké permanentes siguen separados.

**Alcance:** solitario y cooperativo local. No guarda una sala online ni sincroniza archivos entre dispositivos. Borrar los datos del navegador elimina los guardados. No hay guardado automático continuo; hay que usar Suspender antes de cerrar.

## 3. Motor y presentación

La simulación RPG y la presentación ya estaban separadas. Aproveché esa arquitectura para incorporar un renderizador de escenario con **Three.js**, manteniendo el combate y la generación actuales. Es una ampliación del sistema visual, no una afirmación de que se haya reemplazado cada subsistema por un motor nuevo.

| Alternativa | Ventaja para este proyecto | Decisión |
|---|---|---|
| Phaser, ya integrado | Mantiene la vista cenital y la compatibilidad existente | Se conserva como alternativa 2D |
| Three.js | Cámara ortográfica, geometría de suelo/paredes, iluminación y sprites orientados hacia la cámara | Ruta de renderizado 3D incorporada |
| Babylon.js | Motor 3D con herramientas amplias y soporte de sprites | No se añadió otra dependencia completa para resolver la misma capa visual |

El escenario 3D usa texturas Pokémon del conjunto existente sobre geometría con altura. Los personajes y efectos siguen siendo sprites. La cámara inclinada conserva el control en ocho direcciones; no hay modelos Pokémon inventados, ilustraciones de ataques nuevas ni recursos generados con IA.

Se añaden las animaciones de combate originales de **Blanco y Negro** para el selector y el libro de técnicas. Para caminar y atacar en la mazmorra se mantienen las hojas de Mundo Misterioso, porque aportan direcciones y estados que un sprite frontal de combate no contiene.

**Límite de verificación importante:** el navegador disponible para las pruebas tiene WebGL desactivado. Por eso se ha probado visualmente una proyección inclinada compatible en Canvas, junto con la interfaz y el guardado. Esta ruta compatible no equivale a renderizado 3D acelerado. La ruta Three.js está implementada, pero aún requiere una revisión visual y de rendimiento en hardware con WebGL antes de considerarla plenamente validada. Ajustes permite volver a la vista cenital.

La versión empaqueta Three.js 0.160.1 y Phaser 4.2.1; no se presenta Three.js como el último lanzamiento. Para este cambio se priorizó una integración local reproducible, sin descargar el motor desde una CDN al abrir el juego.

## 4. Identidad de especie y clase

La técnica R se selecciona a partir de movimientos Pokémon y del conjunto de la especie. Se incluyen definiciones para las 146 formas jugables y las 11 clases: **1.606 combinaciones**. Esto no significa 1.606 efectos completamente distintos: varias especies comparten movimientos, como en Pokémon. El conjunto cuenta con 135 definiciones de técnicas y efectos de tiempo real.

Ejemplos:

| Combinación | Técnica | Comportamiento |
|---|---|---|
| Bulbasaur Soporte | Síntesis | Recuperación inmediata, compartida con aliados próximos |
| Squirtle Soporte | Acua Aro | Recuperación gradual durante ocho segundos |
| Pikachu Luchador | Fuerza | Ataque físico frontal |
| Pikachu Alquimista | Tóxico | Veneno periódico |

Los nombres inventados de habilidades de clase dejan de aparecer en la interfaz activa. Las especializaciones siguen siendo nombres de clase, pero modifican movimientos Pokémon. Sus descripciones ahora explican el beneficio concreto: duración de protección, movilidad, curación, control, recarga o sustitutos.

Cuando una especie no dispone de una técnica adecuada en los datos, la clase puede conceder un movimiento real como adaptación RPG. La ficha y **TECNICAS-CLASE.csv** identifican esos casos. No se afirma que cada concesión corresponda al aprendizaje canónico de esa especie. La compatibilidad de las MT sí se comprueba contra los datos de aprendizaje por máquina, combinando generaciones.

Los efectos están adaptados a tiempo real: PM, recargas, zonas y cooperación son reglas de este juego. Por ejemplo, Transformación copia una acción; no reproduce una transformación completa del sprite y estadísticas del objetivo.

## 5. Barra RPG y aprendizaje

La barra contiene diez espacios:

1. Ataque básico gratuito.
2. Primer movimiento de especie, también en Q.
3. Segundo movimiento de especie, también en E; desbloqueo al nivel 8.
4. Técnica de clase, también en R.
5. Seis espacios configurables para técnicas aprendidas o concedidas por equipo.

El **libro de técnicas, K**, muestra nombres, efectos, potencia, PM, recarga y procedencia. Los espacios extra comienzan vacíos. No se entregan diez habilidades gratuitas; se desarrollan durante la expedición. Puedes cambiar la preparación fuera de combate.

Hay **78 movimientos en el catálogo de MT**. Una MT compatible se usa desde la mochila, se consume, enseña el movimiento para esa partida y ocupa automáticamente un espacio libre si existe. Una MT incompatible no se consume y puede entregarse a otro jugador. Evolucionar conserva los movimientos ya aprendidos. Llevar el mismo movimiento en varios espacios no permite saltarse su recarga.

Objetos como Imán, Piedra Dura, Campana Concha, Garra Rápida, Cinta Focus y Campana Alivio conceden acceso a técnicas mientras están equipados. Se mantienen las tres ranuras de equipo y las restricciones por clase.

Los iconos se extraen de efectos originales. Impactrueno, Onda Trueno y Rayo tienen iconos distintos. Algunas técnicas de función similar comparten recurso; no se afirma que existan 135 ilustraciones originales independientes para cada movimiento.

En online cada persona controla su barra. En cooperativo local un selector permite elegir qué jugador usa los botones de la barra y el libro; los movimientos básicos de los demás jugadores mantienen sus controles directos.

## 6. Rareza, botín y maná

Los cofres que contienen MT sustituyen parte del presupuesto de consumibles; no crean una fuente ilimitada de botín. En pisos alternos se selecciona una MT que al menos una especie del equipo pueda aprender. Los primeros pisos concentran técnicas de menor potencia o utilidad. El catálogo diferencia técnicas de estado relevantes aunque su potencia numérica sea cero.

| Ejemplo | Primer piso posible | PM | Recarga |
|---|---:|---:|---:|
| Protección | 8 | 22 | 14 s |
| Corpulencia | 12 | 22 | 13 s |
| Danza Espada | 18 | 27 | 16 s |
| Tóxico | 18 | 24 | 12 s |
| Danza Dragón | 28 | 30 | 16 s |
| Terremoto | 35 | 38 | 13 s |
| Hiperrayo | 55 | 48 | 20 s |

La disponibilidad depende también de la compatibilidad y del sorteo; el primer piso es un umbral, no una recompensa garantizada. **CATALOGO-MT.csv** contiene todos los valores.

La regeneración base baja a **0,9 PM/s en combate** y **2,2 fuera de combate**, con un máximo de 1 PM/s adicional por equipo. Las habilidades comparten una pausa global de 0,9 s y conservan sus propias recargas. Éter y otras recuperaciones de PM comparten ocho segundos de recarga. El básico permanece gratuito.

Esto permite mantener ataques básicos mientras se reserva maná para control, curación o daño potente. Un cofre de consumible por piso normal contiene Éter, y la exploración sigue ofreciendo manantiales y tiendas limitadas. La reserva no se rellena por completo al ascender.

## 7. Encuentros y campaña

Además del comportamiento base se añaden funciones por familia: sanadores —incluyendo Staryu/Starmie—, controladores vegetales, cargadores, protectores rocosos, bombarderos y Pokémon que se reposicionan. Los controladores dejan zonas anunciadas que ralentizan; las cargas fijan dirección antes de avanzar; los protectores reducen temporalmente el daño recibido por aliados próximos. Algunos pisos reúnen miembros con funciones complementarias.

La curva anterior acumulaba demasiada experiencia: eliminar el 60% de los enemigos alcanzaba el nivel 60 alrededor del piso 40. La curva nueva reduce progresivamente la recompensa de EXP a lo largo de la campaña.

La simulación de progresión, que calcula recompensas pero **no juega combates**, obtiene aproximadamente:

| Piso | Nivel con 35% de enemigos derrotados | Nivel con 60% | Nivel del jefe |
|---:|---:|---:|---:|
| 10 | 11 | 13 | 14 |
| 20 | 17 | 21 | 21 |
| 40 | 28 | 35 | 36 |
| 60 | 40 | 50 | 50 |
| 80 | 51 | 60 | 65 |

La ruta de 60% se mantiene dentro de cinco niveles respecto de los jefes; explorar todo permite adelantarse. Los eventos, talentos, equipo y evolución cambian la dificultad real. **BALANCE-CAMPANA.csv** permite revisar los tres escenarios de exploración. No equivale a una tasa de victoria medida ni a una garantía de equilibrio perfecto para todas las clases.

## 8. Comprobaciones y límites restantes

Comprobado mediante pruebas automatizadas: rutas de escaleras y llaves, colisión de puertas, consumo único de llave, cierre seguro, soluciones de obstáculos, umbrales de MT, compatibilidad, PM, recargas compartidas, preparación de diez espacios, concesiones de equipo, suspensión completa y extensión de los mensajes online. También se conservan las comprobaciones anteriores de jefes, Blue, evoluciones y reclutamiento de bases.

Pruebas adicionales: 240 pisos generados con tres semillas fijas; ejecución de las 22 especializaciones; reparto de acciones locales y prevención del conflicto entre la poción de P1 y la interacción de P2. El protocolo de red se prueba con cuatro participantes simulados.

Comprobado en navegador: inicio, selector, barra, libro, suspensión, recarga de página y continuación. Se conserva exactamente el index.html anterior.

Todavía requieren validación o trabajo posterior:

- Renderizado 3D acelerado en un equipo con WebGL, incluyendo consumo de memoria y dispositivos móviles.
- Una partida real con cuatro dispositivos/redes; la reconexión del invitado está implementada y probada con transporte simulado; un TURN propio y la migración de anfitrión no están implementados.
- Suspensión online y guardado sincronizado entre dispositivos.
- Pruebas humanas extensas de los 80 pisos y de las combinaciones de especie, clase y equipo. Los números de progresión están comprobados; la diversión y la dificultad necesitan sesiones de juego.
- Variaciones más profundas de arenas, acertijos ligados al bioma, música y accesibilidad completa de mando/móvil.

La siguiente prioridad debería ser una sesión de 20–30 minutos por arquetipo —daño, defensa, apoyo— registrando muerte, consumo de Éter, tiempo de jefe y porcentaje de exploración. Esos datos permitirán ajustar costes y duración con evidencia de juego real.

## Fuentes y trazabilidad

- [PeerJS: conexión, reconexión y opciones ICE](https://peerjs.com/client/api/peer).
- [Phaser: alcance 2D del motor](https://phaser.io/why-phaser).
- [Three.js: cámara ortográfica](https://threejs.org/docs/pages/OrthographicCamera.html) y [sprites](https://threejs.org/docs/pages/Sprite.html).
- [Babylon.js: especificaciones](https://www.babylonjs.com/specifications/).
- [Sprites de Pokémon y Blanco/Negro](https://github.com/PokeAPI/sprites).
- [Datos de movimientos y aprendizaje](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv).
- [PMDCollab: efectos, objetos y recursos](https://github.com/PMDCollab/RawAsset).

CREDITOS.txt conserva la procedencia anterior y añade los recursos de esta revisión. Los derechos de los gráficos Pokémon corresponden a sus titulares; este es un proyecto fan no oficial.
