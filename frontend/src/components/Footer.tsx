import { Link } from 'react-router-dom';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-6 mt-12 border-t border-[var(--glass-border)] bg-[var(--bg-card)]">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--text-secondary)]">
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <Link to="/privacy" className="hover:text-[var(--primary)] transition-colors">
                        Políticas de Privacidad
                    </Link>
                    <Link to="/terms" className="hover:text-[var(--primary)] transition-colors">
                        Términos y Condiciones
                    </Link>
                    <Link to="/contact" className="hover:text-[var(--primary)] transition-colors">
                        Contacto / Soporte
                    </Link>
                </div>
                <div>
                    &copy; {currentYear} Zooplay es una marca registrada. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
