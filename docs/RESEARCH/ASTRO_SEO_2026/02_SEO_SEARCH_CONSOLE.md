# SEO, Search Console y descubribilidad para iteris.tech y dpeluche.dev

Fecha de la investigación: 13 oct 2026. Alcance: dos sitios estáticos Astro que reemplazan a sus versiones actuales en el mismo dominio, ambos en Vercel, DNS en Cloudflare.

Convenciones del documento:
- Cada afirmación lleva su URL. "Fuente primaria" = documentación de Google, Bing, OpenAI, Anthropic, Perplexity, schema.org, web.dev, Vercel, Cloudflare.
- "Fuente secundaria" = blogs de SEO o notas de prensa del sector. Se usan solo donde no encontré primaria y se marcan.
- "UNKNOWN" = no pude verificarlo o depende de algo que no sabemos del setup actual.
- "Estimación mía" = juicio propio sin fuente.
- Lo que cambió recientemente va marcado con [NUEVO].

Supuestos que NO verifiqué (revisarlos antes de actuar):
- Qué host canónico usa dpeluche.dev (www o apex). Solo sabemos que iteris.tech canónico es www y el apex hace 307 a www. UNKNOWN para dpeluche.dev.
- Qué URLs viejas estaban indexadas y si existía algún sitemap viejo. UNKNOWN.
- Si los registros de Cloudflare están en modo proxied (nube naranja) o DNS only hacia Vercel. UNKNOWN.
- Si Iteris atiende clientes en persona en una dirección física. UNKNOWN (decide el GBP, sección 3).

---

## Resumen ejecutivo

