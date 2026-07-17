import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-green-600 hover:text-green-700">
            ← Volver a inicio
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos y Condiciones de uso de tiyuy</h1>
        <p className="text-sm text-gray-500 mb-10">
          Última actualización: 17 de julio de 2026.
        </p>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-10">
            Bienvenido(a) a tiyuy, la plataforma inmobiliaria de confianza para encontrar, vender o alquilar propiedades en Perú. Al acceder, navegar o usar el sitio web de tiyuy, aceptas estos Términos y Condiciones, así como las políticas complementarias publicadas en el sitio, incluyendo seguridad, antidiscriminación, discapacidad, cancelación, libro de reclamaciones y centro de soporte.
          </p>

          <div className="space-y-8">
            <Section num={1} title="Identificación del titular">
              <p>tiyuy es operado por <strong>LOPEZ SOFTWARE SOLUTIONS E.I.R.L.</strong>, con RUC <strong>20615573711</strong>, y utiliza como contacto el correo <a href="mailto:tiyuy@saberoconsulting.com" className="text-green-600 hover:underline">tiyuy@saberoconsulting.com</a> y el teléfono <a href="tel:+51923327532" className="text-green-600 hover:underline">+51 923 327 532</a> que figuran en el sitio.</p>
            </Section>

            <Section num={2} title="Objeto del servicio">
              <p>tiyuy es una plataforma digital de bienes raíces que permite a los usuarios explorar propiedades en venta y alquiler, publicar inmuebles, contactar anunciantes y acceder a contenido informativo relacionado con el mercado inmobiliario. La plataforma puede incluir categorías como casas, departamentos, terrenos, oficinas, locales comerciales y habitaciones, además de secciones para inmobiliarias, corredores, blog y servicios.</p>
            </Section>

            <Section num={3} title="Aceptación de uso">
              <p>Al usar tiyuy, declaras que has leído y entendido estos términos, y que tienes capacidad legal para aceptar obligaciones contractuales. Si usas la plataforma en nombre de una empresa, declaras que cuentas con autorización suficiente para vincularla a estos términos.</p>
            </Section>

            <Section num={4} title="Registro y cuentas">
              <p className="mb-3">Para ciertas funciones, como publicar un inmueble, administrar anuncios o acceder a herramientas específicas, tiyuy puede requerir una cuenta de usuario. El usuario se compromete a proporcionar información verdadera, actual y verificable, y a mantener la confidencialidad de sus credenciales de acceso.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                El usuario es responsable de toda actividad realizada desde su cuenta. tiyuy podrá suspender, limitar o cancelar cuentas ante uso fraudulento, información falsa, incumplimientos de políticas o riesgo para otros usuarios.
              </div>
            </Section>

            <Section num={5} title="Uso permitido">
              <p className="mb-3">tiyuy solo puede utilizarse para fines lícitos y relacionados con la compraventa, alquiler o promoción inmobiliaria. Queda prohibido:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
                <li>Publicar información falsa, engañosa, incompleta o duplicada.</li>
                <li>Suplantar identidad de terceros o publicar sin autorización.</li>
                <li>Cargar contenido ofensivo, discriminatorio, ilegal o fraudulento.</li>
                <li>Usar la plataforma para spam, phishing, captación ilícita o prácticas abusivas.</li>
                <li>Intentar vulnerar la seguridad del sitio o interferir con su funcionamiento.</li>
              </ul>
            </Section>

            <Section num={6} title="Publicación de inmuebles">
              <p className="mb-3">Al publicar un inmueble, el usuario declara que tiene derecho para anunciarlo o actuar en representación de quien sí lo tenga. tiyuy podrá revisar, moderar, ocultar o eliminar publicaciones que incumplan estas reglas, o que afecten la experiencia o seguridad de otros usuarios.</p>
              <p>El usuario debe describir de forma clara y veraz las condiciones del inmueble, incluyendo ubicación, precio, metraje, características, disponibilidad y cualquier limitación relevante. Las fotografías, textos y demás materiales aportados por el usuario deben corresponder con la realidad.</p>
            </Section>

            <Section num={7} title="Relación entre usuarios">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                tiyuy actúa como plataforma de intermediación tecnológica y no garantiza que una propiedad exista, esté disponible, mantenga el mismo precio o sea apta para un fin determinado. Las negociaciones, visitas, contratos, pagos, reservas y acuerdos entre usuarios se realizan bajo responsabilidad de las partes, salvo que tiyuy indique expresamente lo contrario en un servicio específico.
              </div>
            </Section>

            <Section num={8} title="Precios y disponibilidad">
              <p>Los precios, descripciones, condiciones y disponibilidad mostrados en la plataforma pueden variar sin previo aviso, ya que dependen de los anunciantes o propietarios. tiyuy no se hace responsable por errores tipográficos, diferencias de moneda, cambios de precio o publicaciones desactualizadas, aunque procurará corregirlas cuando sean detectadas.</p>
            </Section>

            <Section num={9} title="Pagos y servicios de pago">
              <p className="mb-3">Si tiyuy ofrece servicios pagos, como publicación destacada, membresías, promoción de anuncios, herramientas premium o paquetes para inmobiliarias y corredores, el usuario acepta pagar los importes informados antes de confirmar la contratación. El detalle del precio, duración, alcance y condiciones del servicio se mostrará antes de finalizar la compra.</p>
              <p>Los pagos podrán gestionarse mediante pasarelas de pago autorizadas o los medios habilitados en la plataforma. El usuario autoriza el cobro por los servicios seleccionados, incluyendo impuestos aplicables si correspondiera.</p>
            </Section>

            <Section num={10} title="Cancelaciones y devoluciones">
              <p className="mb-3">tiyuy dispone de una política específica de cancelación visible en el sitio. En general, cuando un servicio digital ya fue activado, publicado o consumido, no procede devolución, salvo error atribuible a tiyuy o incumplimiento comprobable del servicio ofrecido. Si un servicio pagado no se ejecutó por causa imputable a la plataforma, tiyuy evaluará el reembolso total o parcial según corresponda.</p>
              <p className="mb-3">Cuando exista un reembolso aprobado, este se efectuará por el mismo medio de pago usado originalmente o por el mecanismo que tiyuy indique, dentro de un plazo razonable sujeto a la pasarela de pago o al banco emisor.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <strong>📌</strong> Consulta nuestra <Link href="/politicas-de-cambio" className="text-blue-700 font-semibold hover:underline">Política de Cambio o Devoluciones</Link> para más detalles.
              </div>
            </Section>

            <Section num={11} title="Contenido del usuario">
              <p className="mb-3">El usuario conserva los derechos sobre el contenido que sube a la plataforma, pero otorga a tiyuy una licencia no exclusiva, gratuita, transferible y válida para usar, reproducir, mostrar y distribuir dicho contenido dentro del sitio y sus canales asociados, con la finalidad de operar y promocionar el servicio.</p>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-green-800">
                El usuario declara que su contenido no infringe derechos de terceros, derechos de autor, marcas, privacidad, imagen ni normas de protección al consumidor.
              </div>
            </Section>

            <Section num={12} title="Seguridad y conducta">
              <p className="mb-3">tiyuy publica políticas de seguridad y de uso responsable en su sitio. El usuario debe actuar con buena fe, comunicarse de forma respetuosa y evitar cualquier conducta que perjudique a otros miembros, anunciantes, clientes o al personal de soporte.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                tiyuy puede aplicar medidas preventivas, como bloquear mensajes, retirar anuncios o restringir accesos, cuando identifique actividad sospechosa o riesgo para la comunidad.
              </div>
            </Section>

            <Section num={13} title="No discriminación y accesibilidad">
              <p className="mb-3">tiyuy mantiene políticas de antidiscriminación y apoyo a personas con discapacidad visibles en el sitio. Ningún usuario debe ser discriminado por motivos de discapacidad, origen, género, edad, religión, orientación sexual, nacionalidad u otra condición protegida por la ley.</p>
              <p>Los anunciantes y usuarios que publiquen inmuebles deben describir de manera honesta las condiciones de accesibilidad cuando estas sean relevantes para la propiedad.</p>
            </Section>

            <Section num={14} title="Propiedad intelectual">
              <p>El nombre tiyuy, su logotipo, diseño, textos institucionales, estructura de la plataforma, código y elementos gráficos pueden estar protegidos por derechos de propiedad intelectual. Queda prohibida su reproducción o uso no autorizado sin consentimiento previo por escrito de tiyuy.</p>
            </Section>

            <Section num={15} title="Enlaces externos">
              <p>La plataforma puede incluir enlaces a páginas externas, redes sociales o servicios de terceros. tiyuy no controla esos sitios ni responde por su contenido, políticas, disponibilidad o tratamiento de datos.</p>
            </Section>

            <Section num={16} title="Limitación de responsabilidad">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                tiyuy no garantiza que el servicio esté libre de interrupciones, errores o fallas técnicas, aunque procurará mantener la plataforma operativa y segura. tiyuy no responde por pérdidas derivadas de decisiones tomadas entre usuarios, contenido de terceros, cambios de precio, fraude entre particulares o información incorrecta suministrada por anunciantes.
              </div>
            </Section>

            <Section num={17} title="Modificaciones">
              <p>tiyuy puede modificar estos Términos y Condiciones en cualquier momento. La versión actualizada se publicará en la plataforma y entrará en vigencia desde su publicación, salvo que se indique otra fecha.</p>
            </Section>

            <Section num={18} title="Libro de Reclamaciones">
              <p className="mb-3">tiyuy cuenta con un enlace visible a su Libro de Reclamaciones en la web. El usuario puede usarlo para presentar reclamos o quejas conforme a la normativa aplicable en Perú.</p>
              <Link href="/libro-de-reclamaciones" className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors">
                Ir al Libro de Reclamaciones →
              </Link>
            </Section>

            <Section num={19} title="Legislación aplicable">
              <p>Estos Términos y Condiciones se rigen por las leyes de la República del Perú. Cualquier controversia será tratada conforme a la normativa peruana y, de ser necesario, ante la autoridad competente.</p>
            </Section>

            <Section num={20} title="Contacto">
              <p className="mb-4">Para consultas sobre estos términos, puedes escribirnos.</p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p><span className="font-semibold">📧</span> tiyuy@saberoconsulting.com</p>
                <p><span className="font-semibold">📞</span> +51 923 327 532</p>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div id={`section-${num}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold shrink-0">
          {num}
        </span>
        {title}
      </h2>
      <div className="text-gray-600 leading-relaxed ml-9 space-y-3">
        {children}
      </div>
    </div>
  );
}