import { useState, useEffect } from 'react';
import { auth, handleFirestoreError, OperationType, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  if (!isOpen) return null;

  const handleError = (err: any) => {
    let msg = err.message || String(err);
    console.error("Auth Error:", err);

    if (msg.includes('auth/popup-closed-by-user')) {
      msg = 'O login com Google foi cancelado ou a janela foi fechada. Tente novamente.';
    } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
      msg = 'Email ou senha incorretos.';
    } else if (msg.includes('auth/email-already-in-use')) {
      msg = 'Este email já está em uso.';
    } else if (msg.includes('auth/weak-password')) {
      msg = 'A senha deve ter pelo menos 6 caracteres.';
    } else if (msg.includes('auth/invalid-email')) {
      msg = 'Email inválido.';
    } else if (msg.includes('auth/popup-blocked')) {
      msg = 'O pop-up de login foi bloqueado pelo seu navegador. Por favor, permita pop-ups para este site.';
    } else if (msg.includes('Missing or insufficient permissions')) {
      msg = 'Erro de permissão no banco de dados. Tente novamente.';
    } else if (msg.startsWith('{')) {
      try {
        msg = JSON.parse(msg).error || "Erro desconhecido";
      } catch(e){}
    }
    setError(msg);
  };

  const handleAuth = async (e: any) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document
        try {
           await setDoc(doc(db, 'users', userCredential.user.uid), {
             email: userCredential.user.email || email || 'no-email',
             createdAt: Date.now()
           });
        } catch (err) {
           handleFirestoreError(err, OperationType.CREATE, `users/${userCredential.user.uid}`);
        }
      }
      onClose();
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      // Check if user doc exists, if not create
      const docRef = doc(db, 'users', userCredential.user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          email: userCredential.user.email || 'no-email',
          createdAt: Date.now()
        });
      }
      onClose();
    } catch (err: any) {
      handleError(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-md p-6 relative font-sans" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors pixel text-[10px]">X</button>
        <h2 className="text-2xl text-lime-400 font-bold mb-6 pixel text-center tracking-tighter">
          {isLogin ? 'LOGIN' : 'CADASTRO'}
        </h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl mb-6 text-xs font-bold leading-relaxed border-l-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleAuth} className="flex flex-col gap-5">
          <div>
            <label className="block text-[10px] uppercase text-gray-500 mb-2 font-black tracking-[0.2em]">Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-black/40 border border-[#333] rounded-xl p-4 text-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all placeholder:text-gray-700" 
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-gray-500 mb-2 font-black tracking-[0.2em]">Senha</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-black/40 border border-[#333] rounded-xl p-4 text-white focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all placeholder:text-gray-700" 
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="bg-lime-500 hover:bg-lime-400 text-black font-black py-4 rounded-xl uppercase tracking-widest mt-2 transition-all active:scale-95 shadow-[0_4px_15px_rgba(132,204,22,0.2)]"
          >
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px bg-[#222] flex-1"></div>
          <span className="text-[#444] text-[10px] font-black uppercase tracking-widest leading-none">OU</span>
          <div className="h-px bg-[#222] flex-1"></div>
        </div>

        <button 
          type="button" 
          onClick={handleGoogle} 
          className="w-full bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-95 uppercase tracking-widest text-[11px] shadow-lg"
        >
           <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4 opacity-80" />
           Google
        </button>

        <div className="mt-8 text-center text-xs font-bold text-gray-500">
          {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"} 
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-lime-400 ml-2 hover:text-lime-300 transition-colors uppercase tracking-widest text-[10px] font-black underline underline-offset-4">
            {isLogin ? 'Cadastre-se' : 'Faça Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
