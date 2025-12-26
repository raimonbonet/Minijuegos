import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  Calendar,
  CreditCard,
  ArrowRight,
  LogOut,
  Gamepad2
} from 'lucide-react';
import './App.css';

function App() {
  const [session, setSession] = useState<any>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellidos: '',
    dni: '',
    fechaNacimiento: '',
    sexo: 'M'
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else {
        // Register in Supabase Auth with metadata for the trigger
        const { error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              nombre: formData.nombre,
              apellidos: formData.apellidos,
              dni: formData.dni,
              fechaNacimiento: formData.fechaNacimiento,
              sexo: formData.sexo
            }
          }
        });

        if (authError) throw authError;

        setMessage({ type: 'success', text: '¡Registro exitoso! Por favor, verifica tu email para activar tu cuenta.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (session) {
    return (
      <div className="glass-card p-8 w-full max-w-md animate-in text-center">
        <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
        <h1 className="text-3xl font-bold mb-2">Bienvenido</h1>
        <p className="text-slate-400 mb-8">{session.user.email}</p>

        <div className="space-y-4">
          <button className="btn-primary w-full">
            <Gamepad2 className="w-5 h-5" />
            Ir a los Juegos
          </button>
          <button onClick={handleLogout} className="w-full text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg px-4 animate-in">
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="p-8 text-center bg-white/5 border-b border-white/10">
          <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
          <h1 className="text-3xl font-bold tracking-tight">MiniJuegos Pro</h1>
          <p className="text-slate-400 mt-2">
            {isLogin ? 'Inicia sesión para jugar' : 'Crea tu cuenta de jugador'}
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`px-8 py-3 text-sm text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="p-8 space-y-5">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <UserIcon className="w-3 h-3" /> Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  className="input-field"
                  placeholder="Ej: Juan"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  Apellidos
                </label>
                <input
                  type="text"
                  name="apellidos"
                  required
                  className="input-field"
                  placeholder="Ej: Pérez"
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-3 h-3" /> DNI
                </label>
                <input
                  type="text"
                  name="dni"
                  required
                  className="input-field"
                  placeholder="12345678X"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> F. Nacimiento
                </label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  required
                  className="input-field"
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-3 h-3" /> Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="input-field"
              placeholder="jugador@ejemplo.com"
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3 h-3" /> Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              className="input-field"
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sexo</label>
              <select name="sexo" className="input-field" onChange={handleChange}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
            {loading ? 'Procesando...' : isLogin ? 'Entrar' : 'Registrarse'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {/* Footer */}
        <div className="p-6 bg-white/5 border-t border-white/10 text-center">
          <p className="text-sm text-slate-400">
            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              {isLogin ? 'Crea una ahora' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
