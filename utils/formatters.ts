
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Converte um link de compartilhamento do Google Drive em um link direto de imagem.
 * Suporta formatos: 
 * - drive.google.com/file/d/ID/view
 * - drive.google.com/uc?id=ID
 * Usa o domínio googleusercontent.com que possui melhor suporte a CORS para o html2canvas.
 */
export const getDirectDriveUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  
  const driveRegex = /\/file\/d\/([^\/]+)\//;
  const ucRegex = /id=([^&]+)/;
  
  let id = '';
  const driveMatch = url.match(driveRegex);
  const ucMatch = url.match(ucRegex);
  
  if (driveMatch) {
    id = driveMatch[1];
  } else if (ucMatch) {
    id = ucMatch[1];
  }
  
  if (id) {
    // Este endpoint lh3.googleusercontent.com/d/ID é o mais estável para exibir e capturar imagens do Drive
    return `https://lh3.googleusercontent.com/d/${id}`;
  }
  
  return url;
};
