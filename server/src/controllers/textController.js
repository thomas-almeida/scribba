const { PrismaClient } = require('@prisma/client');
const abacusService = require('../services/abacusService');

const prisma = new PrismaClient();

module.exports = {
  async generateText(req, res) {
    try {
      const { type, from, keyword } = req.body;
      
      if (!keyword) {
        return res.status(400).json({ error: 'Palavra-chave é obrigatória' });
      }
      
      // Gerar texto usando a API da ABACUS AI
      const generatedText = await abacusService.generateText(keyword, type);
      
      // Verificar se o texto foi gerado corretamente
      if (!generatedText || !generatedText.contents) {
        return res.status(500).json({ error: 'Erro ao gerar texto. Estrutura de resposta inválida.' });
      }
      
      // Salvar o texto no banco de dados
      const text = await prisma.text.create({
        data: {
          type: type || 'category',
          from: from || generatedText.from || '1015100',
          title: generatedText.contents.title.content,
          subtitles: JSON.stringify(generatedText.contents.subtitles),
          paragraphs: JSON.stringify(generatedText.contents.paragraphs),
          lists: generatedText.contents.lists ? JSON.stringify(generatedText.contents.lists) : null,
          audioFileName: generatedText.audioFileName,
          userId: req.userId
        }
      });
      
      return res.status(201).json({
        id: text.id,
        ...generatedText
      });
    } catch (error) {
      console.error('Erro no controlador:', error);
      return res.status(500).json({ error: 'Erro ao gerar texto: ' + error.message });
    }
  },
  
  async getUserTexts(req, res) {
    try {
      const texts = await prisma.text.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' }
      });
      
      // Formatar os textos para o formato esperado pelo frontend
      const formattedTexts = texts.map(text => ({
        id: text.id,
        type: text.type,
        from: text.from,
        contents: {
          title: { 
            content: text.title,
            firstBlock: text.firstBlock || ''
          },
          subtitles: JSON.parse(text.subtitles),
          paragraphs: JSON.parse(text.paragraphs),
          lists: text.lists ? JSON.parse(text.lists) : null,
          cta: text.cta ? JSON.parse(text.cta) : null
        },
        blueprint: text.blueprint ? JSON.parse(text.blueprint) : [
          { type: "title", id: null },
          { type: "list", id: 0 },
          { type: "subtitle", id: 0 },
          { type: "text", id: 0 },
          { type: "cta", id: null }
        ],
        audioFileName: text.audioFileName,
        createdAt: text.createdAt
      }));
      
      return res.json(formattedTexts);
    } catch (error) {
      console.error('Erro ao buscar textos:', error);
      return res.status(500).json({ error: 'Erro ao buscar textos: ' + error.message });
    }
  },
  
  async getTextById(req, res) {
    try {
      const { id } = req.params;
      
      const text = await prisma.text.findUnique({
        where: { id }
      });
      
      if (!text) {
        return res.status(404).json({ error: 'Texto nu00e3o encontrado' });
      }
      
      if (text.userId !== req.userId) {
        return res.status(403).json({ error: 'Acesso nu00e3o autorizado' });
      }
      
      // Formatar o texto para o formato esperado pelo frontend
      const formattedText = {
        id: text.id,
        type: text.type,
        from: text.from,
        contents: {
          title: { 
            content: text.title,
            firstBlock: text.firstBlock || ''
          },
          subtitles: JSON.parse(text.subtitles),
          paragraphs: JSON.parse(text.paragraphs),
          lists: text.lists ? JSON.parse(text.lists) : null,
          cta: text.cta ? JSON.parse(text.cta) : null
        },
        blueprint: text.blueprint ? JSON.parse(text.blueprint) : [
          { type: "title", id: null },
          { type: "list", id: 0 },
          { type: "subtitle", id: 0 },
          { type: "text", id: 0 },
          { type: "cta", id: null }
        ],
        audioFileName: text.audioFileName,
        createdAt: text.createdAt
      };
      
      return res.json(formattedText);
    } catch (error) {
      console.error('Erro ao buscar texto por ID:', error);
      return res.status(500).json({ error: 'Erro ao buscar texto: ' + error.message });
    }
  }
};