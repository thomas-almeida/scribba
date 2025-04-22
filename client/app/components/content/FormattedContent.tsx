import React from 'react';

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

interface FormattedContentProps {
  content: StructuredContent;
}

const FormattedContent: React.FC<FormattedContentProps> = ({ content }) => {
  // Function to render content based on blueprint
  const renderContent = () => {
    return content.blueprint.map((item, index) => {
      switch (item.type) {
        case 'title':
          return (
            <div key={`title-${index}`} className="mb-6">
              <h1 className="text-3xl font-bold mb-4">{content.contents.title.content}</h1>
              <p className="text-lg">{content.contents.title.firstBlock}</p>
            </div>
          );

        case 'subtitle':
          const subtitle = content.contents.subtitles.find(s => s.id === item.id);
          return subtitle ? (
            <h2 key={`subtitle-${index}`} className="text-2xl font-semibold mt-8 mb-4">
              {subtitle.content}
            </h2>
          ) : null;

        case 'text':
          const paragraph = content.contents.paragraphs.find(p => p.subtitleId === item.id);
          return paragraph ? (
            <div key={`text-${index}`} className="mb-6">
              {paragraph.blocks.map((block, blockIndex) => (
                <p key={`block-${blockIndex}`} className="mb-3">{block}</p>
              ))}
            </div>
          ) : null;

        case 'list':
          const list = content.contents.lists.find(l => l.id === item.id);
          return list ? (
            <div key={`list-${index}`} className="mb-6">
              {list.title && <h3 className="text-xl font-semibold mb-3">{list.title}</h3>}
              {list.blocks.length > 0 && list.blocks.map((block, blockIndex) => (
                <p key={`list-block-${blockIndex}`} className="mb-3">{block}</p>
              ))}
              <ul className={`${list.type === 'ordered' ? 'list-decimal' : 'list-disc'} pl-6 mb-4`}>
                {list.content.map((item, itemIndex) => (
                  <li key={`list-item-${itemIndex}`} className="mb-2">{item}</li>
                ))}
              </ul>
            </div>
          ) : null;

        case 'cta':
          return (
            <div key={`cta-${index}`} className="bg-gray-100 p-6 rounded-lg mt-8">
              <h3 className="text-xl font-semibold mb-3">{content.contents.cta.title}</h3>
              <p>{content.contents.cta.content}</p>
            </div>
          );

        default:
          return null;
      }
    });
  };

  return (
    <article className="formatted-content prose prose-lg max-w-none">
      {renderContent()}
    </article>
  );
};

export default FormattedContent;