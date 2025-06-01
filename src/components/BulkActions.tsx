
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, FolderPlus, X } from 'lucide-react';
import { Folder } from '@/contexts/ReaderContext';
import { toast } from 'sonner';

interface BulkActionsProps {
  selectedBooks: string[];
  folders: Folder[];
  onClearSelection: () => void;
  onDeleteBooks: (bookIds: string[]) => void;
  onAddToFolder: (bookIds: string[], folderId: string) => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedBooks,
  folders,
  onClearSelection,
  onDeleteBooks,
  onAddToFolder
}) => {
  const handleAddToFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      onAddToFolder(selectedBooks, folderId);
      toast.success(`Added ${selectedBooks.length} book(s) to "${folder.name}"`);
      onClearSelection();
    }
  };

  const handleDeleteBooks = () => {
    onDeleteBooks(selectedBooks);
    toast.success(`Deleted ${selectedBooks.length} book(s)`);
    onClearSelection();
  };

  if (selectedBooks.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">
          {selectedBooks.length} book{selectedBooks.length !== 1 ? 's' : ''} selected
        </span>
        
        <div className="flex items-center gap-2">
          <Select onValueChange={handleAddToFolder}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Add to folder" />
            </SelectTrigger>
            <SelectContent>
              {folders.map(folder => (
                <SelectItem key={folder.id} value={folder.id}>
                  <div className="flex items-center gap-2">
                    <FolderPlus className="h-4 w-4" />
                    {folder.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Books</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {selectedBooks.length} book{selectedBooks.length !== 1 ? 's' : ''}? 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteBooks} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;
