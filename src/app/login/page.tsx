"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulating login for now
    setTimeout(() => {
      router.push("/");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-white font-inter">
      {/* Left Side: Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-[450px] xl:w-[500px] lg:px-12 xl:px-16 border-r border-slate-50 shadow-2xl z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto w-full max-w-sm"
        >
          <div className="flex items-center gap-x-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
              Z
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight font-outfit">Mi Factura DTE</span>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 font-outfit">Bienvenido de nuevo</h1>
            <p className="mt-3 text-slate-500 font-medium">Gestiona tus cotizaciones con elegancia y precisión.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Empresarial</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@empresa.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">Contraseña</label>
                <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center gap-x-2">
                  Iniciar Sesión
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-slate-400 font-medium">
            &copy; 2026 Mi Factura DTE. Todos los derechos reservados.
          </p>
        </motion.div>
      </div>

      {/* Right Side: Visual Content */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-blue-900/40 to-slate-900/60 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544380903-583b41dd4ff1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center animate-subtle-zoom" />
        
        <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay backdrop-blur-[2px] z-10" />

        <div className="relative z-20 flex flex-col justify-end p-20 h-full w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <div className="inline-flex items-center gap-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
              <ShieldCheck className="h-4 w-4" />
              Acceso Seguro SSL
            </div>
            <h2 className="text-5xl font-bold text-white leading-tight font-outfit">
              La plataforma definitiva para <span className="text-blue-400">cotizaciones premium</span>.
            </h2>
            <div className="mt-8 flex items-center gap-x-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden shadow-xl">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-slate-300 text-sm font-medium">
                Más de <span className="text-white font-bold">2,500</span> empresas ya confían en nosotros.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-blue-500/20 blur-[120px] z-0" />
        <div className="absolute bottom-40 left-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-[150px] z-0" />
      </div>

      <style jsx global>{`
        @keyframes subtle-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-subtle-zoom {
          animation: subtle-zoom 20s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
}
