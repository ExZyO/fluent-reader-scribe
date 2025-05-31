
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useReader, Book } from '@/contexts/ReaderContext';
import { parseEPUB } from '@/utils/epubParser';

const BookUploader: React.FC = () => {
  const { addBook } = useReader();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    // Check file type
    if (file.type !== 'application/epub+zip' && !file.name.toLowerCase().endsWith('.epub')) {
      toast.error('Please upload an EPUB file');
      return;
    }
    
    setIsUploading(true);
    
    try {
      console.log('Starting EPUB parsing for:', file.name);
      const epubData = await parseEPUB(file);
      console.log('EPUB parsing completed:', { 
        title: epubData.title, 
        author: epubData.author, 
        contentLength: epubData.content.length 
      });
      
      const mockBook: Omit<Book, 'id' | 'dateAdded'> = {
        title: epubData.title,
        author: epubData.author,
        cover: epubData.cover || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400&h=600&fit=crop`,
        content: epubData.content,
        progress: 0,
        lastRead: new Date(),
        totalPages: Math.floor(epubData.content.length / 1200) + 1,
        currentPage: 0,
        tags: ['Uploaded'],
        highlights: [],
        bookmarks: []
      };
      
      addBook(mockBook);
      
      toast.success(`"${epubData.title}" added to your library`);
      setIsUploading(false);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('EPUB parsing error:', error);
      toast.error('Failed to process the EPUB file. Please ensure it\'s a valid EPUB.');
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        accept=".epub,application/epub+zip"
        onChange={handleUpload}
        className="hidden"
        ref={fileInputRef}
      />
      <Button
        onClick={triggerFileInput}
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing EPUB...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Add eBook
          </>
        )}
      </Button>
    </>
  );
};

export default BookUploader;
