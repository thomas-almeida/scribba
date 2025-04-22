import { processKeyword, saveLikedText, convertToMarkdown, getLikedTexts } from "../service/index.ts";
import { useState } from "react";
import type { Route } from "./+types/home";
import ReactMarkdown from 'react-markdown';
import { convertMarkdownToStructured } from '../utils/markdownToJson';
import { FormattedContent } from "../components/content";
import { Toast } from "../components/ui/notification";

// Define the response type based on the example
interface PromptResponse {
  id: string;
  provider: string;
  model: string;
  object: string;
  created: number;
  choices: {
    logprobs: null;
    finish_reason: string;
    native_finish_reason: string;
    index: number;
    message: {
      role: string;
      content: string;
      refusal: null;
      reasoning: string;
    };
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Define the structured content JSON format
interface StructuredContent {
  type: string;
  from: string;
  contents: {
    title: {
      content: string;
      firstBlock: string;
    };
    subtitles: {
      id: number;
      content: string;
      for: string;
    }[];
    paragraphs: {
      blocks: string[];
      subtitleId: number;
    }[];
    lists: {
      id: number;
      title: string;
      blocks: string[];
      content: string[];
      type: string;
    }[];
    cta: {
      title: string;
      content: string;
    };
  };
  blueprint: {
    type: string;
    id: number | null;
  }[];
  audioFileName: string;
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Scribba App - SEO Content Generator" }
  ];
}

export default function Home() {
  const [promptResponse, setPromptResponse] = useState<PromptResponse | null>(null);
  const [markdownText, setMarkdownText] = useState<string>("");
  const [structuredContent, setStructuredContent] = useState<StructuredContent | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStructured, setIsLoadingStructured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'markdown' | 'structured'>('formatted');
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' | 'info' }>({ show: false, message: '', type: 'success' });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedText, setImportedText] = useState('');

  async function generateContent() {
    if (!inputValue.trim()) {
      setError("Por favor, insira uma palavra-chave");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Process the keyword to get all three outputs
      const result = await processKeyword(inputValue, selectedPromptId);

      // Update state with the results
      setPromptResponse(result.textResponse);
      setMarkdownText(result.markdownText);

      // Convert markdown to structured JSON
      const structured = convertMarkdownToStructured(result.markdownText, inputValue);
      setStructuredContent(structured);

      // Set view mode to formatted initially
      setViewMode('formatted');
    } catch (err) {
      console.error("Error generating content:", err);
      setError("Falha ao gerar conteúdo. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  async function processImportedText() {
    if (!importedText.trim()) {
      setError("Por favor, insira um texto para importar");
      return;
    }

    if (!inputValue.trim()) {
      setError("Por favor, insira uma palavra-chave para o texto importado");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Primeiro, converter o texto para markdown usando IA
      const convertedMarkdown = await convertToMarkdown(importedText);

      // Create a mock response to maintain compatibility with the existing UI
      const mockResponse: PromptResponse = {
        id: `imported-${Date.now()}`,
        provider: "imported",
        model: "user-imported",
        object: "text.completion",
        created: Date.now(),
        choices: [{
          logprobs: null,
          finish_reason: "stop",
          native_finish_reason: "stop",
          index: 0,
          message: {
            role: "assistant",
            content: importedText,
            refusal: null,
            reasoning: "Este conteúdo foi importado pelo usuário e convertido para markdown pela IA.",
          },
        }],
        usage: {
          prompt_tokens: 0,
          completion_tokens: importedText.split(/\s+/).length,
          total_tokens: importedText.split(/\s+/).length,
        },
      };

      // Update state with the imported text (converted to markdown)
      setPromptResponse(mockResponse);
      setMarkdownText(convertedMarkdown);

      // Convert markdown to structured JSON
      const structured = convertMarkdownToStructured(convertedMarkdown, inputValue);
      setStructuredContent(structured);

      // Set view mode to formatted initially
      setViewMode('formatted');
      
      // Close the import modal
      setShowImportModal(false);
      setImportedText('');

      // Show success message
      setToast({ 
        show: true, 
        message: "Texto convertido e processado com sucesso!", 
        type: 'success' 
      });
    } catch (err) {
      console.error("Error processing imported text:", err);
      setError("Falha ao processar o texto importado. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-left">
          <h1 className="text-md text-indigo-500 font-extrabold">Scribba AI</h1>
        </div>

        <div className="bg-white shadow overflow-hidden rounded-lg p-6 mb-8">
          <div className="mb-6">
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
              Insira a palavra-chave
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                id="keyword"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="ex: Garrafas Térmicas"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />

              <select
                value={selectedPromptId}
                onChange={(e) => setSelectedPromptId(Number(e.target.value))}
                className="block w-full sm:w-auto px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value={0}>Squeeze Personalizado</option>
                <option value={1}>Calculadora Personalizada</option>
              </select>

              <button
                onClick={generateContent}
                disabled={isLoading}
                className={`cursor-pointer w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {isLoading ? 'Gerando...' : 'Gerar Conteúdo'}
              </button>
              
              <button
                onClick={() => setShowImportModal(true)}
                disabled={isLoading}
                className="cursor-pointer w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Importar Texto
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>

        {promptResponse && (
          <div className="bg-white shadow overflow-hidden rounded-lg divide-y divide-gray-200 mb-8">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Conteúdo {promptResponse.provider === 'imported' ? 'Importado' : 'Gerado'}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {promptResponse.provider === 'imported' 
                    ? 'Texto importado pelo usuário' 
                    : `Modelo: ${promptResponse.model}`}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('formatted')}
                    className={`cursor-pointer px-3 py-1 text-sm rounded-md ${viewMode === 'formatted' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Formatado
                  </button>
                  <button
                    onClick={() => setViewMode('markdown')}
                    className={`cursor-pointer px-3 py-1 text-sm rounded-md ${viewMode === 'markdown' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setViewMode('structured')}
                    className={`cursor-pointer px-3 py-1 text-sm rounded-md ${viewMode === 'structured' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    JSON
                  </button>
                </div>
                <button
                  onClick={() => {
                    let contentToCopy = '';
                    if (viewMode === 'formatted' && structuredContent) {
                      const formattedContent = document.querySelector('.formatted-content');
                      contentToCopy = formattedContent?.textContent || '';
                    } else if (viewMode === 'markdown' && markdownText) {
                      contentToCopy = markdownText;
                    } else if (viewMode === 'structured' && structuredContent) {
                      contentToCopy = JSON.stringify(structuredContent, null, 2);
                    }

                    if (contentToCopy) {
                      navigator.clipboard.writeText(contentToCopy);
                      setToast({ show: true, message: `Conteúdo da aba ${viewMode} copiado!`, type: 'success' });
                    }
                  }}
                  className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copiar
                </button>                <button
                  onClick={async () => {
                    try {
                      if (structuredContent && markdownText) {
                        const result = await saveLikedText(inputValue, markdownText, structuredContent);
                        if (result.success) {
                          setToast({ show: true, message: "Conteúdo salvo com sucesso!", type: 'success' });
                        }
                      } else {
                        setToast({ show: true, message: "Não há conteúdo para salvar", type: 'error' });
                      }
                    } catch (error) {
                      console.error("Erro ao salvar o conteúdo:", error);
                      setToast({ show: true, message: "Erro ao salvar o conteúdo", type: 'error' });
                    }
                  }}
                  className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar
                </button>              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {viewMode === 'formatted' && structuredContent ? (
                <div className="relative">

                  <div className="prose max-w-none">
                    <FormattedContent content={structuredContent} />
                  </div>
                </div>
              ) : viewMode === 'markdown' && markdownText ? (
                <div className="relative">

                  <div className="prose max-w-none">
                    <ReactMarkdown>
                      {markdownText}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : viewMode === 'structured' && structuredContent ? (
                <div className="relative">

                  <div className="overflow-auto">
                    <pre className="text-sm bg-gray-100 p-4 rounded">
                      {JSON.stringify(structuredContent, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p>Sem conteúdo para esse formato</p>
              )}
            </div>
            <div className="px-4 py-4 sm:px-6 bg-gray-50">
              {promptResponse.provider !== 'imported' && (
                <details className="text-sm text-gray-500 mt-3">
                  <summary className="font-medium cursor-pointer">Mostrar raciocínio</summary>
                  <div className="mt-3 whitespace-pre-wrap bg-gray-100 p-3 rounded">
                    {promptResponse.choices[0]?.message.reasoning || 'Este modelo não possui logs de raciocínio 😥'}
                  </div>
                </details>
              )}
              <div className="mt-3 text-xs text-gray-400">
                {promptResponse.provider === 'imported' 
                  ? 'Conteúdo importado pelo usuário' 
                  : `Tokens usados: ${promptResponse.usage.total_tokens} | ID: ${promptResponse.id}`}
              </div>
            </div>
          </div>
        )}
      </div>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Modal de importação de texto */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Importar Texto</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 flex-1 overflow-auto">
              <p className="mb-4 text-sm text-gray-600">
                Cole qualquer texto abaixo. O sistema usará IA para convertê-lo em formato markdown, estruturar o conteúdo e gerar o JSON correspondente.
              </p>
              <textarea
                value={importedText}
                onChange={(e) => setImportedText(e.target.value)}
                placeholder="Cole seu texto aqui (qualquer formato)..."
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowImportModal(false)}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                onClick={processImportedText}
                disabled={isLoading}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {isLoading ? 'Processando...' : 'Converter e Processar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}