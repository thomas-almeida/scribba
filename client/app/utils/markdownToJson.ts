/**
 * Converts markdown content to structured JSON format
 * @param {string} markdown - The markdown content to convert
 * @param {string} keyword - The keyword used for filename generation
 * @returns {Object} - The structured content object
 */
export const convertMarkdownToStructured = (markdown: string, keyword: string) => {
  // Split the markdown into lines for processing
  const lines = markdown.split('\n').filter(line => line.trim() !== '');
  
  // Initialize the structured content
  const structuredContent = {
    type: "category",
    from: "1015101", // Default ID, can be customized if needed
    contents: {
      title: {
        content: "",
        firstBlock: ""
      },
      subtitles: [] as Array<{id: number, content: string, for: string}>,
      paragraphs: [] as Array<{blocks: string[], subtitleId: number}>,
      lists: [] as Array<{id: number, title: string, blocks: string[], content: string[], type: string}>,
      cta: {
        title: "",
        content: ""
      }
    },
    blueprint: [] as Array<{type: string, id: number | null}>,
    audioFileName: `${keyword.toLowerCase().replace(/\s+/g, '-')}.wav`
  };

  let currentSection: 'title' | 'subtitle' | 'paragraph' | 'list' | 'cta' = 'title';
  let currentSubtitleId = -1; // Start at -1 so first increment makes it 0
  let currentListId = -1; // Start at -1 so first increment makes it 0
  let currentParagraphBlocks: string[] = [];
  let currentListItems: string[] = [];
  let currentListTitle = "";
  let currentListBlocks: string[] = [];
  let blueprintIndex = 0;
  let foundFirstBlock = false;
  
  // Process each line of the markdown
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this is a title (usually the first h1 or h2)
    if (i === 0 || line.startsWith('# ') || line.startsWith('## ')) {
      const titleText = line.replace(/^#+\s+/, '');
      console.log('title', titleText);
      structuredContent.contents.title.content = titleText;
      
      // Add to blueprint
      structuredContent.blueprint.push({
        type: "title",
        id: null
      });
      blueprintIndex++;
      
      // Look ahead to find the first paragraph after the title to use as firstBlock
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j].trim();
        // If it's not a heading, list item, or empty line, it's our firstBlock
        if (nextLine && !nextLine.startsWith('#') && 
            !nextLine.startsWith('- ') && !nextLine.startsWith('* ') && 
            !nextLine.match(/^\d+\.\s/)) {
          structuredContent.contents.title.firstBlock = nextLine;
          foundFirstBlock = true;
          // Skip this line as we've already processed it as firstBlock
          i = j;
          break;
        }
        j++;
      }
      
      currentSection = 'paragraph';
      continue;
    }
    
    // Check if this is a subtitle (h2, h3 or h4)
    if (line.startsWith('## ') || line.startsWith('### ') || line.startsWith('#### ')) {
      const subtitleText = line.replace(/^#+\s+/, '');
      
      // If we were collecting list items, finalize the list before moving on
      if (currentSection === 'list' && currentListItems.length > 0) {
        structuredContent.contents.lists.push({
          id: currentListId,
          title: currentListTitle,
          blocks: [...currentListBlocks],
          content: [...currentListItems],
          type: "unordened"
        });
        
        // Add to blueprint if not already added
        if (structuredContent.blueprint.findIndex(item => item.type === "list" && item.id === currentListId) === -1) {
          structuredContent.blueprint.push({
            type: "list",
            id: currentListId
          });
          blueprintIndex++;
        }
        
        currentListItems = [];
        currentListBlocks = [];
      }
      
      // Check if this is a CTA section
      if (subtitleText.toLowerCase().includes("solicite") || 
          subtitleText.toLowerCase().includes("orçamento") || 
          subtitleText.toLowerCase().includes("contato")) {
        structuredContent.contents.cta.title = subtitleText;
        
        // The next paragraph will be the CTA content
        if (i + 1 < lines.length && !lines[i + 1].startsWith('#')) {
          structuredContent.contents.cta.content = lines[i + 1].trim();
          i++; // Skip the next line since we've processed it
        }
        
        // Add to blueprint
        structuredContent.blueprint.push({
          type: "cta",
          id: null
        });
        blueprintIndex++;
        
        currentSection = 'cta';
        continue;
      }
      
      // Regular subtitle
      currentSubtitleId++;
      
      structuredContent.contents.subtitles.push({
        id: currentSubtitleId,
        content: subtitleText,
        for: "text"
      });
      
      // Add to blueprint
      structuredContent.blueprint.push({
        type: "subtitle",
        id: currentSubtitleId
      });
      blueprintIndex++;
      
      currentSection = 'paragraph';
      currentParagraphBlocks = [];
      continue;
    }
    
    // Check if this is a list item
    if (line.startsWith('- ') || line.startsWith('* ') || line.match(/^\d+\.\s/)) {
      // If this is the first list item, create a new list
      if (currentSection !== 'list' || currentListItems.length === 0) {
        // Check if there's a list title in the previous line
        let listTitle = "";
        if (i > 0) {
          const prevLine = lines[i-1].trim();
          // If the previous line is a heading, use it as the list title
          if (prevLine.startsWith('#')) {
            listTitle = prevLine.replace(/^#+\s+/, '');
            
            // Remove this heading from subtitles if it was added there
            const subtitleIndex = structuredContent.contents.subtitles.findIndex(
              subtitle => subtitle.content === listTitle
            );
            
            if (subtitleIndex !== -1) {
              // Remove from subtitles array
              structuredContent.contents.subtitles.splice(subtitleIndex, 1);
              
              // Update blueprint - remove the subtitle entry
              const bpIndex = structuredContent.blueprint.findIndex(
                item => item.type === "subtitle" && item.id === subtitleIndex
              );
              
              if (bpIndex !== -1) {
                structuredContent.blueprint.splice(bpIndex, 1);
              }
              
              // Adjust IDs for all subtitles and paragraphs after the removed one
              structuredContent.contents.subtitles.forEach((subtitle, idx) => {
                if (subtitle.id > subtitleIndex) {
                  subtitle.id--;
                }
              });
              
              structuredContent.contents.paragraphs.forEach(paragraph => {
                if (paragraph.subtitleId > subtitleIndex) {
                  paragraph.subtitleId--;
                }
              });
              
              structuredContent.blueprint.forEach(item => {
                if (item.type === "subtitle" && item.id !== null && item.id > subtitleIndex) {
                  item.id--;
                }
                if (item.type === "text" && item.id !== null && item.id > subtitleIndex) {
                  item.id--;
                }
              });
              
              // Decrement currentSubtitleId since we removed one
              currentSubtitleId--;
            }
          } else if (!prevLine.startsWith('-') && !prevLine.startsWith('*') && !prevLine.match(/^\d+\.\s/)) {
            // Otherwise, use the previous line as a block for the list
            currentListBlocks.push(prevLine);
          }
        }
        
        currentListId++;
        currentListTitle = listTitle;
        
        // Add to blueprint
        structuredContent.blueprint.push({
          type: "list",
          id: currentListId
        });
        blueprintIndex++;
      }
      
      const itemText = line.replace(/^[-*]\s+|^\d+\.\s+/, '');
      currentListItems.push(itemText);
      currentSection = 'list';
      continue;
    }
    
    // If we've been collecting list items and this is not a list item, finalize the list
    if (currentSection === 'list' && currentListItems.length > 0 && 
        !line.startsWith('- ') && !line.startsWith('* ') && !line.match(/^\d+\.\s/)) {
      structuredContent.contents.lists.push({
        id: currentListId,
        title: currentListTitle,
        blocks: [...currentListBlocks],
        content: [...currentListItems],
        type: "unordened"
      });
      
      currentListItems = [];
      currentListBlocks = [];
      currentSection = 'paragraph';
    }
    
    // If none of the above, treat as a paragraph
    if (currentSection === 'paragraph') {
      // Skip if this line is already used as firstBlock
      if (foundFirstBlock && line === structuredContent.contents.title.firstBlock) {
        continue;
      }
      
      currentParagraphBlocks.push(line);
      
      // If next line is a new section, finalize this paragraph
      if (i === lines.length - 1 || 
          lines[i+1].startsWith('#') || 
          lines[i+1].startsWith('- ') || 
          lines[i+1].startsWith('* ') || 
          lines[i+1].match(/^\d+\.\s/)) {
        
        if (currentParagraphBlocks.length > 0) {
          // Find the corresponding subtitle
          structuredContent.contents.paragraphs.push({
            blocks: [...currentParagraphBlocks],
            subtitleId: currentSubtitleId
          });
          
          // Add to blueprint
          structuredContent.blueprint.push({
            type: "text",
            id: currentSubtitleId
          });
          blueprintIndex++;
          
          currentParagraphBlocks = [];
        }
      }
    }
  }
  
  // Finalize any remaining sections
  if (currentSection === 'list' && currentListItems.length > 0) {
    structuredContent.contents.lists.push({
      id: currentListId,
      title: currentListTitle,
      blocks: [...currentListBlocks],
      content: [...currentListItems],
      type: "unordened"
    });
  } else if (currentSection === 'paragraph' && currentParagraphBlocks.length > 0) {
    structuredContent.contents.paragraphs.push({
      blocks: [...currentParagraphBlocks],
      subtitleId: currentSubtitleId
    });
    
    // Add to blueprint
    structuredContent.blueprint.push({
      type: "text",
      id: currentSubtitleId
    });
  }
  
  return structuredContent;
};