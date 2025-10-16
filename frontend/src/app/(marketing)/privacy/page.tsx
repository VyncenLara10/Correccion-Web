'use client';

import { Card, CardContent } from '@/components/ui/card2';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] to-[#1a1f3a]">
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6">
            Política de Privacidad
          </h1>
          <p className="text-gray-400 mb-8">
            Última actualización: {new Date().toLocaleDateString()}
          </p>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 space-y-6 text-gray-300">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Información que Recopilamos</h2>
                <p>
                  En TikalInvest, recopilamos la siguiente información:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Información personal: nombre, correo electrónico, teléfono</li>
                  <li>Información financiera: transacciones, saldo de cuenta</li>
                  <li>Información de uso: páginas visitadas, tiempo de sesión</li>
                  <li>Información técnica: dirección IP, tipo de navegador, dispositivo</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Cómo Usamos tu Información</h2>
                <p>
                  Utilizamos tu información para:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Proporcionar y mejorar nuestros servicios</li>
                  <li>Procesar transacciones y pagos</li>
                  <li>Enviarte notificaciones importantes</li>
                  <li>Cumplir con requisitos legales y regulatorios</li>
                  <li>Prevenir fraudes y garantizar la seguridad</li>
                  <li>Personalizar tu experiencia en la plataforma</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. Compartir Información</h2>
                <p>
                  No vendemos tu información personal. Podemos compartir datos con:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Proveedores de servicios que nos ayudan a operar la plataforma</li>
                  <li>Autoridades reguladoras cuando sea requerido por ley</li>
                  <li>Socios comerciales con tu consentimiento explícito</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Seguridad de Datos</h2>
                <p>
                  Implementamos medidas de seguridad avanzadas para proteger tu información:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Encriptación SSL/TLS para todas las comunicaciones</li>
                  <li>Autenticación de dos factores (2FA)</li>
                  <li>Monitoreo continuo de seguridad</li>
                  <li>Acceso restringido a datos personales</li>
                  <li>Copias de seguridad regulares</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Cookies y Tecnologías Similares</h2>
                <p>
                  Utilizamos cookies para mejorar tu experiencia. Puedes controlar las cookies a través de la
                  configuración de tu navegador. Las cookies nos ayudan a:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Recordar tus preferencias</li>
                  <li>Mantener tu sesión activa</li>
                  <li>Analizar el uso de la plataforma</li>
                  <li>Personalizar el contenido</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Tus Derechos</h2>
                <p>
                  Tienes derecho a:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2 ml-4">
                  <li>Acceder a tu información personal</li>
                  <li>Corregir datos inexactos</li>
                  <li>Solicitar la eliminación de tus datos</li>
                  <li>Oponerte al procesamiento de tus datos</li>
                  <li>Exportar tus datos en formato legible</li>
                  <li>Revocar el consentimiento en cualquier momento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Retención de Datos</h2>
                <p>
                  Retenemos tu información personal solo durante el tiempo necesario para cumplir con los
                  propósitos descritos en esta política, a menos que la ley requiera un período de retención más largo.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Transferencias Internacionales</h2>
                <p>
                  Tu información puede ser transferida y procesada en países distintos al tuyo. Nos aseguramos
                  de que dichas transferencias cumplan con las leyes aplicables de protección de datos.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Menores de Edad</h2>
                <p>
                  Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente
                  información de menores. Si descubrimos que hemos recopilado datos de un menor, los eliminaremos.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">10. Cambios a esta Política</h2>
                <p>
                  Podemos actualizar esta política periódicamente. Te notificaremos de cambios significativos
                  por correo electrónico o mediante un aviso en la plataforma.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">11. Contacto</h2>
                <p>
                  Si tienes preguntas sobre esta política de privacidad, contáctanos:
                </p>
                <p className="mt-2">
                  Email: privacy@tikalinvest.com<br />
                  Teléfono: +502 2222-3333<br />
                  Dirección: Zona 10, Ciudad de Guatemala, Guatemala
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}