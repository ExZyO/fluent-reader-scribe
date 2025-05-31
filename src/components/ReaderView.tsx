
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Book, ReaderSettings as ReaderSettingsType } from '@/contexts/ReaderContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ReaderSettings from './ReaderSettings';

interface ReaderViewProps {
  book: Book;
  settings: ReaderSettingsType;
  onUpdateProgress: (progress: number, page: number) => void;
  onUpdateSettings: (settings: Partial<ReaderSettingsType>) => void;
  onToggleBookmark: (page: number, position: number) => void;
  onReturnToLibrary: () => void;
}

const ReaderView: React.FC<ReaderViewProps> = ({
  book,
  settings,
  onUpdateProgress,
  onUpdateSettings,
  onToggleBookmark,
  onReturnToLibrary
}) => {
  const [currentPage, setCurrentPage] = useState(book.currentPage);
  const [totalPages, setTotalPages] = useState(book.totalPages);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Mock implementation of page calculation
  // In a real implementation, this would be based on the actual content
  const calculatePages = () => {
    // Simple text-based mock pagination
    const text = book.content;
    const charsPerPage = 1200; // Rough approximation
    return Math.ceil(text.length / charsPerPage);
  };
  
  useEffect(() => {
    const calculatedPages = calculatePages();
    setTotalPages(calculatedPages);
  }, [book.content]);
  
  useEffect(() => {
    setCurrentPage(book.currentPage);
  }, [book.currentPage]);
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      const progress = nextPage / totalPages;
      onUpdateProgress(progress, nextPage);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      const progress = prevPage / totalPages;
      onUpdateProgress(progress, prevPage);
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      goToNextPage();
    } else if (e.key === 'ArrowLeft') {
      goToPreviousPage();
    }
  };

  const addBookmark = () => {
    onToggleBookmark(currentPage, 0);
    toast.success('Bookmark added');
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, totalPages]);
  
  // Mock content for the current page
  const getPageContent = () => {
    const text = book.content;
    const charsPerPage = 1200;
    const start = (currentPage - 1) * charsPerPage;
    const end = Math.min(start + charsPerPage, text.length);
    return text.substring(start, end);
  };

  const pageContent = getPageContent();
  
  const isCurrentPageBookmarked = book.bookmarks.some(bm => bm.page === currentPage);
  
  return (
    <div
      className={cn("min-h-screen flex flex-col transition-colors")}
      style={{
        backgroundColor: settings.backgroundColor,
        color: settings.textColor
      }}
    >
      {/* Top bar with title and controls */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
        <Button variant="ghost" size="sm" onClick={onReturnToLibrary}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Library
        </Button>
        
        <h2 className="text-sm font-medium truncate max-w-xs mx-2">{book.title}</h2>
        
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className={isCurrentPageBookmarked ? "text-primary" : ""}
            onClick={addBookmark}
          >
            <Bookmark className={cn("h-5 w-5", isCurrentPageBookmarked && "fill-current")} />
            <span className="sr-only">
              {isCurrentPageBookmarked ? "Remove bookmark" : "Add bookmark"}
            </span>
          </Button>
          
          <ReaderSettings 
            settings={settings}
            onChangeSettings={onUpdateSettings}
          />
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <div 
          className={cn(
            "flex-1 flex overflow-hidden",
            settings.readingMode === 'scroll' && "overflow-y-auto"
          )}
        >
          {/* Page content */}
          <div 
            ref={contentRef}
            className="flex-1 py-8"
            style={{
              maxWidth: `${settings.textWidth}rem`,
              margin: '0 auto',
              padding: `0 ${settings.margins}px`,
            }}
          >
            <div 
              className={cn(
                "prose max-w-none",
                settings.textAlign === 'justified' && "text-justify",
                settings.textAlign === 'center' && "text-center"
              )}
              style={{
                fontFamily: settings.fontFamily,
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight
              }}
            >
              {pageContent.split('\n\n').map((paragraph, i) => (
                <p key={i} style={{marginBottom: `${settings.paragraphSpacing}px`}}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom navigation */}
        <div className="flex items-center justify-between p-4 border-t bg-white dark:bg-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReaderView;