1. Crear propiedades de dominio en Search Console para los dos dominios hoy, antes del lanzamiento. La recolección de datos empieza al agregar la propiedad, aun antes de verificar (https://support.google.com/webmasters/answer/34592?hl=en).
2. El apex de iteris.tech responde 307, que es redirección temporal. Google recomienda 301/308 para movimientos permanentes (https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes). Pasarlo a 308 es un cambio de 5 minutos. Vercel permite elegir 307 o 308 en sus redirects (https://vercel.com/docs/routing/redirects/bulk-redirects/getting-started); si el redirect de dominio del panel permite elegir código es UNKNOWN, verificarlo.
3. Para el sitio bilingüe: hreflang reciprocal, autorreferenciado, URLs absolutas y x-default (https://developers.google.com/search/docs/specialty/international/localized-versions). El plugin de sitemap de Astro lo genera con la opción `i18n`.
4. Ninguno de los dos nombres se va a poder "ganar" para la búsqueda pelada ("iteris", "dpeluche"). Hay que apuntar a consultas con modificador (ciudad, rol, nombre completo) y construir señales de entidad consistentes. Google no documenta una táctica de desambiguación; lo que sigue son prácticas razonables, no garantías.
5. llms.txt: Google lo ignora, dicho explícitamente en su guía oficial. No gastar tiempo ahí salvo como extra opcional.
6. [NUEVO] Search Console ahora trae filtro de consultas de marca (todos los sitios elegibles desde el 11 mar 2026) y reportes de rendimiento en IA generativa (todos los sitios desde el 31 ago 2026). Bing Webmaster Tools tiene "AI Performance" con citas en Copilot.

---

## 1. Search Console, Bing Webmaster Tools e IndexNow, paso a paso

### 1.1 Tipo de propiedad: Dominio vs prefijo de URL

| | Dominio (`iteris.tech`) | Prefijo de URL (`https://www.iteris.tech/`) |
|---|---|---|
| Cubre | Todos los subdominios y protocolos (http/https, www, apex) | Solo URLs con ese prefijo exacto, incluido el protocolo |
| Verificación | Solo registro DNS | HTML file, meta tag, GA, GTM o DNS |
| Útil para | Vista completa, ver el redirect apex->www | Separar `/es/` de `/en/` o una sola ruta |

Fuente primaria: https://support.google.com/webmasters/answer/34592?hl=en (tabla de tipos de propiedad; "si necesitas limitar datos por segmentos de ruta como example.com/es/, crea una propiedad de prefijo de URL").

Recomendación: una propiedad de Dominio por sitio (la principal) y, solo para iteris.tech, una de prefijo `https://www.iteris.tech/es/` para aislar el español. La de dominio cubre el caso de que el apex y el www aparezcan indexados por separado, cosa que importa porque hoy hay un 307.

Nota: la verificación DNS solo sirve para propiedades de dominio como método obligatorio; el HTML file y el meta tag no sirven para dominio (https://support.google.com/webmasters/answer/9008080).

### 1.2 Verificación con registro TXT en Cloudflare

Fuente primaria de Google: https://support.google.com/webmasters/answer/9008080 (método "Domain name provider"; Search Console te da un TXT).

Pasos:
1. En https://search.google.com/search-console elige "Agregar propiedad" y la opción "Dominio". Escribe `iteris.tech` (sin https ni www).
2. Search Console muestra un TXT del tipo `google-site-verification=XXXX`. Copiarlo.
3. En el panel de Cloudflare, en la zona del dominio, DNS > Records > Add record. Tipo `TXT`, Name `@`, Content el valor copiado, TTL Auto. Guardar. Guía de Cloudflare: https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/.
4. Los TXT en Cloudflare siempre son DNS only, no hay opción de proxy para ese tipo (https://developers.cloudflare.com/dns/manage-dns-records/how-to/set-up-google-workspace/). No hay que tocar nada de la nube naranja.
5. Volver a Search Console y pulsar "Verificar". Si falla por propagación, esperar unos minutos y reintentar (estimación mía; Cloudflare suele propagar rápido, no encontré SLA primario).
6. No borrar el TXT después. Si se borra, se pierde la verificación (https://support.google.com/webmasters/answer/9008080: "Removing the verification ... will cause you to lose verification").
7. Repetir para `dpeluche.dev`.

Si Cloudflare ya tiene TXT de SPF o de otro servicio en `@`, no los reemplaces; agrega otro registro. Se permiten varios TXT en el mismo nombre. UNKNOWN qué TXT existen hoy: revisar en el panel antes de agregar.

### 1.3 Agregar usuarios

Fuente primaria: https://support.google.com/webmasters/answer/7687615.
- Propietario verificado: verificó con token. Propietario delegado: lo agrega otro propietario sin token. Usuario completo: ve todo y puede actuar en algunas herramientas. Usuario restringido: solo lectura limitada.
- Settings > Users and permissions > Add user. Solo propietarios pueden agregar usuarios.
- Regla práctica: dos propietarios (Antonio y una segunda cuenta de respaldo de Iteris). Si se pierde el único propietario verificado se pierde el acceso (misma página).
- Para un colaborador o un agente: usuario completo, no propietario.

### 1.4 Enviar el sitemap (sitemap-index.xml)

Fuentes primarias:
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap (límites 50 MB / 50,000 URLs por sitemap; Google ignora `priority` y `changefreq`; usa `lastmod` si es consistentemente verificable).
- https://docs.astro.build/en/guides/integrations-guide/sitemap/ (el integration de Astro genera `sitemap-index.xml` y `sitemap-0.xml`; soporta `i18n` con `xhtml:link` alternates).
- https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt (la línea `Sitemap: https://.../sitemap-index.xml` en robots.txt).

Pasos:
1. Verificar que `https://www.iteris.tech/sitemap-index.xml` responde 200 y lista `sitemap-0.xml` con las ~24 URLs, todas con host `www` y esquema https.
2. Añadir a `robots.txt`: `Sitemap: https://www.iteris.tech/sitemap-index.xml`.
3. En Search Console: Sitemaps > escribir `sitemap-index.xml` > Enviar. Ver estado "Correcto" y "Páginas descubiertas".
4. Poner en el sitemap solo URLs canónicas, 200 y indexables. Si una URL redirige o es noindex, sacarla.
5. Con la opción `i18n` del integration de Astro, cada URL lleva sus alternates en/es. Combinarlo con los `<link rel="alternate" hreflang>` en el head es redundante pero inofensivo si ambos coinciden; Google dice que se puede usar cualquiera de los tres métodos (head, header HTTP, sitemap) y que deben ser consistentes (https://developers.google.com/search/docs/specialty/international/localized-versions).

### 1.5 Inspección de URL: prueba en vivo vs versión indexada

Fuente primaria: https://support.google.com/webmasters/answer/9012289.
- "Indexada" (por defecto): lo que Google tiene guardado del último rastreo. Dice por qué se indexó o no, cuál es el canónico elegido por Google y cuándo fue el último rastreo.
- "Probar URL publicada" (live test): rastrea ahora mismo con Google-InspectionTool y dice si PODRÍA indexarse. Muestra captura renderizada y recursos cargados. No predice cuál será el canónico ni detecta duplicados (misma página: "the live test cannot predict whether or not the tested version will be considered canonical").
- Para esta migración, el uso clave es la prueba en vivo en la home, una página `/es/`, un proyecto y un post: confirmar que el HTML ya trae el contenido (el problema del sitio viejo era HTML vacío por render en cliente).

### 1.6 Solicitar indexación

Fuente primaria: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl.
- Solo propietarios o usuarios completos; hay cuota; pedirlo varias veces para la misma URL no la hace más rápida.
- Para pocas URLs: solicitar indexación en la home, la página de contacto/acerca y 3 o 4 más importantes. Para el resto, el sitemap es el camino correcto ("If you have large numbers of URLs, submit a sitemap").
- Tiempos que dice Google: "Crawling can take anywhere from a few days to a few weeks."

### 1.7 Qué leer en la semana 1 y el mes 1

Todo en Search Console. Fuente de cada reporte: https://support.google.com/webmasters/answer/7440203 (Page indexing) y https://support.google.com/webmasters/answer/9133276 (Performance).

Semana 1 (solo salud de indexación; los datos de rendimiento tardan "a few days" en aparecer, https://support.google.com/webmasters/answer/34592?hl=en):
1. Sitemaps: estado Correcto, número de URLs descubiertas igual a ~24 (iteris) y ~29 (dpeluche).
2. Páginas (Page indexing): cuántas "Indexadas" y las razones de "No indexadas". Esperables y sanos: "Página con redirección" (el apex y las URLs viejas que ahora redirigen), "Alternativa con etiqueta canónica adecuada" si hay duplicados controlados. Vigilar: "Soft 404", "Descubierta, actualmente sin indexar", "Rastreada, actualmente sin indexar", "Excluida por noindex" (si queda un noindex de staging).
3. Inspección de URL en 4 a 6 páginas representativas.
4. Validación: si Google marca un problema y lo arreglas, "Validate fix" tarda "up to about two weeks" (https://support.google.com/webmasters/answer/7440203).

Mes 1:
1. Rendimiento > Resultados de búsqueda: impresiones, clics, CTR y posición media por consulta y por página. Con tan pocas URLs y poco tráfico, las posiciones medias son ruidosas. Leer tendencia, no un día suelto.
2. [NUEVO] Filtro de consultas de marca vs no de marca: disponible en todos los sitios elegibles desde el 11 mar 2026 (https://developers.google.com/search/blog/2025/11/search-console-branded-filter). Un hilo de comunidad dice que solo existe en propiedades de nivel superior (secundaria, https://support.google.com/webmasters/thread/393302123/new-gsc-features-not-showing-up-in-my-search-console?hl=en): usar la propiedad de Dominio, no la de prefijo `/es/`.
3. [NUEVO] Reporte de rendimiento en IA generativa (AI Overviews y AI Mode): lanzado el 3 jun 2026, disponible en todos los sitios desde el 31 ago 2026 (https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports). Muestra impresiones, páginas, países, dispositivos y fechas. Con sitios nuevos es normal ver cero al inicio.
4. Core Web Vitals: umbrales "buenos" LCP 2.5 s, INP 200 ms, CLS 0.1, medidos en el percentil 75 (https://web.dev/articles/vitals). Los datos de campo (CrUX) solo aparecen cuando hay suficiente tráfico; con sitios tan chicos es probable ver "sin datos suficientes" (estimación mía; no encontré cifra primaria del umbral). Mientras tanto usar PageSpeed Insights / Lighthouse como medición de laboratorio. Un sitio estático en Vercel suele pasar.
5. Mejoras (Enhancements): solo aparecen si Google detecta el tipo de dato (Breadcrumbs, y datos de logotipo/organización si aplican). Corregir errores del Rich Results Test (https://search.google.com/test/rich-results).
6. Enlaces: ver qué sitios enlazan al dominio (útil para la lista de backlinks a actualizar tras el relanzamiento, https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).

Terminología: lo que antes se llamaba "Index Coverage" hoy se ve como "Page indexing" (misma fuente, https://support.google.com/webmasters/answer/7440203).

### 1.8 Cuánto tarda (resumen con fuentes)

| Evento | Plazo según fuente |
|---|---|
| Rastreo tras solicitar indexación o sitemap | "A few days to a few weeks" (https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl) |
| Sitio o página nueva | "A week or so" (https://support.google.com/webmasters/answer/7440203) |
| Datos de rendimiento nuevos | "A few days" (https://support.google.com/webmasters/answer/34592?hl=en) |
| Validación de arreglo | "Up to about two weeks", a veces más (https://support.google.com/webmasters/answer/7440203) |
| Migración de sitio pequeño/medio | "A few weeks for most pages" (https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) |
| Cambios en el sitio en general | Desde horas hasta meses; esperar unas semanas para evaluar (https://support.google.com/webmasters/answer/7451184?hl=en) |

Estimación mía para estos sitios (24 y 29 URLs, HTML completo, sitemap enviado): la mayoría indexada en 1 a 3 semanas; consultas de marca estabilizadas en 4 a 8 semanas. No es dato de Google.

### 1.9 Bing Webmaster Tools

Fuente primaria: https://blogs.bing.com/webmaster/2025/6/Start-Using-Bing-Webmaster-Tools-to-Improve-Your-Site-Visibility/.

Pasos:
1. Entrar a https://www.bing.com/webmasters con cuenta Microsoft, Google o Facebook.
2. "Import from Google Search Console": autorizar la cuenta Google, elegir las propiedades. Importa la propiedad verificada y los sitemaps (Bing: "If your site is already verified in Google Search Console, you can import your verified ownership directly"). Alternativas: meta tag, archivo XML, TXT en DNS.
3. Revisar que el sitemap aparezca; Bing lo procesa "at least once every 24 hours".
4. Qué mirar: Search Performance (hasta 16 meses), URL Inspection, Site Scan (enlaces rotos, metadatos duplicados), Robots.txt Tester.
5. [NUEVO] "AI Performance": en vista previa pública desde el 10 feb 2026, muestra citaciones de tu sitio en respuestas generadas en Copilot, resúmenes de Bing y socios (https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/). El 16 jun 2026 sumaron Intents, Topics, Citation Share y Compare (https://blogs.bing.com/search/2026/6/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare/; solo leí el snippet de búsqueda de esta segunda).

Por qué importa más de lo que parece: Bing alimenta a DuckDuckGo, Yahoo y Copilot según el propio blog de Bing. Para ChatGPT, afirmaciones de que depende de Bing son de fuente secundaria (https://apollodigital.io/blog/get-cited-by-chatgpt/); OpenAI documenta que usa OAI-SearchBot para su búsqueda (https://developers.openai.com/api/docs/bots), así que no asumir dependencia de Bing sin evidencia primaria.

### 1.10 IndexNow: vale la pena para un sitio estático en Vercel

Hechos:
- Protocolo abierto; lo soportan Bing, Naver, Seznam.cz, Yandex y Yep (https://www.indexnow.org/). Google NO lo soporta (fuente secundaria con fecha feb 2026: https://pressonify.ai/blog/indexnow-instant-indexing-press-releases-2026; hilo de la comunidad de Google lo confirma en 2024: https://support.google.com/webmasters/thread/278807782/indexnow-implementation?hl=en). No encontré una página primaria de Google que lo diga.
- Mecánica: archivo de clave `{key}.txt` en la raíz del host y un POST JSON con `host`, `key` y `urlList` (hasta 10,000 URLs) a un endpoint del buscador (https://www.indexnow.org/documentation).

Veredicto (opinión mía): bajo valor para 24 y 29 URLs, que cambian poco. Sirve para avisar a Bing en cada deploy del changelog de dpeluche.dev. Costo: S. Hacerlo después de lo esencial. Cómo:
1. Generar una clave de 8 a 128 caracteres hexadecimales.
2. Poner `public/<clave>.txt` con la clave dentro como contenido (se publica en la raíz de cada host).
3. En el pipeline posterior al deploy de Vercel (GitHub Action o `vercel deploy` hook), un `curl -X POST https://api.indexnow.org/indexnow` con las URLs cambiadas. El endpoint genérico `api.indexnow.org` aparece en la documentación del sitio de IndexNow; verificar.
4. Sin integración nativa de Vercel verificada: UNKNOWN.

Alternativa más simple: no hacerlo y confiar en sitemap + Bing import. Es aceptable.

---

## 2. Relanzamiento en el mismo dominio: checklist según Google

Fuente primaria base: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes ("How to move a site"). Ese documento trata cambios de URL (HTTP a HTTPS, dominio, rutas). Aquí el dominio es el mismo, así que aplica la parte de cambios de rutas y de contenido, no el Change of Address.

### Antes del lanzamiento
1. Verificar ambos dominios en Search Console ahora, con todas las variantes (www, apex, http, https). La propiedad de Dominio ya las cubre. Fuente: mismo doc, sección "Ensure correct Search Console settings".
2. Registrar la línea base (sección 6) de las URLs viejas indexadas.
3. Hacer el inventario de URLs viejas: sitemaps previos, logs/analytics, y "Links to your site" en Search Console (mismo doc, "Determine your old URLs"). Con solo 1 a 3 páginas indexadas el inventario es corto; incluir imágenes y PDFs que recibieran tráfico (el doc lo pide).
4. Mapa de URL viejas a nuevas. Mantener las mismas URLs cuando se pueda; es la mejor opción. Donde cambien: redirect 301 o 308 directo al destino final, sin cadenas (el doc recomienda ideal no más de 3 saltos y menos de 5).
5. Contenido que no migra: devolver 404 o 410 real, no redirigir a la home. Fuente: mismo doc ("Provide errors for deleted or merged content"). Redirigir todo a la home puede leerse como soft 404 (ver abajo).
6. Cada URL nueva con `rel="canonical"` autorreferenciado y hreflang actualizado a las URLs nuevas; enlaces internos apuntando a las nuevas (mismo doc, "Update all URL details").
7. robots.txt del sitio nuevo correcto desde el primer deploy; si se usó noindex en staging o en previews, quitarlo antes (mismo doc, "Set up a robots.txt"). Sobre previews de Vercel: no verifiqué que Vercel agregue noindex automáticamente a previews; UNKNOWN, comprobar con `curl -I` en una URL de preview.
8. Verificar capacidad del servidor: Google rastrea más al inicio. Vercel estático no es problema (mismo doc, "Ensure that your server has enough computing resources").

### El día del lanzamiento
1. Redirects activos. Probarlos con la Inspección de URL y con curl (mismo doc, "Test the redirects").
2. Confirmar canonical y robots meta en producción.
3. Enviar sitemap-index.xml (mismo doc, "Submit the new sitemap").
4. Solicitar indexación de las páginas clave (sección 1.6).
5. Change of Address: NO se usa. Google lo limita a cambios de dominio o subdominio y dice que no hace falta para HTTP a HTTPS ni para cambios entre www y no-www dentro del mismo dominio (mismo doc, paso 4 de "Start the site move").
6. Mantener los redirects "generally at least 1 year" (mismo doc).

### Soft 404
- Un soft 404 es una página que muestra mensaje de "no encontrada" o está vacía pero responde 200. Search Console lo reporta como "Soft 404" (https://developers.google.com/crawling/docs/troubleshooting/http-status-codes).
- Astro estático: el archivo `404.html` debe servirse con status 404 en Vercel. Verificar con `curl -I https://www.iteris.tech/ruta-inexistente`. En Vercel, el 404.html de salida estática suele devolver 404, pero no lo verifiqué: UNKNOWN, probarlo.
- No poner páginas casi vacías (por ejemplo secciones "próximamente" con una línea) en el sitemap.
- Qué cuenta como página "vacía": el sitio viejo con HTML vacío por render en cliente es exactamente el caso que dispara soft 404 o "Descubierta/Rastreada sin indexar". El nuevo HTML estático lo corrige.

### Fluctuación esperada
- Google: "Expect temporary fluctuation in site ranking during the move"; para sitios medianos "a few weeks or more" hasta que muestre las URLs nuevas en lugar de las viejas (mismo doc).
- 301 y otros permanentes "don't cause a loss in PageRank" (mismo doc).
- Cambiar una cosa a la vez: Google recomienda no mezclar cambio de dominio, CMS y diseño. Aquí cambian CMS y diseño a la vez que el contenido pasa a ser indexable; aceptable porque el punto de partida son 1 a 3 URLs indexadas, pero no sumar encima cambio de dominio ni de estructura de URL.
- Como solo había 1 a 3 URLs indexadas, el riesgo real de perder tráfico es bajo (estimación mía); el objetivo es ganar indexación, no proteger tráfico.

### Qué monitorear (mes 1)
- Sitemaps: indexadas vs enviadas.
- Page indexing: aparición de "Soft 404", "No encontrada (404)", "Redirect error".
- Rendimiento: impresiones por página y por consulta de marca.
- Logs de Vercel o analytics: tráfico a URLs viejas que ya no existen (404 que importan).
- Mismo doc, sección "Monitor traffic".

---

## 3. SEO de entidad: persona y empresa con nombre colisionado

Aviso de honestidad: Google no publica una guía de desambiguación para nombres compartidos. Lo documentado es (a) cómo el Knowledge Graph recibe datos, (b) cómo se eligen nombres de sitio y (c) qué marcado existe. Lo demás es práctica razonable (estimación mía) y no hay garantía de que funcione.

### 3.1 Cómo se vinculan las entidades en Google

- El Knowledge Graph recibe hechos de fuentes públicas, datos con licencia y de propietarios que sugieren cambios a paneles reclamados. Los paneles de conocimiento "are created automatically by Google Search Algorithm when there is enough information available on the open web" (https://support.google.com/knowledgepanel/answer/9787176?hl=en). No se pueden pedir.
- Si aparece un panel, la persona puede reclamarlo ("Claim this knowledge panel"); no todos son reclamables (https://support.google.com/knowledgepanel/answer/7534902?hl=en-PH).
- Google dice que para establecer presencia oficial: verificar el sitio en Search Console, reclamar el Business Profile si aplica y agregar datos estructurados (https://developers.google.com/search/docs/appearance/establish-business-details).
- Nombre del sitio: Google lo genera automáticamente a partir de la home y de referencias externas. Se indica preferencia con datos estructurados `WebSite` en la home; también considera `og:site_name`, `<title>` y encabezados. Dato clave para este caso: "our system generally won't use the same site name for two different sites that are global in nature", por eso conviene dar `alternateName` (https://developers.google.com/search/docs/appearance/site-names).

### 3.2 Persona (dpeluche.dev)

Tipo de dato: `Person` en la home y `ProfilePage` con `mainEntity` Person. Google tiene un doc de ProfilePage para creadores en comunidades en línea; no es un resultado enriquecido garantizado para un portafolio, pero es un tipo válido de schema.org (https://developers.google.com/search/docs/appearance/structured-data/profile-page). Úsalo como señal semántica, no esperes un rich result. Los datos estructurados "no son requisito" para IA generativa (https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

Propiedades de `Person` disponibles en schema.org: https://schema.org/Person (incluye `name`, `alternateName`, `jobTitle`, `worksFor`, `alumniOf`, `sameAs`, `knowsAbout`, `url`, `image`).

Ejemplo (JSON-LD, usar el host canónico real de dpeluche.dev, que es UNKNOWN; abajo `www`):

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfilePage",
      "@id": "https://www.dpeluche.dev/#profile",
      "url": "https://www.dpeluche.dev/",
      "mainEntity": { "@id": "https://www.dpeluche.dev/#person" }
    },
    {
      "@type": "Person",
      "@id": "https://www.dpeluche.dev/#person",
      "name": "Antonio Martínez Quintero",
      "alternateName": ["dPeluChe", "Antonio Martinez Quintero"],
      "jobTitle": "CEO",
      "worksFor": { "@id": "https://www.iteris.tech/#org" },
      "alumniOf": { "@type": "Organization", "name": "Plerk" },
      "knowsAbout": ["Software engineering", "Product development", "Fintech"],
      "url": "https://www.dpeluche.dev/",
      "sameAs": ["https://www.linkedin.com/in/...", "https://github.com/dPeluChe"]
    }
  ]
}
```

Notas:
- Plerk es empleador pasado: `alumniOf` en schema.org es para instituciones educativas (EducationalOrganization). Para el rol pasado como CTO en Plerk lo correcto semánticamente es describirlo en texto visible y, si quieres marcarlo, usar `hasOccupation` o `affiliation`; no lo pongas como `worksFor`. Esto es criterio mío; schema.org no prohíbe `alumniOf` con Organization pero su definición apunta a instituciones educativas (https://schema.org/Person).
- Los datos del JSON-LD deben coincidir con el texto visible de la página; Google lo exige para sus tipos soportados ("structured data matches the visible text", https://developers.google.com/search/docs/appearance/ai-features).
- `sameAs`: solo perfiles reales y propios. Los URLs de LinkedIn y GitHub son UNKNOWN (rellenar). Un `sameAs` a Wikidata o Wikipedia solo si existe una entrada; no crearla artificialmente.
- Incluye el nombre con y sin acentos como `alternateName` porque la gente busca ambas formas (estimación mía).

### 3.3 Empresa (iteris.tech): ¿Organization, ProfessionalService o LocalBusiness?

- `Organization` es el tipo seguro. Google documenta `Organization` con `name`, `alternateName`, `url`, `logo`, `sameAs`, `address`, `contactPoint`, `description`, `iso6523Code` y otros; ninguna propiedad es obligatoria (https://developers.google.com/search/docs/appearance/structured-data/organization).
- `LocalBusiness` y subtipos (como `ProfessionalService`) describen un negocio con ubicación; Google pide, si usas `LocalBusiness`, los datos de contacto en el nivel principal (misma página de Organization). Usarlo implica prometer dirección y horarios públicos.
- Recomendación: `Organization` (o `ProfessionalService` solo si hay oficina pública y horarios). Para un laboratorio de producto y tecnología, `Organization` con `address` (Guadalajara, Jalisco, MX), `description` con la categoría, `areaServed`, `founder` y `sameAs`.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.iteris.tech/#org",
  "name": "Iteris",
  "alternateName": ["Iteris Tech", "Iteris Lab"],
  "url": "https://www.iteris.tech/",
  "logo": "https://www.iteris.tech/logo.png",
  "description": "Product and technology lab in Guadalajara, Mexico.",
  "address": { "@type": "PostalAddress", "addressLocality": "Guadalajara", "addressRegion": "Jalisco", "addressCountry": "MX" },
  "founder": { "@id": "https://www.dpeluche.dev/#person" },
  "sameAs": ["https://www.linkedin.com/company/...", "https://github.com/..."]
}
```

- Marcar `WebSite` en la home con `name` y `alternateName` para el nombre de sitio (https://developers.google.com/search/docs/appearance/site-names).
- Logo: seguir las reglas del doc (https://developers.google.com/search/docs/appearance/structured-data/logo).
- Sobre `founder`: solo si es verdad y público; la identidad "CEO of Iteris" sale del brief, no la verifiqué en un sitio.

### 3.4 Destinos de sameAs

Prioridad (estimación mía, adaptada de los ejemplos de Google que usan perfiles oficiales):
- Para la persona: LinkedIn, GitHub, X, Crunchbase o AngelList si existe, perfil de YC si existe (UNKNOWN), conferencias donde hablara.
- Para Iteris: página de empresa en LinkedIn, GitHub org, Crunchbase, directorio local si existe (UNKNOWN).
- Wikidata: solo si hay notabilidad; no la inventes.
- Cada destino debe enlazar de vuelta al sitio oficial y usar el mismo nombre y descriptor.

### 3.5 Tácticas de desambiguación (práctica, no garantía)

1. Descriptor fijo junto al nombre en todas partes: "Iteris, product and technology lab in Guadalajara, Mexico" en title de la home, H1 o subtítulo, meta description, JSON-LD `description`, bio de LinkedIn, GitHub, Crunchbase. Para la persona: "Antonio Martínez Quintero (dPeluChe), CEO of Iteris".
2. Ubicación y categoría consistentes (NAP: nombre, dirección, teléfono, solo si son públicos) en el sitio y en perfiles.
3. `alternateName` en `WebSite` y `Organization` para dar opciones al sistema de nombres de sitio (cita de 3.1).
4. Apuntar a consultas con modificador: "iteris guadalajara", "iteris tech", "iteris lab", "Antonio Martínez Quintero", "dPeluChe developer", "dPeluChe Iteris". La consulta pelada "iteris" competirá con Iteris Inc. (iteris.com, con página de Wikipedia, dato del brief). No esperes ganarla.
5. Menciones externas genuinas y consistentes (prensa local, eventos como el Jalisco Tech Week, directorios). Google dice que buscar menciones inauténticas no ayuda (https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).
6. Para dPeluChe vs D'Peluche (tienda de peluches): el contexto de la consulta decide; contenido sobre software y el nombre completo en cada página ayuda. La tienda es otra categoría (juguetes) y el motor puede distinguir por intención. No hay acción adicional comprobable.
7. Nunca usar la marca de Iteris Inc. ni imitar su identidad visual; es riesgo de reputación y legal, además de confundir a Google. Marca propia distinta.

### 3.6 ¿Google Business Profile para Iteris?

Fuente primaria de elegibilidad: https://support.google.com/business/answer/13763036?hl=en.
- Requisito: el negocio debe tener contacto en persona con clientes en sus horarios.
- No son elegibles: "Brands, organizations, artists, and other online-only businesses" y empresas de generación de leads.
- Negocios de área de servicio sin local pueden existir si atienden en persona a clientes (https://support.google.com/business/answer/9157481?hl=en), pero no pueden listar una oficina virtual (hilo de comunidad que cita la guía: https://support.google.com/business/community-guide/361385604/can-i-use-a-coworking-space-address-for-my-google-business-profile?hl=en).
- Veredicto: solo si Iteris recibe o visita clientes en persona en Guadalajara y tiene dirección real que pueda verificar. Si es 100% remoto o online, probablemente no es elegible y un perfil falso se suspende. UNKNOWN cuál es el caso real. Para dpeluche.dev (persona) no aplica.
- Beneficio si aplica: panel y Maps vinculados a la empresa, lo que ayuda a desambiguar frente a Iteris Inc. (estimación mía).

### 3.7 Enlaces entre el sitio personal y el de la empresa

- dpeluche.dev: texto visible y enlace a iteris.tech ("CEO of Iteris") y `worksFor` apuntando al `@id` de la organización.
- iteris.tech: página de equipo o acerca con enlace a dpeluche.dev, y `founder` referenciando a la Person. Es un enlace normal (sin nofollow ni sponsored; es contenido propio).
- Mismos nombres, mismos descriptores. `sameAs` de la Person incluye la URL de Iteris solo si Iteris es página sobre ella; mejor usar `worksFor` y `founder`.
- Usar `@id` consistentes entre sitios para que un grafo conecte a la persona y la empresa (técnica estándar de JSON-LD; Google no la documenta como requisito).

---

## 4. SEO en la página para estos tipos de sitio

### 4.1 Títulos y descripciones

Fuentes primarias: https://developers.google.com/search/docs/appearance/title-link y https://developers.google.com/search/docs/appearance/snippet.
- Los títulos deben ser únicos, descriptivos y no repetitivos; Google puede reescribirlos. La marca va al final o al principio de forma consistente, y en la home puede ir el nombre del sitio. No hay un límite de caracteres oficial; se trunca al ancho del dispositivo (title-link).
- La meta description es opcional y Google puede ignorarla y generar el snippet desde el contenido; escribirla por página cuando aporte (snippet).

Patrones propuestos (estimación mía basada en lo anterior):

iteris.tech
- Home en: `Iteris | Product and technology lab in Guadalajara, Mexico`
- Home es: `Iteris | Laboratorio de producto y tecnología en Guadalajara, México`
- Interior: `{Tema} | Iteris`
- Descripción: una frase que repita "Iteris", la categoría y "Guadalajara", sin relleno.

dpeluche.dev
- Home: `Antonio Martínez Quintero (dPeluChe) | CEO of Iteris, software builder`
- Proyecto: `{Proyecto}: {qué es en 6 palabras} | Antonio Martínez Quintero`
- Post de changelog: `{Título del cambio} | dPeluChe changelog`
- Usar el nombre completo que la gente busca en el `<title>` de la home, el `<h1>` y el JSON-LD (`name`).

### 4.2 hreflang en/es, x-default y canonical con www

Fuente primaria: https://developers.google.com/search/docs/specialty/international/localized-versions. Reglas:
- Cada versión debe listarse a sí misma y a todas las demás (autorreferencia).
- Las URLs deben ser totalmente cualificadas, con esquema y host.
- Si dos páginas no se apuntan entre sí, las etiquetas se ignoran (reciprocidad).
- `x-default` para páginas de respaldo, por ejemplo la versión en inglés o un selector de idioma.
- Se puede usar el head, cabeceras HTTP o sitemap; no mezclar con valores distintos.

Aplicado:

```html
<link rel="canonical" href="https://www.iteris.tech/es/servicios/">
<link rel="alternate" hreflang="es" href="https://www.iteris.tech/es/servicios/">
<link rel="alternate" hreflang="en" href="https://www.iteris.tech/services/">
<link rel="alternate" hreflang="x-default" href="https://www.iteris.tech/services/">
```

- Canonical autorreferenciado en cada idioma; nunca apuntar el canonical de `/es/` al inglés (colapsaría el español). Fuente sobre canónicos: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls.
- El canonical usa el host `www` en todas partes, igual que el sitemap, los enlaces internos y el JSON-LD. Un redirect 301/308 del apex a `www` refuerza (el doc de canonicalización dice que los redirects son una señal fuerte).
- Códigos: `en` y `es` bastan ("language code by itself"). Usar `es-MX` solo si habrá variantes por país.
- Consistencia de barra final: elegir una forma y que Astro (`trailingSlash`) y Vercel coincidan; Vercel normaliza con 308 (https://vercel.com/docs/routing/redirects). Mezclar rompe la reciprocidad de hreflang.
- dpeluche.dev es solo en inglés: no usar hreflang. Define un host canónico (www o apex) y haz que el otro redirija con 308.

### 4.3 Datos estructurados por tipo de página

Regla general: el marcado debe reflejar el contenido visible, y los tipos que no den resultado enriquecido pueden usarse igual como semántica. Google dice que no hay marcado especial para IA (https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

| Página | Tipo | Nota | Fuente |
|---|---|---|---|
| Home de cada sitio | `WebSite` (name, alternateName, url) | Controla el nombre de sitio | https://developers.google.com/search/docs/appearance/site-names |
| Home iteris | `Organization` | Ver 3.3 | https://developers.google.com/search/docs/appearance/structured-data/organization |
| Home dpeluche | `ProfilePage` + `Person` | Ver 3.2; sin rich result garantizado | https://developers.google.com/search/docs/appearance/structured-data/profile-page |
| Proyectos (dpeluche) | `CreativeWork` o `SoftwareSourceCode` | `SoftwareApplication` en Google exige calificación o reseña para el rich result; sin reseñas reales no lo uses | https://developers.google.com/search/docs/appearance/structured-data/software-app |
| Posts de changelog | `BlogPosting` (subtipo de Article) con headline, image, datePublished, dateModified, author (Person con url) | Soportado por Google | https://developers.google.com/search/docs/appearance/structured-data/article |
| Páginas interiores | `BreadcrumbList` con `itemListElement` (position, name, item) | Soportado por Google | https://developers.google.com/search/docs/appearance/structured-data/breadcrumb |

Validar con el Rich Results Test (https://search.google.com/test/rich-results) y con la Inspección de URL tras el deploy.

El `author` de BlogPosting debe apuntar a la misma Person por `@id`, para unir el changelog con la entidad.

### 4.4 Imágenes y Open Graph

- Imágenes: nombres de archivo descriptivos, `alt` útil, formatos estándar; si localizas imágenes, traduce también los nombres de archivo (https://developers.google.com/search/docs/appearance/google-images).
- `og:site_name` lo considera el sistema de nombres de sitio (https://developers.google.com/search/docs/appearance/site-names). Rellenar `og:title`, `og:description`, `og:image` (1200x630 es convención, no requisito de Google), `og:locale` y `og:locale:alternate` para es/en (estimación mía; OG no es de Google).
- Una imagen social por página que valga la pena compartir; la imagen del logo en `Organization` debe ser rastreable por Google.

---

## 5. Búsqueda con IA y descubribilidad para LLMs

### 5.1 llms.txt: estado

- Google: lo ignora y lo dice en su guía oficial: "You don't need to create new machine readable files, AI text files, markup, or Markdown ... as Google Search itself doesn't use them. ... It's completely fine if you decide to create and maintain LLMS.txt files ... Doing so will neither harm nor help your site's visibility or rankings in Google Search" (https://developers.google.com/search/docs/fundamentals/ai-optimization-guide). [NUEVO] La guía es de mayo de 2026 (https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing). La sección específica de llms.txt se añadió el 15 jun 2026 según fuente secundaria (https://www.digitalapplied.com/blog/google-llms-txt-no-seo-value-lighthouse-audit-2026); el texto aparece en la guía actual.
- John Mueller (jun 2026): los sistemas LLM no pueden usar archivos autodeclarados para diferenciar sitios; ve un papel estrecho cuando un agente ya está dentro del sitio. Estima que un formato para agentes puede tardar 6 a 12 meses o más en asentarse (https://www.searchenginejournal.com/googles-mueller-says-llms-txt-cant-help-llms-differentiate-sites/579304/).
- Adopción: un estudio de SE Ranking sobre 300,000 dominios no halló relación entre adoptar llms.txt y la frecuencia de citas en respuestas de LLM (citado en el artículo de SEJ de arriba; original https://seranking.com/blog/llms-txt/, solo leí el snippet). Adoptantes conocidos son documentación de desarrolladores (Anthropic, Stripe, Cloudflare, Vercel, Supabase), de fuente secundaria (digitalapplied, arriba).
- [NUEVO, fuente secundaria] Chrome Lighthouse 13.3 (7 may 2026) incluye una auditoría de llms.txt en la categoría "Agentic Browsing"; la ausencia del archivo da N/A, no falla (digitalapplied, arriba; no verifiqué la doc de Chrome).
- Veredicto: ninguno de los dos sitios es documentación de desarrolladores. Opcional, P2, 15 minutos, archivo corto con H1, resumen y enlaces. No llms-full.txt.

### 5.2 robots.txt para bots de IA

Cada empresa publica sus agentes; separar entrenamiento de búsqueda/citas es la decisión clave.

| Agente | Función | Fuente primaria |
|---|---|---|
| OAI-SearchBot | Aparecer en la búsqueda de ChatGPT. Si lo bloqueas, no sales en respuestas de búsqueda de ChatGPT (puedes salir solo como enlace de navegación) | https://developers.openai.com/api/docs/bots |
| GPTBot | Rastreo para entrenar modelos de OpenAI | misma |
| ChatGPT-User | Acciones iniciadas por usuario; "robots.txt rules may not apply" | misma |
| Claude-SearchBot | Mejora los resultados de búsqueda de Claude | https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler (act. 7 abr 2026) |
| Claude-User | Accesos iniciados por usuario | misma |
| ClaudeBot | Recolección para entrenamiento | misma |
| PerplexityBot | Mostrar y enlazar sitios en la búsqueda de Perplexity; no se usa para entrenar | https://docs.perplexity.ai/guides/bots |
| Perplexity-User | Acciones del usuario; "generally ignores robots.txt" | misma |
| Google-Extended | Token de control para usar contenido en el entrenamiento y grounding de Gemini; no afecta a Search ni es señal de ranking; no tiene user agent HTTP propio | https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers |
| Googlebot | Búsqueda de Google y base de AI Overviews / AI Mode | https://developers.google.com/search/docs/appearance/ai-features |

Recomendación (opinión mía): para un portafolio y un laboratorio cuyo objetivo es ser encontrado, dejar permitidos los agentes de búsqueda y de usuario (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Googlebot, Bingbot). El bloqueo de entrenamiento (GPTBot, ClaudeBot, Google-Extended) es decisión de Antonio sobre contenido propio; bloquear Google-Extended no cambia la posición en Search. Permitir todo es el robots.txt más simple: `User-agent: *` / `Allow: /` + `Sitemap:`.

Ojo con Cloudflare: Perplexity advierte que si hay WAF puede ser necesario permitir sus bots (https://docs.perplexity.ai/guides/bots, sección WAF/Cloudflare). Si los registros están en modo proxied, revisar en Cloudflare las reglas de bots e IA que puedan bloquear estos agentes; no verifiqué qué ofrece Cloudflare hoy ni cómo está configurada la zona: UNKNOWN. Si los registros apuntan DNS only a Vercel, esto no aplica.

Los cambios de robots.txt tardan unas 24 horas en reflejarse en OpenAI y Perplexity (fuentes primarias arriba).

### 5.3 Qué influye de verdad en ser citado

Lo documentado:
- Para Google: la página debe estar indexada y ser elegible para snippet; "There are no additional technical requirements" (https://developers.google.com/search/docs/appearance/ai-features). Las funciones de IA usan RAG sobre el índice de Search y "query fan-out" (https://developers.google.com/search/docs/fundamentals/ai-optimization-guide). Contenido único, punto de vista propio, primera mano pesa más que cualquier otra sugerencia (misma guía).
- Google desaconseja perder tiempo en: llms.txt, "chunking", reescribir solo para IA, menciones inauténticas, obsesionarse con datos estructurados (misma guía, sección "Mythbusting").
- Para Microsoft: citas en Copilot se miden en Bing Webmaster Tools; Bing "respects all content owner preferences expressed through robots.txt" (https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/).
- Para OpenAI y Perplexity: permitir sus bots de búsqueda y que el HTML sea accesible.

Lo que no es primario y debe tomarse con cautela: estudios de citaciones por plataforma, por ejemplo 5W sobre 680 millones de citas (https://www.5wpr.com/research/state-of-ai-citations-2026/), que son de agencias de RP. Tendencia compartida: las respuestas citan mucho a terceros (reseñas, foros, comparativas) y no solo el sitio oficial. Para estos sitios, esto apoya que las menciones externas y los perfiles consistentes (sección 3) pesen tanto como el sitio.

Conclusión práctica: HTML completo y rastreable (ya resuelto con Astro estático), indexado en Google y en Bing, contenido propio con nombre completo y descriptor, perfiles externos coherentes, sin bloquear los bots de búsqueda.

---

## 6. Medición

### 6.1 Qué registrar antes del lanzamiento (hoy)

Guardar en una hoja con fecha:
1. Search Console: crear las propiedades hoy. Anotar el estado de Page indexing de lo que exista, y el número de URLs indexadas.
2. `site:iteris.tech` y `site:dpeluche.dev` en Google y Bing (conteo aproximado; es una estimación, no un dato exacto). Capturas de pantalla.
3. Posición actual en incógnito, ubicación México, idioma inglés y español, de: "iteris", "iteris guadalajara", "iteris tech", "iteris lab", "Antonio Martínez Quintero", "Antonio Martinez Quintero Plerk", "dPeluChe", "dPeluChe Iteris". Anotar quién ocupa el primer lugar (Iteris Inc., D'Peluche).
4. Lista de URLs viejas con tráfico o enlaces entrantes (sección 2).
5. Lighthouse / PageSpeed Insights del sitio actual y del nuevo en staging.
6. Respuestas de curl del estado actual: `-I` a apex, www, `/robots.txt`, `/sitemap-index.xml`, una ruta inexistente. Guardar el 307 actual.
7. Línea base de IA: preguntar a ChatGPT, Claude, Perplexity y Gemini "¿Qué es Iteris, el laboratorio de Guadalajara?" y "¿Quién es Antonio Martínez Quintero de Iteris?"; guardar respuestas y citas. Es cualitativo; resultado variable (estimación mía).

### 6.2 Números que importan

| Métrica | Dónde | Por qué |
|---|---|---|
| URLs indexadas / enviadas | Sitemaps y Page indexing | Meta de éxito inmediato: cercana al 100% de ~24 y ~29 |
| Razones de no indexación | Page indexing | Detecta soft 404, noindex, duplicados |
| Impresiones totales y por página | Rendimiento | Indica que Google empezó a mostrar el sitio |
| Impresiones y posición de consultas de marca | Rendimiento + filtro de marca (https://developers.google.com/search/blog/2025/11/search-console-branded-filter) | La métrica real para estos sitios; son sitios de marca y de persona |
| Clics y CTR de marca | Rendimiento | Con pocas impresiones, lo leve es ruido |
| Impresiones en IA generativa | Reporte de IA generativa (https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) | Primera medición oficial de AI Overviews / AI Mode |
| Citas en IA | Bing AI Performance | Visibilidad en Copilot |
| Core Web Vitals | web.dev + CrUX | LCP 2.5 s, INP 200 ms, CLS 0.1 (https://web.dev/articles/vitals) |
| Tráfico desde buscadores de IA | Analytics (referrers chatgpt.com, perplexity.ai, etc.) | Estimación mía; no hay un reporte oficial unificado |

Evitar métricas de vanidad como la "posición media" global con muy pocas impresiones.

### 6.3 Plazos realistas

Basados en las fuentes de 1.8 más estimación propia:
- Día 0 a 7: sitemap procesado; primeras URLs indexadas; Inspección de URL muestra HTML completo.
- Semanas 2 a 4: mayoría de URLs indexadas; primeras impresiones en consultas de marca con modificador.
- Semanas 4 a 8: consultas de marca estables; visible el rango real para "Antonio Martínez Quintero" y "iteris guadalajara".
- Meses 3 a 6: decide si los perfiles externos y las menciones mejoraron la desambiguación; el panel de conocimiento, si llega, no es controlable (https://support.google.com/knowledgepanel/answer/9787176?hl=en).
- Redirects activos al menos 1 año.

Qué NO prometer: ganar la consulta "iteris" pelada contra Iteris Inc., o un panel de conocimiento en una fecha concreta.

---

## 7. Lista de acciones priorizadas

Esfuerzo: S = menos de 1 hora, M = 1 a 4 horas, L = más de 4 horas.

### 7.1 iteris.tech (EN por defecto, ES en /es, ~24 URLs, host canónico www)

| Prioridad | Acción | Esf. | Fuente |
|---|---|---|---|
| P0 | Crear propiedad de Dominio en Search Console con TXT en Cloudflare (`@`), 2 propietarios | S | https://support.google.com/webmasters/answer/9008080 ; https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes |
| P0 | Registrar línea base antes del deploy (site:, consultas de marca, curl de estado actual) | S | sección 6.1 |
| P0 | Cambiar el redirect apex a www de 307 a 308 (verificar si el redirect de dominio de Vercel lo permite; si no, regla en `vercel.json`) | S | https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes ; https://vercel.com/docs/routing/redirects |
| P0 | `sitemap-index.xml` con las ~24 URLs `www`, línea `Sitemap:` en robots.txt, envío en Search Console | S | https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap |
| P0 | hreflang en/es reciprocal con autorreferencia y x-default; canonical autorreferenciado `www` por idioma | M | https://developers.google.com/search/docs/specialty/international/localized-versions |
| P0 | Verificar con curl que el 404 devuelve estado 404, que `robots.txt` no bloquea y que no hay noindex heredado | S | https://developers.google.com/crawling/docs/troubleshooting/http-status-codes ; site-move doc |
| P0 | Probar con Inspección de URL (prueba en vivo) home, /es, un servicio y contacto; solicitar indexación de esas | S | https://support.google.com/webmasters/answer/9012289 ; https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl |
| P0 | Mapa de URLs viejas indexadas y redirects 301/308 directos; 404/410 para lo que no migra | S a M | https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes |
| P1 | Title/description por página con descriptor fijo "Product and technology lab in Guadalajara" | M | https://developers.google.com/search/docs/appearance/title-link |
| P1 | JSON-LD `WebSite` (name, alternateName) + `Organization` (address, sameAs, founder) + `BreadcrumbList` | M | https://developers.google.com/search/docs/appearance/site-names ; .../structured-data/organization ; .../breadcrumb |
| P1 | Perfiles externos (LinkedIn empresa, GitHub org, Crunchbase) con mismo nombre, descriptor, ciudad y enlace al sitio; enlazarlos en `sameAs` | M | https://developers.google.com/search/docs/appearance/establish-business-details |
| P1 | Importar a Bing Webmaster Tools desde Search Console | S | https://blogs.bing.com/webmaster/2025/6/Start-Using-Bing-Webmaster-Tools-to-Improve-Your-Site-Visibility/ |
| P1 | Dejar permitidos los bots de búsqueda de IA en robots.txt; revisar que Cloudflare no los bloquee si está proxied | S | https://developers.openai.com/api/docs/bots ; https://docs.perplexity.ai/guides/bots |
| P1 | Página de equipo/acerca con enlace a dpeluche.dev y Person del fundador | S | sección 3.7 |
| P1 | OG completo (`og:site_name`, `og:locale`, imagen) y alt de imágenes | S | https://developers.google.com/search/docs/appearance/site-names ; https://developers.google.com/search/docs/appearance/google-images |
| P1 | Revisión semanal 1: Sitemaps, Page indexing, 4 URLs; mes 1: rendimiento con filtro de marca | S | sección 1.7 |
| P2 | Decidir sobre Google Business Profile solo si hay atención presencial y dirección verificable | S (decisión) / M (alta) | https://support.google.com/business/answer/13763036?hl=en |
| P2 | IndexNow en el pipeline posterior al deploy | S | https://www.indexnow.org/documentation |
| P2 | `llms.txt` corto, opcional | S | https://developers.google.com/search/docs/fundamentals/ai-optimization-guide |
| P2 | Revisar Bing AI Performance y el reporte de IA generativa de Google mensualmente | S | https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/ |
| P2 | Contenido propio recurrente (casos, notas técnicas) que dé citabilidad | L | https://developers.google.com/search/docs/fundamentals/ai-optimization-guide |

### 7.2 dpeluche.dev (solo inglés, ~29 URLs, persona)

| Prioridad | Acción | Esf. | Fuente |
|---|---|---|---|
| P0 | Crear propiedad de Dominio con TXT en Cloudflare, 2 propietarios | S | https://support.google.com/webmasters/answer/9008080 |
| P0 | Decidir host canónico (www o apex) y redirigir el otro con 308; usarlo en canonical, sitemap, JSON-LD y enlaces | S | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls |
| P0 | Línea base previa: site:, consultas "Antonio Martínez Quintero", "dPeluChe", curl actual | S | sección 6.1 |
| P0 | `sitemap-index.xml` con ~29 URLs, línea `Sitemap:` en robots.txt y envío | S | https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap |
| P0 | Probar con Inspección de URL home, un proyecto y un post; solicitar indexación de esas; confirmar 404 real y que no queda noindex | S | https://support.google.com/webmasters/answer/9012289 |
| P0 | Mapa de URLs viejas a nuevas (mantener URLs si se puede), 301/308 directos | S | https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes |
| P1 | Home con nombre completo en title, H1 y `Person.name`; `alternateName` con "dPeluChe" y la versión sin acentos | S | https://developers.google.com/search/docs/appearance/site-names ; https://schema.org/Person |
| P1 | JSON-LD `ProfilePage` + `Person` (jobTitle, worksFor al `@id` de Iteris, knowsAbout, sameAs reales) | M | https://developers.google.com/search/docs/appearance/structured-data/profile-page |
| P1 | `BlogPosting` en cada post de changelog (author = misma Person) y `BreadcrumbList` en interiores | M | https://developers.google.com/search/docs/appearance/structured-data/article ; .../breadcrumb |
| P1 | Proyectos con `CreativeWork` o `SoftwareSourceCode`; no usar `SoftwareApplication` sin calificación o reseña real | S | https://developers.google.com/search/docs/appearance/structured-data/software-app |
| P1 | Enlace visible y reciproco con iteris.tech; perfiles externos coherentes (LinkedIn, GitHub) que enlacen al sitio | S | sección 3.7 |
| P1 | Importar a Bing Webmaster Tools; robots.txt que permita bots de búsqueda de IA | S | Bing blog (arriba) ; docs de OpenAI y Perplexity |
| P1 | Title/description por página y OG con imagen | M | https://developers.google.com/search/docs/appearance/title-link |
| P2 | Reclamar el panel de conocimiento si Google lo genera para el nombre; no se puede forzar | S | https://support.google.com/knowledgepanel/answer/7534902?hl=en-PH |
| P2 | IndexNow en cada deploy del changelog (sirve para Bing y otros, no Google) | S | https://www.indexnow.org/documentation |
| P2 | `llms.txt` opcional | S | https://developers.google.com/search/docs/fundamentals/ai-optimization-guide |
| P2 | Publicar notas técnicas propias del changelog con experiencia de primera mano | L | https://developers.google.com/search/docs/fundamentals/ai-optimization-guide |
| P2 | Revisión mensual: filtro de marca, reporte de IA generativa de Google y Bing AI Performance | S | https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports |

---

## Apéndice: lagunas y puntos no verificados

- No leí las páginas del panel de Cloudflare ni de Vercel de este proyecto; todo lo del setup actual es UNKNOWN o viene del brief.
- La opción de elegir código de redirect (301/308) en el redirect de dominio del panel de Vercel: el texto que obtuve de la doc estaba truncado; confirmé que los redirects por reglas admiten 307 y 308 (https://vercel.com/docs/routing/redirects/bulk-redirects/getting-started).
- Los umbrales de datos mínimos de CrUX para que aparezca Core Web Vitals en Search Console: no encontré cifra primaria.
- Las fechas del 15 jun 2026 (sección llms.txt de la guía) y del lanzamiento de Lighthouse 13.3 vienen de una fuente secundaria; el texto de la guía de Google sí lo verifiqué en primaria.
- El detalle de "Intents, Topics, Citation Share y Compare" de Bing lo conozco solo por el snippet del buscador.
- Estudios de citación de IA: secundarios y de vendedores; tratar como dirección, no como regla.
- Disponibilidad de "Claim knowledge panel": depende de que Google genere antes el panel; no controlable.
- Este documento no examina el código de los sitios Astro; no revisé la configuración real del integration de sitemap ni el layout.
