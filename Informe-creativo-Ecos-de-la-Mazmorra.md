# Ecos de la Mazmorra — revisión 8

Actualización 2D del juego existente. El index.html del portal conserva exactamente los bytes del ZIP anterior; no se altera su diseño ni el de los demás juegos.

## Cambios entregados

| Petición | Implementación y alcance |
|---|---|
| Abandonar 3D | La entrada del juego ya no carga Three.js ni las proyecciones inclinadas. Renderizado cenital 2D, escala uniforme y corrección del ancho real de las hojas al seleccionar fotogramas. |
| Animaciones PMDCollab | 224 actores con metadatos de fotogramas y duración. Se validaron 1.409 hojas. Las 180 formas jugables disponen de reposo, caminata, ataque y daño; las hojas conservan sus créditos individuales. |
| Recursos de Exploradores del Cielo | 126 originales incluidos y accesibles en el Atlas del gremio: 67 hojas Pokémon, 16 conjuntos de mazmorra, 10 mapas y 33 recursos diversos. Se usan 16 conjuntos de terreno en pisos de campaña y mapas/recuerdos en encuentros. No equivale a haber convertido cada fotograma del catálogo en una acción de combate. |
| Elecciones como Unite | Q ofrece dos sustituciones desde nivel 10; E desde nivel 20. Cada nueva forma puede elegir de nuevo. Elegir sustituye la técnica de esa ranura durante la expedición y conserva su recarga. Puede posponerse. No se exige escoger inmediatamente al evolucionar. |
| Gengar | Bola Sombra ralentiza; Bomba Lodo envenena y salpica objetivos cercanos. Las técnicas tienen costes y recargas. Hipnosis y Pulso Umbrío forman su segunda pareja. |
| Bebés y evoluciones de otras regiones | 180 formas jugables no legendarias: 146 de Kanto y 34 familiares de otras regiones. Magby–Magmar–Magmortar, Elekid–Electabuzz–Electivire, Magnemite–Magneton–Magnezone y demás familias conectadas. |
| Tienda de bases | 74 formas reclutables. Pikachu se conserva como excepción inicial gratuita, junto a Pichu para permitir su familia completa. Los otros iniciales gratuitos se mantienen. Evoluciones avanzadas se obtienen durante la partida. |
| Evoluciones | Cadenas de tres fases: 16 y 36. Dos fases: 26. Eevee tiene ocho ramas explícitas. Se conserva la opción de posponer. No se incluyen Perrserker, Sirfetch’d ni Mr. Rime porque requieren las formas regionales base, fuera de este plantel. |
| Identidad y clases | Pares de técnicas para cada forma y movimientos canónicos para once clases. Efectos de identidad por familia/tipo y sinergias con roles. Las 180 × 11 combinaciones no tienen cada una una mecánica completamente exclusiva; algunas comparten efectos y animaciones. |
| Encuentros de otras generaciones | Visitantes animados en pisos pares normales, con descanso pagado, enseñanza adaptada a especie/clase o provisiones. Una elección compartida consume el encuentro; no aparece en todos los pisos ni en los jefes. |
| Guardado y cooperación | Las elecciones se guardan y sincronizan. Validación de decisiones en el anfitrión. Protocolo 9: todos deben actualizar la misma versión. |

## Verificación realizada

- 720 ejecuciones de alternativas de técnica sobre objetivos: costes y estados numéricos válidos.
- Elecciones prematuras, repetidas o ajenas rechazadas; una evolución genera nuevas opciones. Guardar/reanudar conserva la decisión.
- Cuatro instancias simuladas: inventario, habilidades, elecciones, pausa, mensajes antiguos, reconexión y cambio de piso.
- 240 pisos generados con tres semillas: escaleras y llaves alcanzables.
- 22 especializaciones ejecutadas; recargas compartidas y controles locales comprobados.
- 19 perfiles de jefe: al menos tres patrones, fases, avisos, recuperación y nivel mínimo cinco sobre el jugador más alto.
- 55 ensayos de recursos: regeneración de PM, coste, técnicas de mejora, caducidad y límites antispam.
- Integridad de 1.409 hojas de animación y de los 126 recursos del atlas.
- Comprobación en navegador del menú, selector, entrada en partida y HUD 2D. En una escena de prueba de Gengar nivel 36/piso 6 se comprobó el menú de alternativas y la sustitución de Hipnosis por Bomba Lodo.

Estas pruebas no certifican el equilibrio de una campaña completa jugada por personas. La prueba cooperativa usa transporte determinista: no demuestra conexión WebRTC entre cuatro dispositivos reales. La revisión anterior no logró establecer el canal del invitado en la prueba real; sigue pendiente validar señalización/TURN en el alojamiento definitivo.

## Qué falta pulir y cómo priorizarlo

1. **Combate por especie.** Las opciones y efectos ya cambian el juego, pero todavía hay familias que comparten patrones. Priorizar desplazamiento, alcance, geometría del ataque y relación con estados antes de sumar más estadísticas. Evaluar combinaciones de especie/clase en partidas reales.
2. **Efectos extraídos.** El paquete Attack Effects está incluido íntegro como recurso descargable del atlas. No se han asignado sus 19.044 archivos extraídos a cada ataque. El combate conserva los efectos originales previamente integrados de PMDCollab/RawAsset; falta identificar y temporizar las secuencias adicionales. No se inventa una correspondencia a partir de sus carpetas numéricas.
3. **Hojas Pokémon de Spriters Resource.** Están conservadas en el atlas; las animaciones de actores proceden de PMDCollab, cuyo formato describe cuadros y duraciones. Convertir las láminas irregulares restantes exige delimitar cada pose y limpiar fondos sin recortar al personaje.
4. **Arte ambiental.** Los 16 conjuntos nuevos aportan variedad, pero quedan combinaciones de bordes, obstáculos y decoraciones por revisar visualmente en los 80 pisos. Los diez mapas originales sirven como ilustraciones de encuentros, no como diez mazmorras jugables nuevas.
5. **Equilibrio humano.** Medir tiempo por piso, daño recibido, muertes, PM consumidos y frecuencia de cada elección. Comparar ataques básicos frente a habilidades, especialmente después de nivel 20 y en cooperativo.
6. **Online real.** Verificar cuatro navegadores en redes diferentes, reconexión y latencia; configurar TURN si lo requiere la red. No anunciar el online como plenamente validado por pasar una simulación local.

## Instalación

Extraer todo el ZIP manteniendo rutas sobre una copia del sitio. Servir por HTTP/HTTPS y abrir dungeon.html desde el portal. No sustituir solamente el HTML. Recargar con Ctrl+F5. Los archivos 3D antiguos permanecen en el paquete como legado, pero no se cargan en la entrada 2D.

## Procedencia

- Spriters Resource, Pokémon Mystery Dungeon: Explorers of Sky: https://www.spriters-resource.com/ds_dsi/pokemonmysterydungeonexplorersofsky/
- PMDCollab: https://sprites.pmdcollab.org
- Hojas estructuradas: https://github.com/PMDCollab/SpriteCollab
- Recursos de combate y escenarios previos: https://github.com/PMDCollab/RawAsset

Los créditos de extracción están en assets/sky/manifest.json y los de cada actor en assets/actors/<número>/credits.txt. Las adaptaciones de habilidades al combate RPG no se presentan como reproducciones exactas de las reglas oficiales. Proyecto fan no oficial.
