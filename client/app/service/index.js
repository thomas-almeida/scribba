
import axios from 'axios'
import promptsData from '../prompts.json'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'

/**
 * Formats the prompt content into a single text string based on the prompt type
 * @param {Object} content - The content object from the prompt
 * @param {string} title - The title of the prompt
 * @returns {string} - Formatted text
 */
const formatPromptContent = (content, title) => {
  // Check if the title contains 'Calculadora' to use the appropriate format
  if (title.toLowerCase().includes('calculadora')) {
    return `
      ${content.intro}

      O que são calculadoras personalizadas para brindes?
      ${content.description}

      Por que escolher calculadoras personalizadas como brinde?
      ${content.benefits.join('\n      ')}

      Exemplos de calculadoras personalizadas para brindes
      ${content.models}

      Benefícios para sua marca
      ${content.conclusion}

      Solicite seu orçamento
      ${content.cta}
    `;
  } else {
    // Default format for other products (like squeeze)
    return `
      ${content.intro}

      O que é um squeeze?
      ${content.description}

      ${content.sustainability}

      Por que escolher squeezes personalizados como brinde?
      ${content.benefits.join('\n      ')}

      Modelos e opções para todos os gostos e segmentos
      ${content.models}

      Transforme seu brinde em uma experiência memorável
      ${content.conclusion}

      Solicite agora mesmo o seu orçamento!
      ${content.cta}
    `;
  }
};

/**
 * Creates a SEO prompt using the template and keyword
 * @param {string} keyword - The keyword to use in the prompt
 * @param {number} promptId - The ID of the prompt to use (defaults to 0)
 * @returns {Promise<Object>} - The API response with generated text
 */
const createSEOPrompt = async (keyword, promptId = 0) => {
  // Find the prompt with the given ID
  const promptData = promptsData.find(prompt => prompt.id === promptId);
  
  if (!promptData) {
    throw new Error(`Prompt with ID ${promptId} not found`);
  }
  
  // Format the content into a text string
  const formattedContent = formatPromptContent(promptData.content, promptData.title);
  
  // Create the final prompt using the template
  const finalPrompt = promptData.promptTemplate
    .replace('{title}', promptData.title)
    .replace('{keyword}', keyword);
  
  const md = {
    model: "meta-llama/llama-4-maverick:free",
    messages: [
      {
        role: "user",
        content: `${finalPrompt}\n\n${formattedContent}`
      }
    ]
  };

  const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', md, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPR_API_KEY}`
    }
  });
  
  return response.data;
};

/**
 * Converts plain text to markdown format
 * @param {string} text - The plain text to convert
 * @returns {Promise<string>} - The markdown formatted text
 */
const convertToMarkdown = async (text) => {
  const md = {
    model: "meta-llama/llama-4-maverick:free",
    messages: [
      {
        role: "user",
        content: `Converta o seguinte texto para formato Markdown, mantendo a estrutura e formatação adequadas:\n\n${text}`
      }
    ]
  };

  const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', md, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPR_API_KEY}`
    }
  });
  
  return response.data.choices[0].message.content;
};

/**
 * Processes a keyword to generate content in three steps:
 * 1. Generate text based on the keyword
 * 2. Convert the text to markdown
 * 3. Structure the content as JSON
 * 
 * @param {string} keyword - The keyword to process
 * @param {number} promptId - The ID of the prompt template to use
 * @returns {Promise<Object>} - Object containing results of all three steps
 */
const processKeyword = async (keyword, promptId = 0) => {
  try {
    // Step 1: Generate the text content
    const textResponse = await createSEOPrompt(keyword, promptId);
    const generatedText = textResponse.choices[0].message.content;
    
    // Step 2: Convert to markdown
    const markdownText = await convertToMarkdown(generatedText);
    
    // Step 3: Convert to structured JSON (using the existing utility)
    // This will be handled by the frontend component that imports the markdownToJson utility
    
    return {
      textResponse,
      markdownText,
      // The structured JSON will be generated in the frontend
    };
  } catch (error) {
    console.error('Error processing keyword:', error);
    throw error;
  }
};

/**
 * Saves a liked text to the local JSON database
 * @param {string} keyword - The keyword used to generate the text
 * @param {string} markdownText - The markdown formatted text
 * @param {Object} jsonStructure - The structured JSON representation of the text
 * @returns {Promise<Object>} - The updated database with the new entry
 */
const saveLikedText = async (keyword, markdownText, jsonStructure) => {
  try {
    // Path to the JSON database file
    const dbPath = path.resolve('client/app/data/liked-texts.json');
    
    // Read the current database or create a new one if it doesn't exist
    let database = [];
    try {
      const data = await readFile(dbPath, 'utf8');
      database = JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is invalid, start with an empty array
      console.log('Creating new database file');
    }
    
    // Create a new entry with timestamp
    const newEntry = {
      id: Date.now().toString(),
      keyword,
      markdownText,
      jsonStructure,
      savedAt: new Date().toISOString()
    };
    
    // Add the new entry to the database
    database.push(newEntry);
    
    // Write the updated database back to the file
    await writeFile(dbPath, JSON.stringify(database, null, 2), 'utf8');
    
    return { success: true, database, newEntry };
  } catch (error) {
    console.error('Error saving liked text:', error);
    throw error;
  }
};

/**
 * Gets all liked texts from the local JSON database
 * @returns {Promise<Array>} - Array of all saved texts
 */
const getLikedTexts = async () => {
  try {
    // Path to the JSON database file
    const dbPath = path.resolve('client/app/data/liked-texts.json');
    
    // Read the current database or return empty array if it doesn't exist
    try {
      const data = await readFile(dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is invalid, return an empty array
      return [];
    }
  } catch (error) {
    console.error('Error getting liked texts:', error);
    throw error;
  }
};

export { createSEOPrompt, convertToMarkdown, processKeyword, saveLikedText, getLikedTexts };
export default processKeyword;