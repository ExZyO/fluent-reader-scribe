
import JSZip from 'jszip';

export interface EPUBMetadata {
  title: string;
  author: string;
  cover?: string;
  content: string;
}

export const parseEPUB = async (file: File): Promise<EPUBMetadata> => {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);
  
  // Find container.xml to get the path to the .opf file
  const containerFile = zipContent.file('META-INF/container.xml');
  if (!containerFile) {
    throw new Error('Invalid EPUB: Missing container.xml');
  }
  
  const containerXML = await containerFile.async('text');
  const opfPath = extractOPFPath(containerXML);
  
  // Parse the .opf file for metadata and manifest
  const opfFile = zipContent.file(opfPath);
  if (!opfFile) {
    throw new Error('Invalid EPUB: Missing OPF file');
  }
  
  const opfContent = await opfFile.async('text');
  const { metadata, manifest, spine } = parseOPF(opfContent);
  
  // Extract content from all chapters
  const content = await extractContent(zipContent, manifest, spine, opfPath);
  
  // Try to extract cover image
  const cover = await extractCover(zipContent, manifest, opfPath);
  
  return {
    title: metadata.title || file.name.replace('.epub', ''),
    author: metadata.author || 'Unknown Author',
    cover,
    content
  };
};

const extractOPFPath = (containerXML: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(containerXML, 'text/xml');
  const rootfile = doc.querySelector('rootfile');
  const fullPath = rootfile?.getAttribute('full-path');
  
  if (!fullPath) {
    throw new Error('Invalid EPUB: Cannot find OPF path');
  }
  
  return fullPath;
};

const parseOPF = (opfContent: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(opfContent, 'text/xml');
  
  // Extract metadata
  const titleElement = doc.querySelector('dc\\:title, title');
  const authorElement = doc.querySelector('dc\\:creator, creator');
  
  const metadata = {
    title: titleElement?.textContent || '',
    author: authorElement?.textContent || ''
  };
  
  // Extract manifest (file list)
  const manifest = new Map<string, { href: string; mediaType: string }>();
  const manifestItems = doc.querySelectorAll('manifest item');
  
  manifestItems.forEach(item => {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    const mediaType = item.getAttribute('media-type');
    
    if (id && href && mediaType) {
      manifest.set(id, { href, mediaType });
    }
  });
  
  // Extract spine (reading order)
  const spine: string[] = [];
  const spineItems = doc.querySelectorAll('spine itemref');
  
  spineItems.forEach(item => {
    const idref = item.getAttribute('idref');
    if (idref) {
      spine.push(idref);
    }
  });
  
  return { metadata, manifest, spine };
};

const extractContent = async (
  zip: JSZip, 
  manifest: Map<string, { href: string; mediaType: string }>, 
  spine: string[], 
  opfPath: string
): Promise<string> => {
  const basePath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
  let fullContent = '';
  
  for (const itemId of spine) {
    const item = manifest.get(itemId);
    if (!item || !item.mediaType.includes('html')) continue;
    
    const filePath = basePath + item.href;
    const file = zip.file(filePath);
    
    if (file) {
      try {
        const htmlContent = await file.async('text');
        const textContent = extractTextFromHTML(htmlContent);
        fullContent += textContent + '\n\n';
      } catch (error) {
        console.warn(`Failed to extract content from ${filePath}:`, error);
      }
    }
  }
  
  return fullContent.trim() || 'Content could not be extracted from this EPUB file.';
};

const extractTextFromHTML = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Remove script and style elements
  const scripts = doc.querySelectorAll('script, style');
  scripts.forEach(el => el.remove());
  
  // Get text content and clean it up
  let text = doc.body?.textContent || doc.textContent || '';
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Add paragraph breaks
  text = text.replace(/\.\s+/g, '.\n\n');
  
  return text;
};

const extractCover = async (
  zip: JSZip, 
  manifest: Map<string, { href: string; mediaType: string }>, 
  opfPath: string
): Promise<string | undefined> => {
  const basePath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
  
  // Look for cover image in manifest
  for (const [id, item] of manifest) {
    if (id.toLowerCase().includes('cover') && item.mediaType.startsWith('image/')) {
      const filePath = basePath + item.href;
      const file = zip.file(filePath);
      
      if (file) {
        try {
          const imageData = await file.async('base64');
          return `data:${item.mediaType};base64,${imageData}`;
        } catch (error) {
          console.warn(`Failed to extract cover image:`, error);
        }
      }
    }
  }
  
  return undefined;
};
