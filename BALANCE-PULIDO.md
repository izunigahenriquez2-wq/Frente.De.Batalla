# Pokémon Mundo Misterioso: Ecos — pulido de equilibrio

Base: `2de5009da06817f7a1894ee49c90b7385cf9ff2b`. Se mantienen personajes gratuitos para pruebas, máximo 40, cartas, talentos, naturalezas, tres objetos y campaña. No se modifica Tactics ni index.html.

## Cambios

- Cartas: descripción de mejoras anticipadas (E 8, C 12, V 16); veto incluye mejoras y versión + de la técnica, conserva lo aprendido; revisión de oferta evita que un clic/paquete repetido consuma otra carta. Incluye teclado. Online: la elección espera a salir de combate y vuelve a quedar pendiente si se reanuda; no concede invulnerabilidad. Temporizador fuera de combate.
- Utilidad: +8 % de curación/duración por nivel de carta y +25 % adicional en versión +, manteniendo efectos propios. El básico + usa su categoría de efecto cada cuarto ataque; no transforma todo en cadenas. Se elimina el respaldo genérico de meteoros para movimientos desconocidos. Estados + requieren línea despejada y respetan el límite de aturdimiento del jefe.
- Definitivas: carga por daño efectivo normalizado por vida del objetivo, con presupuesto compartido limitado, en vez de premiar número de impactos. Inmunidad y secuaces de Alfa no cargan. Bajas compartidas con aliados activos próximos. Curación efectiva y escudos de aliados contribuyen; no la curación de la propia definitiva. Carga pasiva también cerca de compañeros en combate. Recibir daño tiene presupuesto inicial 4 y reposición 0,4/s, con 20 puntos por barra de vida perdida.
- Definitivas de utilidad: Santuario mejora curación/escudo al subir nivel; Frenesí mejora duración; hielo mejora ralentización.
- Alfas: una sola bonificación de 8 de definitiva a participantes próximos. Conservan frecuencia, ×3,8 de vida, daño y XP adicional. Colisión máxima 21 px de radio para corredores de 48 px; posiciones y refuerzos deben caber sin solapamiento. Refuerzos requieren línea despejada; se omiten si no hay espacio.
- Recompensas de Alfa: tabla propia, 85 % raro / 15 % legendario en tirada principal. Conserva posibilidad de objeto extra y consumible. Antes usaba tabla de jefe, aproximadamente 66,85 % legendario/único en piso 40. Se evita sumar la tirada normal de equipo. Secuaces no dan XP, monedas ni consumibles básicos ni tiradas normales de equipo, evitando recompensas adicionales por invocaciones.
- XP: contador de experiencia obtenida para medición; al máximo no acumula XP inútil ni cartas extra. **Se conserva la fórmula de XP: no hay evidencia suficiente para reajustarla aún.**
- Online: filtro de entrada conserva C/V; corregida excepción `rejected` al cerrar enlace del anfitrión. Protocolo 12: todos deben recargar el juego.
- Resumen: exportación JSON de equilibrio para anfitrión/solo. Registra niveles, XP, equipo, cartas, bajas por categoría, XP de Alfas, consumibles y carga/uso de definitivas. Pasivo, local, sin enviar datos a servicios externos.

## Verificación

- `node tests/verify-balance-current.cjs`: orden real de scripts del HTML; presupuesto de 35 cartas y siete talentos; veto, clic duplicado, protección online, apoyo, colisión, botín, construcción y ejecución de 780 variantes (195 especies × C/V × normal/+).
- `node tests/verify-network.cjs`: sala simulada de cuatro participantes, replicación, rechazo de quinto, desconexión y máscara completa de C/V. No sustituye WebRTC entre redes reales.
- `node tests/measure-ultimate.cjs`: escenarios controlados del medidor. Primera carga: daño rápido 59,9 s; daño lento equivalente 59 s; apoyo efectivo 60 s; recibir daño 83 s. Intervalos siguientes: aproximadamente 84–86, 88 y 125 segundos respectivamente. No son tiempos garantizados en campaña. Datos en `tests/results/ultimate-balance.json`.
- `node tools/campaign-unassisted.cjs BASE CLASE SEMILLA PASOS`: bot de lógica con movimiento, habilidades, cartas y consumibles existentes. Sin teletransporte, avances forzados, recursos gratuitos ni reducción artificial de daño. Cinco ejecuciones en `tests/results/campaign-unassisted.json`.

El entorno sustituye DOM, imágenes y render: no verifica calidad visual, botones ni rendimiento. Las pruebas históricas no se presentan como certificación de la versión actual.

## Pendiente de validación

Los cinco recorridos sin ayudas no completaron la campaña: cuatro murieron en piso 1; Bulbasaur llegó al 2 y se atascó la navegación del bot. Esto no demuestra que la campaña sea imposible ni que la XP sea demasiado baja. El bot no representa una estrategia humana competente ni optimiza todas las decisiones de equipo/exploración. No se rebajó la dificultad para hacerlo pasar.

**No se certifica el piso en que se alcanza nivel 40 ni la igualdad de utilidad de todas las definitivas.** La curva queda como candidata, con instrumentación para contrastarla en campañas completas y cooperativas. Objetivo: nivel 40 en tramo final, con tiempo para usar el último talento antes de Mewtwo.

35 cartas permiten siete secuencias de mejora completas (cuatro niveles y +), si ninguna se gasta en aprender o pasivas. Maximizar cinco movimientos propios/básico y cuatro técnicas extra exige 45 mejoras, más aprendizaje; no cabe en el presupuesto. No se añade límite artificial de especialización.

Antes de integrar: revisión visual de cartas y efectos +, sesión real de invitados, guardar/reanudar y campaña completa. La rama es una propuesta verificable de pulido, no una declaración de balance final.
