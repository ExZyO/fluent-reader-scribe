import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  content: string;
  progress: number;
  lastRead: Date;
  totalPages: number;
  currentPage: number;
  folder?: string;
  tags: string[];
  highlights: Highlight[];
  bookmarks: Bookmark[];
  dateAdded: Date;
}

export interface Highlight {
  id: string;
  text: string;
  color: string;
  note?: string;
  page: number;
  position: number;
  createdAt: Date;
}

export interface Bookmark {
  id: string;
  page: number;
  position: number;
  note?: string;
  createdAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  bookIds: string[];
  createdAt: Date;
}

export interface ReaderSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  textWidth: number;
  theme: string;
  readingMode: 'paged' | 'scroll';
  backgroundColor: string;
  textColor: string;
  margins: number;
  paragraphSpacing: number;
  textAlign: 'left' | 'justified' | 'center';
}

interface ReaderContextType {
  books: Book[];
  folders: Folder[];
  settings: ReaderSettings;
  addBook: (book: Omit<Book, 'id' | 'dateAdded'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  deleteBooks: (ids: string[]) => void;
  addBooksToFolder: (bookIds: string[], folderId: string) => void;
  removeBooksFromFolder: (bookIds: string[], folderId: string) => void;
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  addFolder: (name: string) => void;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  searchBooks: (query: string) => Book[];
}

const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

const defaultSettings: ReaderSettings = {
  fontSize: 18,
  fontFamily: 'Charter',
  lineHeight: 1.6,
  textWidth: 65,
  theme: 'light',
  readingMode: 'paged',
  backgroundColor: '#ffffff',
  textColor: '#1a1a1a',
  margins: 40,
  paragraphSpacing: 16,
  textAlign: 'left',
};

// Sample books for demonstration
const sampleBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    content: `Chapter 1

In my younger and more vulnerable years my father gave me some advice that I've carried with me ever since.

"Whenever you feel like criticizing anyone," he told me, "just remember that all the people in this world haven't had the advantages that you've had."

He didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.

The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men.

Most of the big shore places were closed now and there were hardly any lights except the shadowy, moving glow of a ferryboat across the Sound. And as the moon rose higher the inessential houses began to melt away until gradually I became aware of the old island here that flowered once for Dutch sailors' eyes—a fresh, green breast of the new world.

Chapter 2

About half way between West Egg and New York the motor road hastily joins the railroad and runs beside it for a quarter of a mile, so as to shrink away from a certain desolate area of land. This is a valley of ashes—a fantastic farm where ashes grow like wheat into ri ands and hills and grotesque gardens; where ashes take the forms of houses and chimneys and rising smoke and, finally, with a transcendent effort, of men who move dimly and already crumbling through the powdery air.

Occasionally a line of gray cars crawls along an invisible track, gives out a ghastly creak, and comes to rest, and immediately the ash-gray men swarm up with leaden spades and stir up an impenetrable cloud, which screens their obscure operations from your sight. But above the gray land and the spasms of bleak dust which drift endlessly over it, you perceive, after a moment, the eyes of Doctor T. J. Eckleburg.`,
    progress: 0.32,
    lastRead: new Date('2024-05-20'),
    totalPages: 180,
    currentPage: 58,
    tags: ['Classic', 'Fiction'],
    highlights: [],
    bookmarks: [],
    dateAdded: new Date('2024-05-10')
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    cover: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop',
    content: 'When he was nearly thirteen, my brother Jem got his arm badly broken at the elbow.',
    progress: 0.14,
    lastRead: new Date('2024-05-25'),
    totalPages: 281,
    currentPage: 39,
    tags: ['Classic', 'Fiction'],
    highlights: [],
    bookmarks: [],
    dateAdded: new Date('2024-05-12')
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    cover: 'https://images.unsplash.com/photo-1531901599143-e9858737e9b4?w=400&h=600&fit=crop',
    content: 'It was a bright cold day in April, and the clocks were striking thirteen.',
    progress: 0.65,
    lastRead: new Date('2024-05-15'),
    totalPages: 328,
    currentPage: 213,
    tags: ['Dystopian', 'Fiction'],
    highlights: [],
    bookmarks: [],
    dateAdded: new Date('2024-05-05')
  },
  {
    id: '4',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    cover: 'https://images.unsplash.com/photo-1610882648335-ced8fc8fa6b5?w=400&h=600&fit=crop',
    content: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
    progress: 0.08,
    lastRead: new Date('2024-05-18'),
    totalPages: 432,
    currentPage: 35,
    tags: ['Romance', 'Classic'],
    highlights: [],
    bookmarks: [],
    dateAdded: new Date('2024-05-08')
  }
];

const defaultFolders: Folder[] = [
  {
    id: '1',
    name: 'Classics',
    bookIds: ['1', '2', '4'],
    createdAt: new Date('2024-05-05')
  },
  {
    id: '2',
    name: 'Dystopian',
    bookIds: ['3'],
    createdAt: new Date('2024-05-06')
  }
];

export const ReaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(() => {
    const savedBooks = localStorage.getItem('books');
    return savedBooks ? JSON.parse(savedBooks) : sampleBooks;
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    const savedFolders = localStorage.getItem('folders');
    return savedFolders ? JSON.parse(savedFolders) : defaultFolders;
  });

  const [settings, setSettings] = useState<ReaderSettings>(() => {
    const savedSettings = localStorage.getItem('readerSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('readerSettings', JSON.stringify(settings));
  }, [settings]);

  const addBook = (book: Omit<Book, 'id' | 'dateAdded'>) => {
    const newBook: Book = {
      ...book,
      id: crypto.randomUUID(),
      dateAdded: new Date(),
    };
    setBooks(prev => [...prev, newBook]);
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(book => book.id === id ? { ...book, ...updates } : book));
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
    setFolders(prev => 
      prev.map(folder => ({
        ...folder,
        bookIds: folder.bookIds.filter(bookId => bookId !== id)
      }))
    );
  };

  const deleteBooks = (ids: string[]) => {
    setBooks(prev => prev.filter(book => !ids.includes(book.id)));
    setFolders(prev => 
      prev.map(folder => ({
        ...folder,
        bookIds: folder.bookIds.filter(bookId => !ids.includes(bookId))
      }))
    );
  };

  const addBooksToFolder = (bookIds: string[], folderId: string) => {
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, bookIds: [...new Set([...folder.bookIds, ...bookIds])] }
          : folder
      )
    );
  };

  const removeBooksFromFolder = (bookIds: string[], folderId: string) => {
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, bookIds: folder.bookIds.filter(id => !bookIds.includes(id)) }
          : folder
      )
    );
  };

  const updateSettings = (newSettings: Partial<ReaderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addFolder = (name: string) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      bookIds: [],
      createdAt: new Date()
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const updateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders(prev => prev.map(folder => folder.id === id ? { ...folder, ...updates } : folder));
  };

  const deleteFolder = (id: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== id));
  };

  const searchBooks = (query: string): Book[] => {
    if (!query) return books;
    
    const lowerCasedQuery = query.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(lowerCasedQuery) || 
      book.author.toLowerCase().includes(lowerCasedQuery) ||
      book.tags.some(tag => tag.toLowerCase().includes(lowerCasedQuery))
    );
  };

  const value = {
    books,
    folders,
    settings,
    addBook,
    updateBook,
    deleteBook,
    deleteBooks,
    addBooksToFolder,
    removeBooksFromFolder,
    updateSettings,
    addFolder,
    updateFolder,
    deleteFolder,
    searchBooks
  };

  return (
    <ReaderContext.Provider value={value}>
      {children}
    </ReaderContext.Provider>
  );
};

export const useReader = () => {
  const context = useContext(ReaderContext);
  if (context === undefined) {
    throw new Error('useReader must be used within a ReaderProvider');
  }
  return context;
};
