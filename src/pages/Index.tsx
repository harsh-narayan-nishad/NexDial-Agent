import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ResearchEntry } from '@/types/user';
import { Link2, FileText, Plus, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  
  // Dummy user data - no authentication required
  const dummyUser = {
    id: 'user-001',
    name: 'Research User',
    email: 'researcher@nexvora.com'
  };

  const [entryType, setEntryType] = useState<'link' | 'note'>('link');
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your research entry.",
        variant: "destructive"
      });
      return;
    }

    if (entryType === 'link' && !formData.link.trim()) {
      toast({
        title: "Link required",
        description: "Please enter a link for your research entry.",
        variant: "destructive"
      });
      return;
    }

    const newEntry: ResearchEntry = {
      id: Date.now().toString(),
      title: formData.title,
      link: entryType === 'link' ? formData.link : undefined,
      notes: formData.notes,
      userId: dummyUser.id,
      userName: dummyUser.name,
      createdAt: new Date(),
      type: entryType
    };

    // Save to localStorage
    const existingEntries = JSON.parse(localStorage.getItem('researchEntries') || '[]');
    const updatedEntries = [...existingEntries, newEntry];
    localStorage.setItem('researchEntries', JSON.stringify(updatedEntries));

    toast({
      title: "Entry added",
      description: "Your research entry has been saved successfully.",
    });

    // Reset form
    setFormData({ title: '', link: '', notes: '' });
    
    // Navigate to content page to see the entry
    setTimeout(() => {
      navigate('/content');
    }, 1000);
  };

  return (
    // <div className="min-h-screen pt-20 px-4 bg-slate-900 animate-fade-in">
    <div className="min-h-screen pt-20 px-4 backdrop-blur-sm animate-fade-in">

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="flex items-center justify-center gap-3 text-3xl font-bold text-white mb-4">
            <Link2 className="h-8 w-8 text-purple-400 animate-scale-in" />
            Add Research Entry
          </h1>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Button
            type="button"
            onClick={() => setEntryType('link')}
            className={`flex-1 py-4 px-6 rounded-2xl font-medium transition-all duration-300 hover-lift ${
              entryType === 'link'
                ? 'glass-strong text-white shadow-[var(--shadow-glass)]'
                : 'glass text-white/80 hover:glass-strong hover:text-white'
            }`}
          >
            <Link2 className="h-5 w-5 mr-2" />
            Add Link
          </Button>
          <Button
            type="button"
            onClick={() => setEntryType('note')}
            className={`flex-1 py-4 px-6 rounded-2xl font-medium transition-all duration-300 hover-lift ${
              entryType === 'note'
                ? 'glass-strong text-white shadow-[var(--shadow-glass)]'
                : 'glass text-white/80 hover:glass-strong hover:text-white'
            }`}
          >
            <FileText className="h-5 w-5 mr-2" />
            Add Topic
          </Button>
        </div>

        {/* Form */}
        <div className="glass-strong rounded-3xl p-8 shadow-[var(--shadow-glass-hover)] hover-lift animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Title */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-white text-sm font-semibold tracking-wide">
                Title *
              </Label>
              <Input
                id="title"
                placeholder="Enter research title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="glass border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 rounded-2xl py-4 px-5 text-base transition-all duration-300"
                required
              />
            </div>

            {/* Link (only for link type) */}
            {entryType === 'link' && (
              <div className="space-y-3 animate-slide-up">
                <Label htmlFor="link" className="text-white text-sm font-semibold tracking-wide">
                  Link *
                </Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://youtube.com/watch?v=... or any website URL"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="glass border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 rounded-2xl py-4 px-5 text-base transition-all duration-300"
                  required={entryType === 'link'}
                />
              </div>
            )}

            {/* Notes */}
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-white text-sm font-semibold tracking-wide">
                Notes{entryType === 'note' && ' *'}
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any research notes (optional)..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="glass border-white/20 text-white placeholder:text-white/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 rounded-2xl min-h-[140px] resize-none py-4 px-5 text-base transition-all duration-300"
                required={entryType === 'note'}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-2xl transition-all duration-300 hover-lift shadow-[var(--shadow-cosmic)] text-base"
            >
              <Plus className="h-5 w-5 mr-2" />
              {entryType === 'link' ? 'Add Link Research' : 'Add Topic Research'}
            </Button>

            {/* View Content Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/content')}
              className="w-full glass border-white/30 text-white/90 hover:glass-strong hover:text-white py-4 rounded-2xl transition-all duration-300 hover-lift text-base"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              View Research Content
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
