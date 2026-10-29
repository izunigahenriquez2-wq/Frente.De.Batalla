# Ecos de la Mazmorra — revisión 6

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
- Una partida real con cuatro dispositivos/redes; reconexión, servidor TURN y migración de anfitrión no están implementados.
- Suspensión online y guardado sincronizado entre dispositivos.
- Pruebas humanas extensas de los 80 pisos y de las combinaciones de especie, clase y equipo. Los números de progresión están comprobados; la diversión y la dificultad necesitan sesiones de juego.
- Variaciones más profundas de arenas, acertijos ligados al bioma, música y accesibilidad completa de mando/móvil.

La siguiente prioridad debería ser una sesión de 20–30 minutos por arquetipo —daño, defensa, apoyo— registrando muerte, consumo de Éter, tiempo de jefe y porcentaje de exploración. Esos datos permitirán ajustar costes y duración con evidencia de juego real.

## Fuentes y trazabilidad

- [Phaser: alcance 2D del motor](https://phaser.io/why-phaser).
- [Three.js: cámara ortográfica](https://threejs.org/docs/pages/OrthographicCamera.html) y [sprites](https://threejs.org/docs/pages/Sprite.html).
- [Babylon.js: especificaciones](https://www.babylonjs.com/specifications/).
- [Sprites de Pokémon y Blanco/Negro](https://github.com/PokeAPI/sprites).
- [Datos de movimientos y aprendizaje](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv).
- [PMDCollab: efectos, objetos y recursos](https://github.com/PMDCollab/RawAsset).

CREDITOS.txt conserva la procedencia anterior y añade los recursos de esta revisión. Los derechos de los gráficos Pokémon corresponden a sus titulares; este es un proyecto fan no oficial.
