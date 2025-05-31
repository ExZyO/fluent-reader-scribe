
import React from 'react';
import { Folder } from '@/contexts/ReaderContext';
import { cn } from '@/lib/utils';
import { Book, FolderIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface FolderListProps {
  folders: Folder[];
  selectedFolder: string | null;
  bookCount: Record<string, number>;
  onSelectFolder: (folderId: string | null) => void;
  onAddFolder: (name: string) => void;
  onRenameFolder: (id: string, newName: string) => void;
  onDeleteFolder: (id: string) => void;
  className?: string;
}

const FolderList: React.FC<FolderListProps> = ({
  folders,
  selectedFolder,
  bookCount,
  onSelectFolder,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  className,
}) => {
  const [newFolderName, setNewFolderName] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingFolder, setEditingFolder] = React.useState<Folder | null>(null);

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName('');
      setIsDialogOpen(false);
      toast.success(`Folder "${newFolderName.trim()}" created`);
    }
  };

  const handleRenameFolder = () => {
    if (editingFolder && newFolderName.trim()) {
      onRenameFolder(editingFolder.id, newFolderName.trim());
      setNewFolderName('');
      setEditingFolder(null);
      setIsDialogOpen(false);
      toast.success(`Folder renamed to "${newFolderName.trim()}"`);
    }
  };

  const handleDeleteFolder = (id: string, name: string) => {
    onDeleteFolder(id);
    toast.success(`Folder "${name}" deleted`);
  };

  const openNewFolderDialog = () => {
    setEditingFolder(null);
    setNewFolderName('');
    setIsDialogOpen(true);
  };

  const openEditFolderDialog = (folder: Folder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setIsDialogOpen(true);
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-500">FOLDERS</h2>
        <Button variant="ghost" size="sm" onClick={openNewFolderDialog} className="h-7 w-7 p-0">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add Folder</span>
        </Button>
      </div>
      
      <button
        className={cn(
          'w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors',
          selectedFolder === null 
            ? 'bg-primary text-primary-foreground' 
            : 'text-gray-700 hover:bg-gray-100'
        )}
        onClick={() => onSelectFolder(null)}
      >
        <Book className="h-4 w-4" />
        <span>All Books</span>
        <span className="ml-auto text-xs">{Object.values(bookCount).reduce((a, b) => a + b, 0)}</span>
      </button>
      
      {folders.map((folder) => (
        <div key={folder.id} className="flex items-center group">
          <button
            className={cn(
              'flex-grow flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors',
              selectedFolder === folder.id 
                ? 'bg-primary text-primary-foreground' 
                : 'text-gray-700 hover:bg-gray-100'
            )}
            onClick={() => onSelectFolder(folder.id)}
          >
            <FolderIcon className="h-4 w-4" />
            <span>{folder.name}</span>
            <span className="ml-auto text-xs">{bookCount[folder.id] || 0}</span>
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="sr-only">Options</span>
                <span className="text-gray-500">•••</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => openEditFolderDialog(folder)}>
                Rename Folder
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteFolder(folder.id, folder.name)}
                className="text-red-500"
              >
                Delete Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFolder ? 'Rename Folder' : 'Create New Folder'}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={editingFolder ? handleRenameFolder : handleAddFolder}>
              {editingFolder ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderList;
