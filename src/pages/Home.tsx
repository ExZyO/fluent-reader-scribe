import React, { useState, useEffect } from 'react';
import { useReader, Book, Folder } from '@/contexts/ReaderContext';
import LibraryBook from '@/components/LibraryBook';
import FolderList from '@/components/FolderList';
import BookUploader from '@/components/BookUploader';
import LibraryViewToggle from '@/components/LibraryViewToggle';
import BulkActions from '@/components/BulkActions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';

const Home = () => {
  const { 
    books, 
    folders, 
    updateBook, 
    deleteBook,
    deleteBooks,
    addBooksToFolder,
    addFolder, 
    updateFolder, 
    deleteFolder,
    searchBooks
  } = useReader();
  
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]);
  const [bookCount, setBookCount] = useState<Record<string, number>>({});
  const [recentlyAdded, setRecentlyAdded] = useState<Book[]>([]);
  const [recentlyRead, setRecentlyRead] = useState<Book[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  useEffect(() => {
    // Calculate book counts per folder
    const counts: Record<string, number> = {};
    folders.forEach(folder => {
      counts[folder.id] = books.filter(book => folder.bookIds.includes(book.id)).length;
    });
    setBookCount(counts);
    
    // Get recently added books (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recent = [...books]
      .filter(book => new Date(book.dateAdded) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 4);
    setRecentlyAdded(recent);
    
    // Get recently read books
    const recentRead = [...books]
      .sort((a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime())
      .slice(0, 4);
    setRecentlyRead(recentRead);
  }, [books, folders]);
  
  useEffect(() => {
    let filteredBooks = searchQuery ? searchBooks(searchQuery) : books;
    
    if (selectedFolder) {
      const folder = folders.find(f => f.id === selectedFolder);
      if (folder) {
        filteredBooks = filteredBooks.filter(book => folder.bookIds.includes(book.id));
      }
    }
    
    setDisplayedBooks(filteredBooks);
  }, [selectedFolder, books, folders, searchQuery]);
  
  const handleDeleteBook = (id: string) => {
    deleteBook(id);
  };
  
  const handleResetProgress = (id: string) => {
    updateBook(id, { progress: 0, currentPage: 0 });
  };
  
  const handleFolderNameChange = (id: string, newName: string) => {
    updateFolder(id, { name: newName });
  };

  const handleBookSelect = (bookId: string, selected: boolean) => {
    if (selected) {
      setSelectedBooks(prev => [...prev, bookId]);
    } else {
      setSelectedBooks(prev => prev.filter(id => id !== bookId));
    }
  };

  const handleSelectAll = () => {
    const allBookIds = displayedBooks.map(book => book.id);
    setSelectedBooks(allBookIds);
  };

  const handleClearSelection = () => {
    setSelectedBooks([]);
    setIsSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedBooks([]);
    }
  };

  const handleBulkAddToFolder = (bookIds: string[], folderId: string) => {
    addBooksToFolder(bookIds, folderId);
  };

  const handleBulkDelete = (bookIds: string[]) => {
    deleteBooks(bookIds);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar with folders */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <BookUploader />
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <FolderList 
                folders={folders}
                selectedFolder={selectedFolder}
                bookCount={bookCount}
                onSelectFolder={setSelectedFolder}
                onAddFolder={addFolder}
                onRenameFolder={handleFolderNameChange}
                onDeleteFolder={deleteFolder}
              />
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            {/* Search and view toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold">Your Library</h1>
              
              <div className="flex gap-2">
                <div className="relative flex-grow sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <LibraryViewToggle 
                  viewMode={viewMode}
                  onChange={setViewMode}
                />
              </div>
            </div>

            {/* Selection controls */}
            {displayedBooks.length > 0 && (
              <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-4">
                  <Button
                    variant={isSelectionMode ? "default" : "outline"}
                    size="sm"
                    onClick={toggleSelectionMode}
                  >
                    {isSelectionMode ? "Cancel Selection" : "Select Books"}
                  </Button>
                  
                  {isSelectionMode && (
                    <>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedBooks.length === displayedBooks.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleSelectAll();
                            } else {
                              setSelectedBooks([]);
                            }
                          }}
                        />
                        <span className="text-sm">Select All</span>
                      </div>
                      
                      {selectedBooks.length > 0 && (
                        <span className="text-sm text-gray-600">
                          {selectedBooks.length} selected
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Recently read section (if no folder selected) */}
            {!selectedFolder && !searchQuery && recentlyRead.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Continue Reading</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentlyRead.map(book => (
                    <LibraryBook
                      key={book.id}
                      book={book}
                      onDelete={handleDeleteBook}
                      onReset={handleResetProgress}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedBooks.includes(book.id)}
                      onSelect={handleBookSelect}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Recently added section (if no folder selected) */}
            {!selectedFolder && !searchQuery && recentlyAdded.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Recently Added</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recentlyAdded.map(book => (
                    <LibraryBook
                      key={book.id}
                      book={book}
                      onDelete={handleDeleteBook}
                      onReset={handleResetProgress}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedBooks.includes(book.id)}
                      onSelect={handleBookSelect}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* All books or filtered books */}
            <div>
              {selectedFolder && (
                <h2 className="text-xl font-semibold mb-4">
                  {folders.find(f => f.id === selectedFolder)?.name || 'All Books'}
                </h2>
              )}
              
              {searchQuery && (
                <h2 className="text-xl font-semibold mb-4">
                  Search Results{' '}
                  <span className="text-gray-500 text-lg">
                    ({displayedBooks.length} {displayedBooks.length === 1 ? 'book' : 'books'})
                  </span>
                </h2>
              )}
              
              {displayedBooks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No books found</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {displayedBooks.map(book => (
                    <LibraryBook
                      key={book.id}
                      book={book}
                      onDelete={handleDeleteBook}
                      onReset={handleResetProgress}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedBooks.includes(book.id)}
                      onSelect={handleBookSelect}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {displayedBooks.map(book => (
                    <LibraryBook
                      key={book.id}
                      book={book}
                      onDelete={handleDeleteBook}
                      onReset={handleResetProgress}
                      className="flex flex-row h-24 !shadow-sm"
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedBooks.includes(book.id)}
                      onSelect={handleBookSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedBooks={selectedBooks}
        folders={folders}
        onClearSelection={handleClearSelection}
        onDeleteBooks={handleBulkDelete}
        onAddToFolder={handleBulkAddToFolder}
      />
    </div>
  );
};

export default Home;
