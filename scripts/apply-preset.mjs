#!/usr/bin/env node
// Applies a targeted vertical layout preset to src/content/pages/<locale>/index.json
// and adjusts site features accordingly.
//
// Usage:
//   npm run preset:saas
//   npm run preset:services
//   npm run preset:local
//   npm run preset:leadgen
//   node scripts/apply-preset.mjs <preset-name>
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES_DIR = join(ROOT, 'src', 'content', 'pages');
const SITE_DIR = join(ROOT, 'src', 'content', 'site');

const TODO = 'TODO';
const filler = (what) =>
  `${TODO}: ${what}. Reemplaza este texto con la información real de tu proyecto o cliente.`;

// Exported so tests/presets.test.ts and scripts/verify-clone.mjs enumerate the
// same list this CLI applies — no second copy to drift.
export const PRESETS = {
  saas: {
    name: 'SaaS / Digital Product',
    description: 'Hero split + Logos + Bento features + Pricing with annual toggle + Comparison + FAQ + CTA',
    siteFeatures: {
      stickyMobileCta: { enabled: true, label: 'Get Started', href: '#pricing' },
    },
    sections: (locale) => [
      {
        type: 'hero',
        layout: 'split-left',
        badge: { text: locale === 'es' ? 'Novedad v2.0 disponible' : 'New v2.0 is live', icon: 'sparkles' },
        title: locale === 'es' ? `${TODO}: La plataforma para escalar tu negocio` : `${TODO}: The all-in-one platform to scale your workflow`,
        titleHighlight: locale === 'es' ? 'escalar tu negocio' : 'scale your workflow',
        subtitle: filler(locale === 'es' ? 'Una frase concisa sobre la propuesta de valor de tu producto' : 'A clear sentence explaining the unique value of your SaaS'),
        actions: [
          { label: locale === 'es' ? 'Empezar prueba gratis' : 'Start free trial', href: '#pricing', variant: 'primary' },
          { label: locale === 'es' ? 'Ver demo' : 'Watch demo', href: '#features', variant: 'secondary', icon: 'play' },
        ],
      },
      {
        type: 'logos',
        title: locale === 'es' ? 'Equipos que confían en nosotros' : 'Trusted by leading teams worldwide',
        grayscale: true,
        items: [
          { name: 'Empresa A', logo: { src: '../../../assets/brand/logo.svg', alt: 'Empresa A' } },
          { name: 'Empresa B', logo: { src: '../../../assets/brand/logo.svg', alt: 'Empresa B' } },
          { name: 'Empresa C', logo: { src: '../../../assets/brand/logo.svg', alt: 'Empresa C' } },
        ],
      },
      {
        type: 'bento',
        title: locale === 'es' ? 'Funcionalidades diseñadas para crecer' : 'Features built for high performance',
        subtitle: filler(locale === 'es' ? 'Resumen de las características clave del producto' : 'Overview of the key benefits'),
        items: [
          {
            title: locale === 'es' ? 'Automatización inteligente' : 'Smart Automation',
            description: filler(locale === 'es' ? 'Ahorra horas cada semana automatizando procesos repetitivos' : 'Save hours every week with automated workflows'),
            icon: 'cpu',
            tag: 'Core',
            colSpan: 2,
          },
          {
            title: locale === 'es' ? 'Métricas en tiempo real' : 'Real-time Analytics',
            description: filler(locale === 'es' ? 'Visualiza el rendimiento de tus operaciones al instante' : 'Live dashboards and insights'),
            icon: 'bar-chart-3',
            colSpan: 1,
          },
          {
            title: locale === 'es' ? 'Seguridad empresarial' : 'Enterprise Security',
            description: filler(locale === 'es' ? 'Cifrado de extremo a extremo y cumplimiento estricto' : 'End-to-end encryption and compliance'),
            icon: 'shield-check',
            colSpan: 1,
          },
          {
            title: locale === 'es' ? 'Integraciones sin fricción' : 'Frictionless Integrations',
            description: filler(locale === 'es' ? 'Conecta con tus herramientas favoritas en un par de clics' : 'Connect seamlessly with your existing stack'),
            icon: 'zap',
            colSpan: 2,
          },
        ],
      },
      {
        type: 'pricing',
        anchor: 'pricing',
        title: locale === 'es' ? 'Planes transparentes' : 'Simple, transparent pricing',
        subtitle: filler(locale === 'es' ? 'Sin comisiones ocultas ni sorpresas' : 'Choose the plan that fits your business'),
        billingToggle: {
          monthlyLabel: locale === 'es' ? 'Mensual' : 'Monthly',
          yearlyLabel: locale === 'es' ? 'Anual' : 'Yearly',
          discountNote: locale === 'es' ? '-20% dto.' : 'Save 20%',
        },
        plans: [
          {
            name: 'Starter',
            price: '$29',
            period: locale === 'es' ? 'mes' : 'mo',
            yearlyPrice: '$24',
            periodYearly: locale === 'es' ? 'mes' : 'mo',
            description: filler(locale === 'es' ? 'Ideal para profesionales y equipos pequeños' : 'For solo builders and small teams'),
            features: [
              locale === 'es' ? 'Hasta 5 proyectos' : 'Up to 5 projects',
              locale === 'es' ? 'Soporte estándar' : 'Standard support',
              locale === 'es' ? 'Analítica básica' : 'Basic analytics',
            ],
            featured: false,
            action: { label: locale === 'es' ? 'Elegir Starter' : 'Choose Starter', href: '#', variant: 'secondary' },
          },
          {
            name: 'Pro',
            price: '$79',
            period: locale === 'es' ? 'mes' : 'mo',
            yearlyPrice: '$63',
            periodYearly: locale === 'es' ? 'mes' : 'mo',
            description: filler(locale === 'es' ? 'Para empresas que buscan maximizar resultados' : 'For scaling teams and growing businesses'),
            features: [
              locale === 'es' ? 'Proyectos ilimitados' : 'Unlimited projects',
              locale === 'es' ? 'Soporte prioritario 24/7' : '24/7 Priority support',
              locale === 'es' ? 'Analítica avanzada y exportación' : 'Advanced analytics',
              locale === 'es' ? 'Acceso a API' : 'Full API access',
            ],
            featured: true,
            action: { label: locale === 'es' ? 'Comenzar con Pro' : 'Get Started with Pro', href: '#', variant: 'primary' },
          },
        ],
      },
      {
        type: 'comparison',
        title: locale === 'es' ? 'Comparativa detallada' : 'Feature Comparison',
        subtitle: filler(locale === 'es' ? 'Todo lo que incluye cada plan' : 'Compare plans side by side'),
        headers: ['Característica', 'Starter', 'Pro'],
        rows: [
          { feature: locale === 'es' ? 'Usuarios incluidos' : 'Users included', values: ['1 usuario', 'Ilimitados'] },
          { feature: locale === 'es' ? 'Almacenamiento en la nube' : 'Cloud Storage', values: ['10 GB', '100 GB'] },
          { feature: locale === 'es' ? 'Dominio personalizado' : 'Custom Domain', values: [false, true] },
          { feature: locale === 'es' ? 'SLA garantizado 99.9%' : 'Uptime SLA 99.9%', values: [false, true] },
        ],
      },
      {
        type: 'faq',
        title: locale === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions',
        items: [
          {
            question: locale === 'es' ? '¿Puedo cancelar mi suscripción en cualquier momento?' : 'Can I cancel anytime?',
            answer: filler(locale === 'es' ? 'Sí, puedes cancelar o cambiar de plan cuando lo desees desde tu panel.' : 'Yes, you can cancel or upgrade your plan anytime without lock-in.'),
          },
          {
            question: locale === 'es' ? '¿Ofrecen periodo de prueba gratuito?' : 'Is there a free trial?',
            answer: filler(locale === 'es' ? 'Ofrecemos 14 días de prueba con todas las funciones desbloqueadas.' : 'We offer a 14-day free trial with full access to all features.'),
          },
        ],
        jsonLd: true,
      },
      {
        type: 'cta',
        title: locale === 'es' ? '¿Listo para empezar a transformar tu negocio?' : 'Ready to scale your business today?',
        subtitle: filler(locale === 'es' ? 'Únete a cientos de empresas que ya optimizan sus procesos.' : 'Join hundreds of teams already building faster.'),
        actions: [{ label: locale === 'es' ? 'Crear cuenta gratis' : 'Create Free Account', href: '#pricing', variant: 'primary' }],
      },
    ],
  },

  services: {
    name: 'Professional Services / Agency',
    description: 'Hero centered + Stats + Services Grid + How It Works + Projects + Testimonials + Team + Contact Form',
    siteFeatures: {
      floatingContact: { enabled: true, platform: 'whatsapp', label: 'WhatsApp' },
    },
    sections: (locale) => [
      {
        type: 'hero',
        layout: 'centered',
        badge: { text: locale === 'es' ? 'Servicios Profesionales' : 'Professional Agency', icon: 'award' },
        title: locale === 'es' ? `${TODO}: Soluciones estratégicas de alto impacto` : `${TODO}: High-impact strategic solutions for your brand`,
        titleHighlight: locale === 'es' ? 'alto impacto' : 'high-impact',
        subtitle: filler(locale === 'es' ? 'Ayudamos a empresas líderes a alcanzar sus objetivos de negocio con precisión' : 'We help brands innovate and grow with tailored solutions'),
        actions: [
          { label: locale === 'es' ? 'Agendar consulta gratuita' : 'Book a discovery call', href: '#contact', variant: 'primary' },
          { label: locale === 'es' ? 'Ver servicios' : 'Explore services', href: '#services', variant: 'secondary' },
        ],
      },
      {
        type: 'stats',
        items: [
          { value: '150+', label: locale === 'es' ? 'Proyectos entregados' : 'Projects delivered' },
          { value: '98%', label: locale === 'es' ? 'Clientes satisfechos' : 'Satisfaction rate' },
          { value: '8 años', label: locale === 'es' ? 'De experiencia' : 'Years of experience' },
        ],
      },
      {
        type: 'services',
        anchor: 'services',
        title: locale === 'es' ? 'Nuestros Servicios' : 'Our Services',
        subtitle: filler(locale === 'es' ? 'Especialidades diseñadas para resolver tus mayores desafíos' : 'Tailored solutions designed for your needs'),
        items: [
          { icon: 'target', title: locale === 'es' ? 'Consultoría Estratégica' : 'Strategic Advisory', description: filler('Asesoría experta paso a paso') },
          { icon: 'code', title: locale === 'es' ? 'Desarrollo a Medida' : 'Custom Development', description: filler('Arquitecturas modernas y escalables') },
          { icon: 'trending-up', title: locale === 'es' ? 'Optimización & Crecimiento' : 'Growth & Performance', description: filler('Mejora continua y resultados medibles') },
        ],
      },
      {
        type: 'howItWorks',
        title: locale === 'es' ? 'Metodología de Trabajo' : 'How We Work',
        steps: [
          { icon: 'search', title: locale === 'es' ? '1. Diagnóstico' : '1. Discovery', description: filler('Evaluamos tu situación actual') },
          { icon: 'sliders-horizontal', title: locale === 'es' ? '2. Ejecución' : '2. Implementation', description: filler('Desarrollo ágil con entregas periódicas') },
          { icon: 'circle-check-big', title: locale === 'es' ? '3. Entrega & Soporte' : '3. Launch & Support', description: filler('Lanzamiento y acompañamiento continuo') },
        ],
      },
      {
        type: 'testimonials',
        title: locale === 'es' ? 'Lo que dicen nuestros clientes' : 'Client Testimonials',
        items: [
          {
            quote: filler(locale === 'es' ? 'El equipo entendió exactamente lo que necesitábamos y superó nuestras expectativas.' : 'Working with them transformed our digital presence completely.'),
            name: 'Carlos Mendoza',
            role: 'Director General, Grupo Horizonte',
            initials: 'CM',
          },
        ],
      },
      {
        type: 'contactForm',
        anchor: 'contact',
        title: locale === 'es' ? 'Hablemos de tu proyecto' : 'Let\'s talk about your project',
        subtitle: filler(locale === 'es' ? 'Cuéntanos qué necesitas y te responderemos en menos de 24 horas' : 'Send us a message and we will respond within 24 hours'),
        submitLabel: locale === 'es' ? 'Enviar mensaje' : 'Send message',
        successMessage: locale === 'es' ? 'Gracias. Nos pondremos en contacto contigo pronto.' : 'Thank you! We will get in touch shortly.',
        errorMessage: locale === 'es' ? 'Ocurrió un error al enviar. Por favor intenta de nuevo.' : 'An error occurred. Please try again.',
        extraFields: [],
      },
    ],
  },

  local: {
    name: 'Local Business / Medical / Retail',
    description: 'Hero with WhatsApp CTA + Services + Location/Map/Hours + Testimonials + FAQ + Contact',
    siteFeatures: {
      floatingContact: { enabled: true, platform: 'whatsapp', label: 'Escríbenos por WhatsApp' },
      stickyMobileCta: { enabled: true, label: 'Agendar cita', href: '#contact' },
    },
    sections: (locale) => [
      {
        type: 'hero',
        layout: 'split-left',
        badge: { text: locale === 'es' ? 'Atención personalizada' : 'Personalized care', icon: 'map-pin' },
        title: locale === 'es' ? `${TODO}: Calidad y confianza en tu ciudad` : `${TODO}: Professional local care and quality`,
        titleHighlight: locale === 'es' ? 'confianza' : 'quality',
        subtitle: filler(locale === 'es' ? 'Horarios flexibles, ubicación céntrica y los mejores especialistas' : 'Convenient location, expert attention and top service'),
        actions: [
          { label: locale === 'es' ? 'Contactar por WhatsApp' : 'Contact on WhatsApp', href: '#contact', variant: 'primary', icon: 'message-circle' },
          { label: locale === 'es' ? 'Cómo llegar' : 'Find us', href: '#location', variant: 'secondary', icon: 'map-pin' },
        ],
      },
      {
        type: 'services',
        title: locale === 'es' ? 'Nuestras Especialidades' : 'Our Services',
        items: [
          { icon: 'circle-check', title: locale === 'es' ? 'Atención Inmediata' : 'Prompt Attention', description: filler('Citas puntuales y sin esperas') },
          { icon: 'award', title: locale === 'es' ? 'Especialistas Certificados' : 'Certified Experts', description: filler('Años de experiencia comprobada') },
          { icon: 'shield', title: locale === 'es' ? 'Instalaciones Modernas' : 'Modern Facilities', description: filler('Equipamiento de última generación') },
        ],
      },
      {
        type: 'location',
        anchor: 'location',
        title: locale === 'es' ? 'Ubicación y Horarios' : 'Location & Business Hours',
        subtitle: filler(locale === 'es' ? 'Te esperamos en nuestras instalaciones' : 'Visit us at our central office'),
        showBusinessInfo: true,
      },
      {
        type: 'faq',
        title: locale === 'es' ? 'Preguntas Frecuentes' : 'Frequently Asked Questions',
        items: [
          {
            question: locale === 'es' ? '¿Cuentan con estacionamiento?' : 'Do you have parking available?',
            answer: filler(locale === 'es' ? 'Sí, contamos con estacionamiento propio para nuestros clientes.' : 'Yes, free customer parking is available.'),
          },
          {
            question: locale === 'es' ? '¿Qué métodos de pago aceptan?' : 'What payment methods do you accept?',
            answer: filler(locale === 'es' ? 'Aceptamos tarjetas de crédito, débito, transferencias y efectivo.' : 'We accept credit/debit cards, transfers and cash.'),
          },
        ],
        jsonLd: true,
      },
      {
        type: 'contactForm',
        anchor: 'contact',
        title: locale === 'es' ? 'Agenda tu cita o consulta' : 'Book an Appointment',
        subtitle: filler(locale === 'es' ? 'Completa el formulario y confirmaremos tu fecha.' : 'Fill in your details to book your visit.'),
        submitLabel: locale === 'es' ? 'Solicitar Cita' : 'Request Appointment',
        successMessage: locale === 'es' ? '¡Solicitud recibida! Te contactaremos para confirmar.' : 'Appointment requested! We will reach out shortly.',
        errorMessage: locale === 'es' ? 'Error al enviar la solicitud.' : 'Error sending request.',
        extraFields: [
          { name: 'phone', label: locale === 'es' ? 'Teléfono' : 'Phone Number', type: 'tel', required: true },
        ],
      },
    ],
  },

  leadgen: {
    name: 'High-Conversion Lead Generation',
    description: 'Hero split + Sticky CTA + Stats + Bento Features + Testimonials + FAQ + Contact',
    siteFeatures: {
      stickyMobileCta: { enabled: true, label: 'Solicitar Información', href: '#contact' },
    },
    sections: (locale) => [
      {
        type: 'hero',
        layout: 'split-left',
        badge: { text: locale === 'es' ? 'Cupos Limitados' : 'Limited Spots', icon: 'flame' },
        title: locale === 'es' ? `${TODO}: Consigue resultados comprobados en menos tiempo` : `${TODO}: Get verified results in record time`,
        titleHighlight: locale === 'es' ? 'resultados comprobados' : 'verified results',
        subtitle: filler(locale === 'es' ? 'Una solución directa para resolver tu problema principal hoy mismo' : 'A direct solution to your core challenge'),
        actions: [
          { label: locale === 'es' ? 'Solicitar información' : 'Get free info', href: '#contact', variant: 'primary' },
        ],
      },
      {
        type: 'stats',
        items: [
          { value: '3x', label: locale === 'es' ? 'Mayor eficiencia' : 'Higher efficiency' },
          { value: '500+', label: locale === 'es' ? 'Casos de éxito' : 'Success stories' },
          { value: '< 24h', label: locale === 'es' ? 'Tiempo de respuesta' : 'Response time' },
        ],
      },
      {
        type: 'bento',
        title: locale === 'es' ? '¿Por qué elegir nuestra solución?' : 'Why choose our solution?',
        items: [
          { title: locale === 'es' ? 'Garantía de Satisfacción' : 'Satisfaction Guarantee', description: filler('Resultados tangibles desde la primera semana'), icon: 'shield-check', colSpan: 2 },
          { title: locale === 'es' ? 'Acompañamiento 1 a 1' : '1-on-1 Support', description: filler('Soporte directo y personalizado'), icon: 'user-check', colSpan: 1 },
          { title: locale === 'es' ? 'Metodología Probada' : 'Proven Process', description: filler('Estructura clara y sin improvisación'), icon: 'layers', colSpan: 3 },
        ],
      },
      {
        type: 'faq',
        title: locale === 'es' ? 'Preguntas Frecuentes' : 'FAQ',
        items: [
          {
            question: locale === 'es' ? '¿Para quién es esta solución?' : 'Who is this for?',
            answer: filler(locale === 'es' ? 'Diseñado para empresas y profesionales que buscan acelerar su crecimiento.' : 'For teams and professionals ready to scale.'),
          },
          {
            question: locale === 'es' ? '¿Cómo es el proceso después de registrarme?' : 'What happens after signing up?',
            answer: filler(locale === 'es' ? 'Nos contactamos contigo para entender tus necesidades y coordinar el siguiente paso.' : 'We reach out to schedule an onboarding call.'),
          },
        ],
        jsonLd: true,
      },
      {
        type: 'contactForm',
        anchor: 'contact',
        title: locale === 'es' ? 'Solicita tu diagnóstico gratuito' : 'Get your free assessment',
        submitLabel: locale === 'es' ? 'Enviar solicitud' : 'Submit request',
        successMessage: locale === 'es' ? 'Solicitud enviada con éxito.' : 'Request sent successfully.',
        errorMessage: locale === 'es' ? 'Error al enviar.' : 'Error sending request.',
        extraFields: [],
      },
    ],
  },
};

