
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';

type ViewMode = 'grid' | 'list';

interface LibraryViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const LibraryViewToggle: React.FC<LibraryViewToggleProps> = ({
  viewMode,
  onChange
}) => {
  return (
    <div className="flex items-center space-x-1 rounded-md border bg-background p-0.5">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('grid')}
        className="h-8 w-8 p-0"
      >
        <Grid className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('list')}
        className="h-8 w-8 p-0"
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </Button>
    </div>
  );
};

export default LibraryViewToggle;
