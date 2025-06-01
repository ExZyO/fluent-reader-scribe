
import JSZip from 'jszip';

export interface EPUBData {
  title: string;
  author: string;
  content: string;
  cover?: string;
}

export const parseEPUB = async (file: File): Promise<EPUBData> => {
  try {
    const zip = await JSZip.loadAsync(file);
    
    // Find and parse container.xml to get the OPF file path
    const containerFile = zip.file('META-INF/container.xml');
    if (!containerFile) {
      throw new Error('Invalid EPUB: container.xml not found');
    }
    
    const containerXML = await containerFile.async('text');
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXML, 'application/xml');
    
    const rootfileElement = containerDoc.querySelector('rootfile');
    if (!rootfileElement) {
      throw new Error('Invalid EPUB: rootfile not found in container.xml');
    }
    
    const opfPath = rootfileElement.getAttribute('full-path');
    if (!opfPath) {
      throw new Error('Invalid EPUB: OPF path not found');
    }
    
    // Parse the OPF file
    const opfFile = zip.file(opfPath);
    if (!opfFile) {
      throw new Error(`Invalid EPUB: OPF file not found at ${opfPath}`);
    }
    
    const opfXML = await opfFile.async('text');
    const opfDoc = parser.parseFromString(opfXML, 'application/xml');
    
    // Extract metadata
    const titleElement = opfDoc.querySelector('dc\\:title, title');
    const authorElement = opfDoc.querySelector('dc\\:creator, creator');
    
    const title = titleElement?.textContent || 'Unknown Title';
    const author = authorElement?.textContent || 'Unknown Author';
    
    // Get all spine items (reading order)
    const spineItems = Array.from(opfDoc.querySelectorAll('spine itemref'));
    const manifestItems = Array.from(opfDoc.querySelectorAll('manifest item'));
    
    // Build content from spine order
    let content = '';
    const opfDirectory = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
    
    for (const spineItem of spineItems) {
      const idref = spineItem.getAttribute('idref');
      if (!idref) continue;
      
      const manifestItem = manifestItems.find(item => item.getAttribute('id') === idref);
      if (!manifestItem) continue;
      
      const href = manifestItem.getAttribute('href');
      if (!href) continue;
      
      const fullPath = opfDirectory + href;
      const contentFile = zip.file(fullPath);
      
      if (contentFile && manifestItem.getAttribute('media-type')?.includes('html')) {
        try {
          const htmlContent = await contentFile.async('text');
          const htmlDoc = parser.parseFromString(htmlContent, 'text/html');
          
          // Extract text content, preserving paragraph breaks
          const textContent = htmlDoc.body?.textContent || '';
          if (textContent.trim()) {
            content += textContent.trim() + '\n\n';
          }
        } catch (error) {
          console.warn(`Failed to parse content file ${fullPath}:`, error);
        }
      }
    }
    
    // Try to find cover image
    let cover: string | undefined;
    const coverItem = manifestItems.find(item => 
      item.getAttribute('id')?.toLowerCase().includes('cover') ||
      item.getAttribute('href')?.toLowerCase().includes('cover')
    );
    
    if (coverItem) {
      const coverHref = coverItem.getAttribute('href');
      if (coverHref) {
        const coverPath = opfDirectory + coverHref;
        const coverFile = zip.file(coverPath);
        if (coverFile) {
          try {
            const coverBlob = await coverFile.async('blob');
            cover = URL.createObjectURL(coverBlob);
          } catch (error) {
            console.warn('Failed to extract cover image:', error);
          }
        }
      }
    }
    
    if (!content.trim()) {
      throw new Error('No readable content found in EPUB');
    }
    
    return {
      title,
      author,
      content: content.trim(),
      cover
    };
    
  } catch (error) {
    console.error('EPUB parsing error:', error);
    throw new Error(`Failed to parse EPUB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
