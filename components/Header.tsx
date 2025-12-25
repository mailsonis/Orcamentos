
import React from 'react';
import { CompanyInfo } from '../types';
import { getDirectDriveUrl } from '../utils/formatters';

interface HeaderProps {
  info: CompanyInfo;
  isCapturing?: boolean;
  onEdit?: () => void;
}

const Header: React.FC<HeaderProps> = ({ info, isCapturing = false, onEdit }) => {
  const logoUrl = getDirectDriveUrl(info.logo);

  return (
    <header 
      onClick={!isCapturing ? onEdit : undefined}
      className={`bg-white border-b border-slate-200 py-8 px-8 mb-8 ${isCapturing ? '' : 'sticky top-0 z-10 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors group'} no-print`}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center overflow-hidden border border-emerald-100 shadow-sm relative">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="w-full h-full object-cover" 
                crossOrigin="anonymous"
              />
            ) : (
              <span className="text-emerald-700 font-bold text-2xl">{info.name.charAt(0)}</span>
            )}
            {!isCapturing && (
              <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-1 flex items-center gap-2">
              {info.name}
              {!isCapturing && <span className="text-[10px] text-emerald-500 opacity-0 group-hover:opacity-100 font-bold uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Editar</span>}
            </h1>
            <p className="text-slate-500 text-sm max-w-sm font-medium leading-relaxed">{info.address}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-3">
          {/* WhatsApp Row */}
          <div className="flex items-center justify-center md:justify-end gap-2 text-emerald-600 h-7">
            <div className="flex items-center justify-center w-6">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <span className="font-bold text-lg inline-block">{info.whatsapp}</span>
          </div>

          {/* Instagram Row */}
          <div className="flex items-center justify-center md:justify-end gap-2 text-slate-500 h-7">
            <div className="flex items-center justify-center w-6">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </div>
            <span className="font-medium text-base inline-block">{info.instagram}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
