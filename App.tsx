
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from './services/firebase';
import { BudgetItem, CompanyInfo, BudgetSummary } from './types';
import Header from './components/Header';
import BudgetItemRow from './components/BudgetItemRow';
import ActionButtons from './components/ActionButtons';
import CompanyEditModal from './components/CompanyEditModal';
import Auth from './components/Auth';
import { analyzeBudgetPhoto } from './services/geminiService';
import { formatCurrency, fileToBase64 } from './utils/formatters';
import html2canvas from 'html2canvas';

const DEFAULT_COMPANY: CompanyInfo = {
  name: "Sua Empresa",
  logo: "",
  whatsapp: "(00) 00000-0000",
  instagram: "@suaempresa",
  address: "Endereço da Empresa"
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const budgetRef = useRef<HTMLDivElement>(null);

  // Monitorar estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Carregar dados da empresa do Firestore
        try {
          const docRef = doc(db, "companies", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCompanyInfo(docSnap.data() as CompanyInfo);
          }
        } catch (error) {
          console.error("Erro ao buscar dados no Firestore:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const summary = useMemo<BudgetSummary>(() => {
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const discountCash = subtotal * 0.10;
    return {
      subtotal,
      discountCash,
      total: subtotal,
    };
  }, [items]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const base64 = await fileToBase64(file);
      const extractedItems = await analyzeBudgetPhoto(base64);
      setItems(prev => [...prev, ...extractedItems]);
    } catch (error) {
      console.error("Erro ao analisar imagem:", error);
      alert("Houve um erro ao analisar a imagem. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleUpdateItem = useCallback((id: string, updates: Partial<BudgetItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleAddItem = () => {
    const newItem: BudgetItem = {
      id: `item-${Date.now()}`,
      quantity: 1,
      description: "",
      unitPrice: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleSaveCompanyInfo = async (newInfo: CompanyInfo) => {
    if (!user) return;
    try {
      setCompanyInfo(newInfo);
      await setDoc(doc(db, "companies", user.uid), newInfo);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar no Firestore:", error);
      alert("Erro ao salvar dados na nuvem.");
    }
  };

  const handleDownload = async () => {
    if (!budgetRef.current || items.length === 0) {
      alert("Adicione itens ao orçamento antes de baixar.");
      return;
    }
    
    setIsCapturing(true);

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(budgetRef.current!, {
          scale: 3,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1200,
        });
        
        const link = document.createElement('a');
        link.download = `orcamento-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
      } catch (error) {
        console.error("Erro ao gerar imagem:", error);
        alert("Erro ao gerar a imagem do orçamento.");
      } finally {
        setIsCapturing(false);
      }
    }, 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">Carregando Sistema...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className={`min-h-screen ${isCapturing ? 'bg-white' : 'bg-slate-50'}`}>
      <div ref={budgetRef} data-capture-container className={isCapturing ? "w-[1200px] mx-auto bg-white p-10" : "pb-24"}>
        <Header 
          info={companyInfo} 
          isCapturing={isCapturing} 
          onEdit={() => setIsEditModalOpen(true)}
        />
        
        <main className={`max-w-6xl mx-auto px-4 ${isCapturing ? 'px-0' : ''}`}>
          {!isCapturing && (
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 mb-8 no-print">
              <div className="flex flex-col items-center">
                <div className="w-full">
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Novo Orçamento Inteligente</h2>
                  <p className="text-slate-500 mb-6">Tire uma foto da sua lista para que nossa IA organize tudo para você.</p>
                  
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={isAnalyzing}
                    />
                    <div className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all ${isAnalyzing ? 'bg-slate-50 border-slate-200' : 'border-emerald-200 bg-emerald-50 group-hover:bg-emerald-100 group-hover:border-emerald-300'}`}>
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-emerald-700 font-medium animate-pulse">Analisando imagem com IA...</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-200">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          </div>
                          <p className="text-slate-700 font-semibold">Selecione ou arraste a foto</p>
                          <p className="text-slate-400 text-sm mt-1">PNG ou JPG</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className={`bg-white rounded-[2rem] ${isCapturing ? 'border-none' : 'shadow-lg border border-slate-200 overflow-hidden'}`}>
            {!isCapturing && (
              <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-200 flex justify-between items-center no-print">
                <h3 className="font-bold text-slate-800 text-lg">Itens</h3>
                <button 
                  onClick={handleAddItem}
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Adicionar
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-5 px-6 w-24 text-center">Qtd</th>
                    <th className="py-5 px-6">Produto</th>
                    <th className="py-5 px-6 w-40">Valor Unit.</th>
                    <th className="py-5 px-6 w-40 text-right">Total</th>
                    {!isCapturing && <th className="py-5 px-6 w-16 no-print"></th>}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-24 text-center text-slate-400">
                        <div className="flex flex-col items-center">
                          <svg className="w-16 h-16 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                          Nenhum item adicionado.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map(item => (
                      <BudgetItemRow 
                        key={item.id} 
                        item={item} 
                        onUpdate={handleUpdateItem} 
                        onRemove={handleRemoveItem} 
                        isCapturing={isCapturing}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className={`p-10 flex flex-col items-end border-t border-slate-200 ${isCapturing ? 'bg-white' : 'bg-slate-50'}`}>
              <div className="w-full md:w-96 space-y-4">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal Bruto</span>
                  <span>{formatCurrency(summary.subtotal)}</span>
                </div>
                
                <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <div className="flex flex-col">
                    <span className="text-emerald-700 font-bold text-sm">Desconto À Vista</span>
                    <span className="text-[10px] text-emerald-600 uppercase tracking-wider font-bold">Economize 10% </span>
                  </div>
                  <span className="text-emerald-700 font-black">-{formatCurrency(summary.discountCash)}</span>
                </div>

                <div className="h-px bg-slate-200 my-6"></div>

                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black text-slate-900">Total Geral</span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-slate-900">
                      {formatCurrency(summary.total)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 rounded-3xl border-2 border-emerald-500 bg-white mt-6 shadow-sm">
                  <p className="text-xs text-emerald-600 font-black uppercase mb-1 tracking-widest text-center">Valor no Dinheiro, Pix, Cartão Venc.</p>
                  <p className="text-4xl font-black text-emerald-600 text-center">{formatCurrency(summary.total - summary.discountCash)}</p>
                </div>
              </div>
            </div>
            
            <div className="p-10 text-center text-slate-400 text-xs border-t border-slate-100">
              <p className="font-bold mb-2">Este orçamento é válido por 30 dias corridos.</p>
              <p>{companyInfo.name} agradece a sua preferência!</p>
              <p className="mt-4 opacity-40 uppercase tracking-widest text-[9px]">Gerado por Sistema de Orçamentos Inteligente</p>
            </div>
          </section>
        </main>
      </div>

      {!isCapturing && (
        <>
          <ActionButtons 
            onDownload={handleDownload} 
            onClear={() => setItems([])} 
          />
          <button 
            onClick={() => auth.signOut()}
            className="fixed bottom-6 left-6 p-4 bg-white border border-slate-200 text-slate-400 rounded-full shadow-lg hover:text-rose-500 transition-all no-print group"
            title="Sair"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </>
      )}
      
      {isCapturing && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[200] flex items-center justify-center no-print">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-slate-900 text-xl font-black mb-2">Gerando Orçamento Profissional</p>
            <p className="text-slate-500 font-medium">Preparando seu arquivo em alta definição...</p>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <CompanyEditModal 
          info={companyInfo} 
          onSave={handleSaveCompanyInfo} 
          onClose={() => setIsEditModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
