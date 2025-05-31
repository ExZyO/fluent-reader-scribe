
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReader, Bookmark } from '@/contexts/ReaderContext';
import ReaderView from '@/components/ReaderView';
import { toast } from 'sonner';

const Reader = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { books, updateBook, settings, updateSettings } = useReader();
  
  const book = books.find(b => b.id === bookId);
  
  useEffect(() => {
    if (!book) {
      toast.error('Book not found');
      navigate('/');
    }
  }, [book, navigate]);
  
  const handleUpdateProgress = (progress: number, page: number) => {
    if (book) {
      updateBook(book.id, {
        progress,
        currentPage: page,
        lastRead: new Date()
      });
    }
  };
  
  const handleToggleBookmark = (page: number, position: number) => {
    if (!book) return;
    
    const existingBookmarkIndex = book.bookmarks.findIndex(bm => bm.page === page);
    
    if (existingBookmarkIndex >= 0) {
      // Remove bookmark
      const updatedBookmarks = [...book.bookmarks];
      updatedBookmarks.splice(existingBookmarkIndex, 1);
      updateBook(book.id, { bookmarks: updatedBookmarks });
    } else {
      // Add bookmark
      const newBookmark: Bookmark = {
        id: crypto.randomUUID(),
        page,
        position,
        createdAt: new Date()
      };
      updateBook(book.id, { 
        bookmarks: [...book.bookmarks, newBookmark]
      });
    }
  };
  
  const handleReturnToLibrary = () => {
    navigate('/');
  };
  
  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <ReaderView
      book={book}
      settings={settings}
      onUpdateProgress={handleUpdateProgress}
      onUpdateSettings={updateSettings}
      onToggleBookmark={handleToggleBookmark}
      onReturnToLibrary={handleReturnToLibrary}
    />
  );
};

export default Reader;
