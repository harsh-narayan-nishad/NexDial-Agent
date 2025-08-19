import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ResearchEntry } from '@/types/user';
import { ExternalLink, Trash2, Edit2, Save, X, FileText, Link as LinkIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ContentPage = () => {
  const [entries, setEntries] = useState<ResearchEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    // Load entries from localStorage
    const savedEntries = localStorage.getItem('researchEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('researchEntries', JSON.stringify(updatedEntries));
    toast({
      title: "Entry deleted",
      description: "Research entry has been removed.",
    });
  };

  const startEditing = (entry: ResearchEntry) => {
    setEditingId(entry.id);
    setEditNotes(entry.notes);
  };

  const saveEdit = () => {
    if (!editingId) return;
    
    const updatedEntries = entries.map(entry => 
      entry.id === editingId 
        ? { ...entry, notes: editNotes }
        : entry
    );
    
    setEntries(updatedEntries);
    localStorage.setItem('researchEntries', JSON.stringify(updatedEntries));
    setEditingId(null);
    setEditNotes('');
    
    toast({
      title: "Notes updated",
      description: "Your notes have been saved.",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNotes('');
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  if (entries.length === 0) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-cosmic-accent mb-4" />
            <h1 className="text-2xl font-bold text-cosmic-primary mb-2">No Content Yet</h1>
            <p className="text-muted-foreground">
              Start by adding research entries on the Research page to see them here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-cosmic bg-clip-text text-transparent mb-2">
            Research Content
          </h1>
          <p className="text-muted-foreground">
            View and manage your saved research entries
          </p>
        </div>

        <div className="space-y-6">
          {entries.map((entry) => (
            <Card key={entry.id} className="bg-background/60 backdrop-blur-glass border-cosmic-accent/20 shadow-nebula">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-cosmic-primary flex items-center gap-2">
                      {entry.type === 'link' ? (
                        <LinkIcon className="h-5 w-5" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                      {entry.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Added by {entry.userName}</span>
                      <Badge variant="secondary" className="bg-cosmic-accent/20 text-cosmic-accent">
                        {entry.type}
                      </Badge>
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                    {entry.link && (
                      <a
                        href={entry.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-cosmic-accent hover:text-cosmic-primary transition-colors text-sm"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {entry.link}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(entry)}
                      className="text-cosmic-accent hover:text-cosmic-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEntry(entry.id)}
                      className="text-cosmic-danger hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Embedded Content */}
                  {entry.link && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-cosmic-secondary">Preview</h3>
                      <div className="relative w-full h-64 bg-background/40 rounded-lg overflow-hidden border border-cosmic-accent/20">
                        {isYouTubeUrl(entry.link) ? (
                          <iframe
                            src={getEmbedUrl(entry.link)}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={entry.title}
                          />
                        ) : (
                          <iframe
                            src={entry.link}
                            className="w-full h-full"
                            frameBorder="0"
                            sandbox="allow-scripts allow-same-origin"
                            title={entry.title}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Notes Section */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-cosmic-secondary">Notes</h3>
                    {editingId === entry.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="min-h-[120px] bg-background/50 border-cosmic-accent/30"
                          placeholder="Add your notes here..."
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={saveEdit}
                            className="bg-cosmic-success/20 text-cosmic-success hover:bg-cosmic-success/30"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                            className="text-muted-foreground"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="min-h-[120px] p-3 bg-background/30 rounded-lg border border-cosmic-accent/20 cursor-pointer hover:bg-background/40 transition-colors"
                        onClick={() => startEditing(entry)}
                      >
                        {entry.notes || (
                          <span className="text-muted-foreground italic">
                            Click to add notes...
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentPage;