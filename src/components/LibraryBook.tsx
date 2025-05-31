
import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '@/contexts/ReaderContext';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Bookmark } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface LibraryBookProps {
  book: Book;
  onDelete: (id: string) => void;
  onReset: (id: string) => void;
  className?: string;
}

const LibraryBook: React.FC<LibraryBookProps> = ({ book, onDelete, onReset, className }) => {
  const progressPercentage = Math.floor(book.progress * 100);
  
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(book.lastRead));

  const handleDelete = () => {
    onDelete(book.id);
    toast.success(`"${book.title}" has been removed from your library`);
  };

  const handleReset = () => {
    onReset(book.id);
    toast.success(`Progress reset for "${book.title}"`);
  };

  return (
    <div className={cn('group relative flex flex-col bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300', className)}>
      <div className="relative pt-[140%]">
        <Link to={`/reader/${book.id}`} className="absolute inset-0">
          <img 
            src={book.cover} 
            alt={`${book.title} cover`} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute top-2 right-2 rounded-full p-1 bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <MoreHorizontal className="h-5 w-5 text-gray-700" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleReset}>Reset Progress</DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-500">
              Remove from Library
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {book.bookmarks && book.bookmarks.length > 0 && (
          <div className="absolute top-2 left-2">
            <Bookmark className="h-5 w-5 text-primary fill-primary" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col p-3">
        <h3 className="font-medium text-gray-900 line-clamp-1">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-2">{book.author}</p>
        
        <div className="mt-auto">
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{progressPercentage}%</span>
            <span>Last read: {formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryBook;