async function main() {
  const presetKey = process.argv[2]?.toLowerCase()?.replace(/^preset:/, '') || 'saas';

  if (!PRESETS[presetKey]) {
    console.error(`\n[preset] Unknown preset "${presetKey}". Available presets:\n`);
    for (const [key, val] of Object.entries(PRESETS)) {
      console.log(`  - ${key.padEnd(12)}: ${val.name} (${val.description})`);
    }
    console.log('\nUsage: npm run preset:<name> (e.g. npm run preset:saas)\n');
    process.exit(1);
  }

  const preset = PRESETS[presetKey];
  console.log(`\n📦 Applying preset: ${preset.name}...\n`);

  // 1. Update pages (<locale>/index.json)
  for (const locale of ['es', 'en']) {
    const pagePath = join(PAGES_DIR, locale, 'index.json');
    if (existsSync(pagePath)) {
      const pageData = JSON.parse(await readFile(pagePath, 'utf8'));
      pageData.sections = preset.sections(locale);
      await writeFile(pagePath, JSON.stringify(pageData, null, 2) + '\n', 'utf8');
      console.log(`✓ Updated ${locale}/index.json with ${pageData.sections.length} sections`);
    }
  }

  // 2. Update site features if preset specifies them
  if (preset.siteFeatures) {
    for (const locale of ['es', 'en']) {
      const sitePath = join(SITE_DIR, `${locale}.json`);
      if (existsSync(sitePath)) {
        const siteData = JSON.parse(await readFile(sitePath, 'utf8'));
        siteData.features = { ...siteData.features, ...preset.siteFeatures };
        await writeFile(sitePath, JSON.stringify(siteData, null, 2) + '\n', 'utf8');
        console.log(`✓ Updated features in site/${locale}.json`);
      }
    }
  }

  console.log(`\n✨ Preset "${presetKey}" applied successfully! Run \`npm run build && npm test\` to verify.\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('[preset] Error:', err);
    process.exit(1);
  });
}
