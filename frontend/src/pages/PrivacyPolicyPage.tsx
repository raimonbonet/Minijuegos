
export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl text-[var(--text-primary)]">
            <h1 className="text-3xl font-bold mb-8 text-[var(--primary)]">Políticas de Privacidad</h1>

            <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
                <section>
                    <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">1. Información que recopilamos</h2>
                    <p>Zooplay recopila información básica necesaria para el funcionamiento de nuestras aplicaciones y juegos, como datos de perfil, progreso del juego y estadísticas de puntuación.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">2. Uso de la información</h2>
                    <p>Utilizamos la información recopilada para proporcionar, mantener y mejorar nuestros servicios, así como para personalizar la experiencia del usuario y gestionar las tablas de clasificación.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">3. Protección de datos</h2>
                    <p>Nos comprometemos a proteger sus datos personales mediante medidas de seguridad técnicas y organizativas adecuadas para evitar el acceso no autorizado, la pérdida o alteración de la información.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">4. Compartir información</h2>
                    <p>No vendemos ni alquilamos su información personal a terceros. Podemos compartir información agregada y anonimizada para fines estadísticos o de investigación.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">5. Sus derechos</h2>
                    <p>Usted tiene derecho a acceder, rectificar o eliminar su información personal. Puede contactarnos para ejercer estos derechos a través de los canales de soporte de Zooplay.</p>
                </section>
            </div>
        </div>
    );
}
