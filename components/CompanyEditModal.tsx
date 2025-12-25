
import React, { useState } from 'react';
import { CompanyInfo } from '../types';
import { fileToBase64, getDirectDriveUrl } from '../utils/formatters';

interface CompanyEditModalProps {
  info: CompanyInfo;
  onSave: (newInfo: CompanyInfo) => void;
  onClose: () => void;
}

const CompanyEditModal: React.FC<CompanyEditModalProps> = ({ info, onSave, onClose }) => {
  const [formData, setFormData] = useState<CompanyInfo>({ ...info });
  const [isUploading, setIsUploading] = useState(false);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const base64 = await fileToBase64(file);
        setFormData(prev => ({ ...prev, logo: `data:${file.type};base64,${base64}` }));
      } catch (error) {
        console.error("Erro ao carregar logo:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleLogoUrlChange = (url: string) => {
    // Tenta converter imediatamente se for um link do Drive
    const directUrl = getDirectDriveUrl(url);
    setFormData(prev => ({ ...prev, logo: directUrl }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const previewLogoUrl = getDirectDriveUrl(formData.logo);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black text-slate-800">Editar Dados da Empresa</h2>
          <button onClick={onClose} type="button" className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Logo Upload & Link */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-emerald-200 bg-white flex items-center justify-center shadow-inner">
              {previewLogoUrl ? (
                <img 
                  src={previewLogoUrl} 
                  alt="Preview Logo" 
                  className="w-full h-full object-cover" 
                  crossOrigin="anonymous"
                />
              ) : (
                <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-[10px] font-bold uppercase text-center px-1">Upload ou clique para trocar</span>
              </div>
            </div>
            {isUploading && <span className="text-xs text-emerald-600 animate-pulse font-bold">Processando arquivo...</span>}
            
            <div className="w-full">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Link da Logo (Drive ou Web)</label>
              <input
                type="text"
                value={formData.logo.startsWith('data:') ? '' : formData.logo}
                onChange={e => handleLogoUrlChange(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium text-sm"
                placeholder="Cole aqui o link do Google Drive ou uma URL de imagem"
              />
              <p className="text-[10px] text-slate-400 mt-1">Dica: Aceita links do Drive tipo "/file/d/ID/view".</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nome da Empresa</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium"
                placeholder="Ex: Papelaria do João"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Endereço Completo</label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium resize-none"
                placeholder="Rua, Número, Bairro, Cidade - UF"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">WhatsApp</label>
                <input
                  type="text"
                  required
                  value={formData.whatsapp}
                  onChange={e => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Instagram</label>
                <input
                  type="text"
                  required
                  value={formData.instagram}
                  onChange={e => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-medium"
                  placeholder="@usuario"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyEditModal;
