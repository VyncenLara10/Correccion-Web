'use client';

import { Card, CardContent } from '@/components/ui/card2';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a]">
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6">
            Términos y Condiciones
          </h1>
          <p className="text-gray-400 mb-8">
            Última actualización: {new Date().toLocaleDateString()}
          </p>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 space-y-6 text-gray-300">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Aceptación de Términos</h2>
                <p>
                  Al acceder y utilizar TikalInvest, aceptas estar sujeto a estos términos y condiciones.
                  Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestros servicios.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Servicios Ofrecidos</h2>
                <p>
                  TikalInvest proporciona una plataforma para el trading de acciones y valores. Nuestros servicios incluyen:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Compra y venta de acciones</li>
                  <li>Gestión de portafolio</li>
                  <li>Análisis de mercado</li>
                  <li>Herramientas de inversión</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Registro de Cuenta</h2>
                <p>
                  Para utilizar nuestros servicios, debes:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Ser mayor de 18 años</li>
                  <li>Proporcionar información veraz y actualizada</li>
                  <li>Mantener la seguridad de tu contraseña</li>
                  <li>Notificarnos inmediatamente de cualquier uso no autorizado</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Riesgos de Inversión</h2>
                <p>
                  Reconoces que toda inversión conlleva riesgos. El valor de las inversiones puede subir o bajar,
                  y puedes no recuperar el monto invertido. TikalInvest no garantiza rendimientos específicos.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Comisiones y Tarifas</h2>
                <p>
                  Nos reservamos el derecho de cobrar comisiones por nuestros servicios. Las tarifas actuales
                  se pueden consultar en nuestra página de <a href="/pricing" className="text-cyan-400 hover:underline">Precios</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Prohibiciones</h2>
                <p>
                  Está prohibido:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Usar la plataforma para actividades ilegales</li>
                  <li>Manipular el mercado o realizar fraudes</li>
                  <li>Acceder sin autorización a cuentas de terceros</li>
                  <li>Utilizar bots o sistemas automatizados sin permiso</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Limitación de Responsabilidad</h2>
                <p>
                  TikalInvest no será responsable por pérdidas directas, indirectas, incidentales o consecuentes
                  derivadas del uso de nuestros servicios, incluyendo pero no limitado a pérdidas de inversión.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Modificaciones</h2>
                <p>
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
                  entrarán en vigor inmediatamente después de su publicación en el sitio web.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Terminación</h2>
                <p>
                  Podemos suspender o terminar tu cuenta si violas estos términos o por cualquier otra razón
                  que consideremos apropiada, con o sin previo aviso.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Contacto</h2>
                <p>
                  Si tienes preguntas sobre estos términos, contáctanos en:
                </p>
                <p className="mt-2">
                  Email: legal@tikalinvest.com<br />
                  Teléfono: +502 2222-3333
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}