
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Book, ReaderSettings as ReaderSettingsType } from '@/contexts/ReaderContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ReaderSettings from './ReaderSettings';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [currentPage, setCurrentPage] = useState(Math.max(1, book.currentPage));
  const [totalPages, setTotalPages] = useState(book.totalPages);
  const [pageInput, setPageInput] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  
  // Increased characters per page for more text
  const calculatePages = () => {
    const text = book.content;
    const charsPerPage = 2400; // Doubled from 1200 to 2400
    return Math.ceil(text.length / charsPerPage);
  };
  
  useEffect(() => {
    const calculatedPages = calculatePages();
    setTotalPages(calculatedPages);
  }, [book.content]);
  
  useEffect(() => {
    const initialPage = Math.max(1, book.currentPage);
    setCurrentPage(initialPage);
    if (initialPage === 1 && book.currentPage === 0) {
      onUpdateProgress(1 / totalPages, 1);
    }
  }, [book.currentPage, totalPages, onUpdateProgress]);
  
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

  const goToPage = (pageNumber: number) => {
    const targetPage = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(targetPage);
    const progress = targetPage / totalPages;
    onUpdateProgress(progress, targetPage);
    return targetPage;
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput);
    if (!isNaN(pageNumber)) {
      const actualPage = goToPage(pageNumber);
      setPageInput('');
      if (actualPage !== pageNumber) {
        toast.info(`Jumped to page ${actualPage} (valid range: 1-${totalPages})`);
      }
    }
  };
  
  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;
    
    // Minimum swipe distance
    const minSwipeDistance = 50;
    
    // Ensure horizontal swipe is more significant than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe left - next page
        goToNextPage();
      } else {
        // Swipe right - previous page
        goToPreviousPage();
      }
    }
    
    touchStartX.current = 0;
    touchStartY.current = 0;
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    // Prevent navigation if user is typing in input field
    if (document.activeElement?.tagName === 'INPUT') return;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        goToNextPage();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        goToPreviousPage();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (settings.readingMode === 'scroll') {
          e.preventDefault();
          goToNextPage();
        }
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (settings.readingMode === 'scroll') {
          e.preventDefault();
          goToPreviousPage();
        }
        break;
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
  }, [currentPage, totalPages, settings.readingMode]);
  
  const getPageContent = () => {
    const text = book.content;
    const charsPerPage = 2400; // Doubled from 1200 to 2400
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
        color: '#ffffff' // Force white text color
      }}
    >
      {/* Top bar with title and controls */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onReturnToLibrary}
              className="hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <ChevronLeft className="mr-1 h-5 w-5" />
              Library
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Return to Library</p>
          </TooltipContent>
        </Tooltip>
        
        <h2 className="text-sm font-medium truncate max-w-xs mx-2">{book.title}</h2>
        
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "transition-all duration-200 hover:scale-110",
                  isCurrentPageBookmarked 
                    ? "text-amber-500 hover:text-amber-600" 
                    : "hover:bg-primary/10 hover:text-primary"
                )}
                onClick={addBookmark}
              >
                <Bookmark className={cn("h-5 w-5", isCurrentPageBookmarked && "fill-current")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isCurrentPageBookmarked ? "Remove bookmark" : "Add bookmark"}</p>
            </TooltipContent>
          </Tooltip>
          
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
          {/* Page content with touch controls */}
          <div 
            ref={contentRef}
            className="flex-1 py-8 select-none"
            style={{
              maxWidth: `${settings.textWidth}rem`,
              margin: '0 auto',
              padding: `0 ${settings.margins}px`,
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
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
                lineHeight: settings.lineHeight,
                color: '#ffffff' // Force white text color
              }}
            >
              {pageContent.split('\n\n').map((paragraph, i) => (
                <p key={i} style={{marginBottom: `${settings.paragraphSpacing}px`, color: '#ffffff'}}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom navigation */}
        <div className="flex items-center justify-between p-4 border-t bg-white dark:bg-gray-800 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage <= 1}
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 min-w-[80px]"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous page (A, ←, swipe right)</p>
            </TooltipContent>
          </Tooltip>
          
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            
            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Hash className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      placeholder="Go to..."
                      className="w-20 pl-8 text-center border-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Jump to page (1-{totalPages})</p>
                </TooltipContent>
              </Tooltip>
            </form>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 min-w-[80px]"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next page (D, →, swipe left)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ReaderView;
