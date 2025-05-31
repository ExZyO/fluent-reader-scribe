
import React from 'react';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Settings2, Book, AlignLeft, AlignCenter, AlignJustify, SunMoon } from 'lucide-react';
import { ReaderSettings as ReaderSettingsType } from '@/contexts/ReaderContext';

interface ReaderSettingsProps {
  settings: ReaderSettingsType;
  onChangeSettings: (settings: Partial<ReaderSettingsType>) => void;
}

const fontFamilies = [
  { name: 'Charter', value: 'Charter, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Dyslexic', value: 'Open-Dyslexic, sans-serif' },
  { name: 'Monospace', value: 'Courier New, monospace' },
];

const themes = [
  { name: 'Light', value: 'light', bg: '#ffffff', text: '#1a1a1a' },
  { name: 'Sepia', value: 'sepia', bg: '#f4ecd8', text: '#5f4b32' },
  { name: 'Dark', value: 'dark', bg: '#1a1a1a', text: '#e0e0e0' },
  { name: 'Night', value: 'night', bg: '#0a0a0a', text: '#c0c0c0' },
];

const ReaderSettings: React.FC<ReaderSettingsProps> = ({ settings, onChangeSettings }) => {
  const handleFontSizeChange = (value: number[]) => {
    onChangeSettings({ fontSize: value[0] });
  };

  const handleLineHeightChange = (value: number[]) => {
    onChangeSettings({ lineHeight: value[0] });
  };

  const handleMarginChange = (value: number[]) => {
    onChangeSettings({ margins: value[0] });
  };

  const handleThemeChange = (themeName: string) => {
    const theme = themes.find(t => t.value === themeName);
    if (theme) {
      onChangeSettings({ 
        theme: themeName,
        backgroundColor: theme.bg,
        textColor: theme.text
      });
    }
  };

  const handleTextAlignChange = (align: 'left' | 'justified' | 'center') => {
    onChangeSettings({ textAlign: align });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-5 w-5" />
          <span className="sr-only">Reader settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h3 className="font-medium">Reading Settings</h3>
          
          {/* Font Size */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Font Size</label>
              <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
            </div>
            <Slider
              defaultValue={[settings.fontSize]}
              min={12}
              max={28}
              step={1}
              onValueChange={handleFontSizeChange}
            />
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">A</span>
              <span className="text-sm text-muted-foreground">A</span>
            </div>
          </div>
          
          {/* Font Family */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Font</label>
            <Select
              value={settings.fontFamily}
              onValueChange={(value) => onChangeSettings({ fontFamily: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.name} value={font.name}>
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Line Height */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Line Height</label>
              <span className="text-sm text-muted-foreground">{settings.lineHeight.toFixed(1)}</span>
            </div>
            <Slider
              defaultValue={[settings.lineHeight]}
              min={1.0}
              max={2.0}
              step={0.1}
              onValueChange={handleLineHeightChange}
            />
          </div>
          
          {/* Reading Mode */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Reading Mode</label>
            <div className="flex space-x-2">
              <Button 
                variant={settings.readingMode === 'paged' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onChangeSettings({ readingMode: 'paged' })}
              >
                <Book className="mr-2 h-4 w-4" />
                Paged
              </Button>
              <Button 
                variant={settings.readingMode === 'scroll' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => onChangeSettings({ readingMode: 'scroll' })}
              >
                <AlignJustify className="mr-2 h-4 w-4" />
                Scroll
              </Button>
            </div>
          </div>
          
          {/* Text Alignment */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Text Alignment</label>
            <div className="flex space-x-2">
              <Button 
                variant={settings.textAlign === 'left' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => handleTextAlignChange('left')}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant={settings.textAlign === 'center' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => handleTextAlignChange('center')}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button 
                variant={settings.textAlign === 'justified' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => handleTextAlignChange('justified')}
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Theme Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme</label>
            <div className="grid grid-cols-4 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  className={`h-8 rounded-md border ${
                    settings.theme === theme.value ? 'ring-2 ring-primary' : ''
                  }`}
                  style={{
                    backgroundColor: theme.bg,
                    border: `1px solid ${theme.value === 'light' ? '#e0e0e0' : theme.bg}`
                  }}
                  onClick={() => handleThemeChange(theme.value)}
                >
                  <span className="sr-only">{theme.name}</span>
                  <div
                    className="mx-auto h-4 w-4 rounded-sm"
                    style={{ backgroundColor: theme.text }}
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Margin Size */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Margins</label>
              <span className="text-sm text-muted-foreground">{settings.margins}px</span>
            </div>
            <Slider
              defaultValue={[settings.margins]}
              min={10}
              max={80}
              step={5}
              onValueChange={handleMarginChange}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReaderSettings;
