
import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { auth } from '../services/firebase';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isReset) {
        await sendPasswordResetEmail(auth, email);
        setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 p-8 md:p-12 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-200 mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isReset ? 'Recuperar Senha' : (isLogin ? 'Bem-vindo de volta' : 'Criar sua conta')}
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            {isReset ? 'Enviaremos um link para o seu e-mail' : (isLogin ? 'Acesse seu painel de orçamentos' : 'Comece a gerar orçamentos com IA hoje')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl font-medium animate-in slide-in-from-top-2">
              {error}
            </div>
          )}
          {message && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-xl font-medium animate-in slide-in-from-top-2">
              {message}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium"
              placeholder="seu@email.com"
            />
          </div>

          {!isReset && (
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Senha</label>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={() => { setIsReset(true); setError(''); }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Esqueceu?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isReset ? 'Enviar Link' : (isLogin ? 'Entrar Agora' : 'Criar Conta Grátis')
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-slate-500 font-medium">
            {isReset ? (
              <button 
                onClick={() => { setIsReset(false); setIsLogin(true); setError(''); }}
                className="text-emerald-600 font-bold hover:underline"
              >
                Voltar para o Login
              </button>
            ) : (
              <>
                {isLogin ? 'Não tem uma conta?' : 'Já possui conta?'}
                <button
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="ml-2 text-emerald-600 font-bold hover:underline"
                >
                  {isLogin ? 'Cadastre-se' : 'Fazer Login'}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
