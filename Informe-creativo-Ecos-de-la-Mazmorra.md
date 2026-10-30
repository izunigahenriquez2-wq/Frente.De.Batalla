# Ecos de la Mazmorra — revisión 7

Actualización centrada en dificultad, combate, interfaz y pantalla negra al seleccionar 3D. El índice del portal conserva exactamente los bytes de la entrega anterior.

## Revisión del feedback

| Problema | Cambio implementado | Verificación y límite |
|---|---|---|
| El básico resuelve todo | Daño base del ataque gratuito reducido al 52% del anterior; técnicas ofensivas con coste de PM multiplicadas por 1,45. Los jefes reducen además los básicos fuera de sus ventanas vulnerables. | Prueba de daño básico frente a técnica; no demuestra por sí sola que todas las combinaciones estén equilibradas. |
| Las habilidades no se sienten importantes | Técnicas ofensivas provocan tambaleo al acumular cinco impactos válidos; una contribución por jugador cada 0,65 s como máximo. Ventana de tambaleo de 2,1 s. | Prueba de acumulación, vulnerabilidad y cancelación de la secuencia pendiente. Curaciones y utilidades conservan sus funciones. |
| Se sube demasiado rápido | Recompensa de XP reducida con amortiguación por piso; una recompensa nula ya no concede XP. | Simulación de 80 pisos con 35%, 60% y 100% de enemigos normales derrotados. |
| Enemigos de nivel bajo | Nivel generado ligado al piso y al jugador conectado más alto; normales alrededor de ese nivel o del mínimo del piso, con variación de especie. | Enemigos existentes no se recalculan continuamente durante el mismo piso; los siguientes se generan con el nivel actualizado. |
| Enemigos lentos | Mayor velocidad de persecución, proyectiles más rápidos y menor espera entre disparos. Corregida también la ruta alternativa de persecución que usaba una velocidad fija. | Velocidad base normal entre 115 y 185 px/s antes de estados y comportamiento. |
| Jefes monótonos | 19 perfiles con al menos tres patrones: cargas, abanicos, anillos con hueco, zonas retardadas, saltos y reposicionamientos. Tres fases según PS. | Simulados todos los perfiles. Son patrones RPG inspirados en lectura, esquiva y contraataque; no una reproducción de un Souls. |
| Jefe siempre +5 niveles | Nivel del jefe nunca inferior al del jugador conectado más alto +5. Se actualiza al ganar XP y durante el combate. No baja si sale el jugador de mayor nivel. | Pruebas con cuatro jugadores, aumento de nivel y conservación del porcentaje de PS al escalar. |
| HUD invasiva | Diez casillas pequeñas con iconos, teclas y recarga; sin panel exterior oscuro. Nombres y explicaciones quedan en las ayudas emergentes y el libro. Ficha del personaje reducida. | Revisión visual en navegador; reglas adaptables a pantallas estrechas. |
| Vista 3D negra | Ocultación explícita de canvas inactivos, orden de capas corregido y superficie de interfaz transparente. | La regla global `canvas{display:block}` podía imponerse al atributo `hidden` y mantener el lienzo Phaser tapando Three.js. Confirmado que ahora el lienzo inactivo tiene `display:none`. |

## Curva de campaña

Resultados de una simulación que derrota enemigos instantáneamente. No mide tiempo real, habilidad del jugador, muertes, gasto de pociones ni todas las oleadas de Blue. El CSV incluido permite revisar todos los puntos.

| Enemigos normales derrotados | Jugador al piso 10 | Jefe al piso 10 | Jugador al piso 80 | Jefe al piso 80 |
|---|---:|---:|---:|---:|
| 35% | 8 | 14 | 34 | 47 |
| 60% | 10 | 15 | 44 | 49 |
| 100% | 12 | 17 | 56 | 61 |

Explorar y combatir conserva valor: evitar gran parte de los encuentros aumenta la desventaja final. Los jefes mantienen un mínimo de cinco niveles de ventaja incluso si se limpia todo el mapa. La cifra de daño del CSV es la estadística del personaje, no el daño final del ataque básico.

## Lectura de los jefes

Los ataques tienen preparación visible antes de ejecutarse; las cargas fijan la dirección y los golpes de área fijan su objetivo para permitir esquivar. Al terminar hay una recuperación breve. Durante recuperación o tambaleo el jefe recibe un 40% más de daño. Fuera de esas ventanas los básicos reciben una reducción adicional del 28%. Las fases cambian al bajar del 65% y del 30% de PS, alterando presión, proyectiles y tiempos.

Se mantienen nombres de movimientos Pokémon y recursos gráficos existentes. Esta revisión no añade efectos generados ni reemplaza los sprites por ilustraciones inventadas.

## Maná y habilidades

Regeneración conservada en 0,9 PM/s en combate y 2,2 fuera, más un máximo de 1 PM/s por equipo. Recarga global de técnicas de 0,9 s; recuperación por objetos con recarga compartida de 8 s. El básico sigue siendo gratuito. Esto permite actuar sin PM, pero penaliza depender exclusivamente de ataques gratuitos.

## Pruebas realizadas

- 19 perfiles de jefe: patrones, preparación, recuperación, tres fases, nivel +5 y escalado sin curación porcentual accidental.
- Impacto de técnicas, tambaleo, velocidad de enemigos y ausencia de XP para recompensa cero.
- 80 pisos y 240 pisos adicionales con semillas fijas: escaleras y llaves alcanzables.
- Puertas y obstáculos funcionales, consumo de llave, coste alternativo de PM y cierre seguro.
- 1.606 combinaciones de forma jugable y clase con movimientos reales; 22 especializaciones.
- Suspensión y reanudación con mapa, niebla, enemigos, inventario y técnicas.
- Regeneración exacta y 55 simulaciones de recursos por especie/clase.
- Cuatro instancias de red simuladas: acciones, estado, desconexión y reconexión. No constituye prueba entre cuatro equipos por Internet.
- Escenas, geometría y cámaras Three.js en 16 biomas, cambio 2D y alternativa ante pérdida de contexto. Esta prueba no rasteriza mediante GPU.

## Límites que siguen abiertos

**El navegador de prueba no ofrece WebGL.** Se corrigió el conflicto de capas y se verificó la alternativa compatible visible, pero no puedo afirmar que el 3D acelerado haya sido probado visualmente en tu GPU. La vista compatible usa Canvas y no debe confundirse con 3D acelerado.

El equilibrio necesita partidas humanas completas, especialmente con cuatro jugadores y combinaciones de control/curación. Las pruebas automáticas detectan fallos de reglas y regresiones; no certifican diversión ni dificultad óptima. La conexión online real también depende de la conectividad WebRTC y la configuración de red existente.

La auditoría anterior se conserva en `respaldo/Informe-v6.1.md` como historial; sus cifras de balance han sido sustituidas por las de esta revisión.

## Instalación

Extrae todo el ZIP y publica el conjunto manteniendo sus rutas. No reemplaces únicamente `dungeon.html`: hay cambios de JS y CSS y un nuevo `combat-v7.js`. El portal `index.html` permanece intacto. Recarga con Ctrl+F5 después de publicar. Todos los participantes online deben usar esta versión: el protocolo pasa a 8 para impedir mezclar clientes incompatibles.

Se conserva el formato de suspensión anterior. Para valorar la curva nueva conviene iniciar una expedición nueva; una partida ya avanzada conserva el progreso que había acumulado.
