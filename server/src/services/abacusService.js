const axios = require('axios');

const ABACUSAI_API_KEY = process.env.ABACUSAI_API_KEY;

module.exports = {
  async generateText(keyword, type = 'category') {
    try {
      console.log(`🧠 Gerando texto para a palavra-chave: ${keyword} usando a API da ABACUS AI`);

      // Verificar se a API key está configurada
      if (!ABACUSAI_API_KEY) {
        console.error('API key da ABACUS AI não configurada. Usando texto de fallback.');
        return this.generateFallbackText(keyword, type);
      }

      try {
        // Parâmetros para a geração de texto
        const promptParams = {
          keyword,
          type,
          instructions: `Crie um texto descritivo-informativo sobre ${keyword} para fins de marketing. 
          O texto deve incluir:
          - Um título atrativo
          - 5 subtítulos relevantes
          - 5 parágrafos informativos
          - Uma lista de benefícios/vantagens
          - Mencionar aspectos de branding, valor agregado e incluir um CTA
          - O texto deve ser otimizado para SEO e ter um tom profissional e persuasivo
          
          O texto deve conter as seguintes características:
          - Menção Semântica,
          - Menção de Branding,
          - Vantagens, Valor Agregado e Apresentação de Solução,
          - Trecho Informativo,
          - Variações e Diversidade,
          - CTA

          Por ser um texto focado em SEO, crie ele para ser um texto com pontos fortes 
          para ser bem avaliado pelos mecanismos de busca, use essas informações também para se basear em escrever melhores textos.
          `
        };

        // Chamada para a API da ABACUS AI
        const response = await axios.post('https://api.abacus.ai/api/v1/prompt', {
          model: 'meta-llama/Llama-2-70b-chat-hf', // Modelo a ser usado (ajuste conforme necessário)
          prompt: JSON.stringify(promptParams),
          max_tokens: 5000,
          temperature: 0.7,
          stream: false
        }, {
          headers: {
            'Authorization': `Bearer ${ABACUSAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 segundos de timeout
        });

        // Verificar se a resposta é HTML (erro) ou JSON (sucesso)
        const contentType = response.headers['content-type'] || '';
        if (contentType.includes('text/html')) {
          console.error('A API retornou HTML em vez de JSON. Usando texto de fallback.');
          return this.generateFallbackText(keyword, type);
        }

        // Processar a resposta da API
        const aiResponse = response.data;
        console.log('Resposta da API recebida com sucesso');
        console.log(aiResponse)

        // Processar o texto gerado pela API
        try {
          // Tentativa de processar a resposta como JSON
          const parsedContent = typeof aiResponse.response === 'string'
            ? JSON.parse(aiResponse.response)
            : aiResponse.response;

          // Se a resposta já estiver no formato esperado, retorne-a diretamente
          if (parsedContent && parsedContent.text && parsedContent.text.title) {
            return {
              type,
              from: "1234567",
              contents: parsedContent.text,
              audioFileName: `${keyword.toLowerCase().replace(/\s+/g, '-')}.wav`
            };
          }

          // Caso contrário, usar texto de fallback
          console.log('Resposta da API não está no formato esperado. Usando texto de fallback.');
          return this.generateFallbackText(keyword, type);
        } catch (parseError) {
          // Se não for possível analisar como JSON, usar texto de fallback
          console.log('Erro ao processar resposta da API:', parseError.message);
          return this.generateFallbackText(keyword, type);
        }
      } catch (apiError) {
        console.error('Erro na chamada à API da ABACUS AI:', apiError.message);
        return this.generateFallbackText(keyword, type);
      }
    } catch (error) {
      console.error('Erro ao gerar texto:', error.message);
      return this.generateFallbackText(keyword, type);
    }
  },

  // Método para gerar texto de fallback em caso de falha na API
  generateFallbackText(keyword, type) {
    console.log('Gerando texto de fallback para:', keyword);

    return {
      type,
      from: "1015100",
      contents: {
        title: {
          content: `${keyword}: O Brinde Perfeito para Sua Marca com Estilo e Sustentabilidade`,
          firstBlock: `${keyword.toLowerCase()} são um dos brindes mais populares e eficazes para divulgar marcas, eventos e campanhas promocionais. Práticas, acessíveis e altamente funcionais, eles são perfeitos para empresas que desejam oferecer um item útil e marcante ao público.`
        },
        subtitles: [
          { id: 1, content: `Modelos e opções para todos os gostos e segmentos`, for: "text" },
          { id: 2, content: `Transforme sua campanha com um brinde de impacto`, for: "text" }
        ],
        paragraphs: [
          {
            blocks: [
              `Na Innovation Brindes, você encontra uma ampla variedade de ${keyword.toLowerCase()}, desde modelos clássicos e minimalistas até opções modernas com design diferenciado. Oferecemos produtos com diferentes materiais, cores e acabamentos para atender às necessidades específicas da sua empresa.`
            ],
            subtitleId: 1
          },
          {
            blocks: [
              `Escolher ${keyword.toLowerCase()} é mais do que oferecer um item funcional: é criar uma conexão entre sua marca e o público. Cada vez que alguém utilizar o produto, sua empresa estará presente, reforçando sua mensagem e gerando reconhecimento.`
            ],
            subtitleId: 2
          }
        ],
        lists: [
          {
            id: 0,
            title: `Por que escolher ${keyword.toLowerCase()} como brinde?`,
            blocks: [],
            content: [
              `Utilidade no dia a dia: ${keyword} são itens indispensáveis, seja no trabalho, na escola ou em casa. Ao oferecer um produto personalizado, sua marca estará presente em momentos importantes da rotina do seu público.`,
              `Custo-benefício imbatível: ${keyword.toLowerCase()} são brindes acessíveis, ideais para campanhas de marketing em grande escala, sem comprometer a qualidade ou o impacto.`,
              `Personalização que destaca sua marca: Com diversas opções de cores, formatos e acabamentos, ${keyword.toLowerCase()} podem ser personalizados com o logotipo, slogan ou mensagem da sua empresa, garantindo visibilidade constante.`,
              `Versatilidade: Adequados para qualquer tipo de evento ou público, ${keyword.toLowerCase()} são um brinde universal que agrada a todos.`
            ],
            type: "unordened"
          }
        ],
        cta: {
          title: "Solicite agora mesmo o seu orçamento!",
          content: `Entre em contato com a nossa equipe e descubra como ${keyword.toLowerCase()} podem transformar sua estratégia de marketing. Oferecemos personalização de alta qualidade, prazos rápidos e condições especiais para pedidos em grande quantidade.`
        }
      },
      blueprint: [
        { type: "title", id: null },
        { type: "list", id: 0 },
        { type: "subtitle", id: 1 },
        { type: "text", id: 1 },
        { type: "subtitle", id: 2 },
        { type: "text", id: 2 },
        { type: "cta", id: null }
      ],
      audioFileName: `${keyword.toLowerCase().replace(/\s+/g, '-')}.wav`
    };
  }
};