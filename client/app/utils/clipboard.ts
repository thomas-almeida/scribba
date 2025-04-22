/**
 * Copia o texto fornecido para a área de transferência
 * @param text Texto a ser copiado
 * @returns Promise que resolve para true se a cópia for bem-sucedida, ou false caso contrário
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erro ao copiar para a área de transferência:', error);
    return false;
  }
};