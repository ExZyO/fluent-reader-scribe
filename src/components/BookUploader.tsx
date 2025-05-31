
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useReader, Book } from '@/contexts/ReaderContext';

const BookUploader: React.FC = () => {
  const { addBook } = useReader();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    // Check file type
    if (file.type !== 'application/epub+zip') {
      toast.error('Please upload an EPUB file');
      return;
    }
    
    setIsUploading(true);
    
    // This is a mock implementation for now
    // In a real implementation, you would parse the EPUB file
    // and extract the content, metadata, and cover
    setTimeout(() => {
      try {
        // Mock book data
        const mockBook: Omit<Book, 'id' | 'dateAdded'> = {
          title: file.name.replace(/\.epub$/, ''),
          author: 'Unknown Author',
          cover: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=400&h=600&fit=crop`,
          content: 'This is a placeholder for the book content.',
          progress: 0,
          lastRead: new Date(),
          totalPages: Math.floor(Math.random() * 500) + 100,
          currentPage: 0,
          tags: ['Uploaded'],
          highlights: [],
          bookmarks: []
        };
        
        addBook(mockBook);
        
        toast.success(`"${mockBook.title}" added to your library`);
        setIsUploading(false);
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        toast.error('Failed to process the EPUB file');
        setIsUploading(false);
      }
    }, 1500);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        accept=".epub"
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
            Uploading...
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
