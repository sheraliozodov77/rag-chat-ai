// Utility to split text into smaller chunks
export const splitTextIntoChunks = (text, maxTokens = 800) => {
    const sentences = text.split(/(?<=\.)\s/); // Split by sentences
    const chunks = [];
    let currentChunk = "";
  
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxTokens) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += " " + sentence;
      }
    }
  
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
  
    return chunks;
  };
  