import { useEffect, useState } from "react";
import { BookOpen, ExternalLink, Plus, Trash2, Pencil, StickyNote, Volume2, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string;
  type: string | null;
  author_name: string | null;
  image_url: string | null;
  external_url: string | null;
  url: string;
}
interface UserNote {
  id: string;
  title: string;
  content: string;
  color: string;
  created_at: string;
}

const categories = ["All", "Transport", "Diet", "Energy", "General"];
const noteColors: { id: string; bg: string; border: string }[] = [
  { id: "green", bg: "bg-green-500/15", border: "border-green-500/40" },
  { id: "blue", bg: "bg-blue-500/15", border: "border-blue-500/40" },
  { id: "yellow", bg: "bg-yellow-500/15", border: "border-yellow-500/40" },
  { id: "purple", bg: "bg-purple-500/15", border: "border-purple-500/40" },
];

const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [noteDialog, setNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);
  const [noteForm, setNoteForm] = useState({ title: "", content: "", color: "green" });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("resources" as any)
        .select("*")
        .eq("is_active", true)
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      setResources((data as any) || []);
      setLoadingResources(false);
    })();
  }, []);

  const loadNotes = async () => {
    if (!user) return;
    setLoadingNotes(true);
    const { data } = await supabase
      .from("user_notes" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setNotes((data as any) || []);
    setLoadingNotes(false);
  };
  useEffect(() => { loadNotes(); /* eslint-disable-next-line */ }, [user]);

  const filtered = filter === "All" ? resources : resources.filter((r) => r.category === filter);

  const openAddNote = () => {
    setEditingNote(null);
    setNoteForm({ title: "", content: "", color: "green" });
    setNoteDialog(true);
  };
  const openEditNote = (n: UserNote) => {
    setEditingNote(n);
    setNoteForm({ title: n.title, content: n.content, color: n.color });
    setNoteDialog(true);
  };
  const saveNote = async () => {
    if (!user || !noteForm.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (editingNote) {
      const { error } = await supabase.from("user_notes" as any)
        .update({ ...noteForm, updated_at: new Date().toISOString() })
        .eq("id", editingNote.id);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase.from("user_notes" as any)
        .insert({ ...noteForm, user_id: user.id });
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setNoteDialog(false);
    loadNotes();
  };
  const deleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    await supabase.from("user_notes" as any).delete().eq("id", id);
    loadNotes();
  };

  const speak = (id: string, text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speakingId === id) {
      setSpeakingId(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.lang = "en-US";
    utterance.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
    utterance.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
    window.speechSynthesis.speak(utterance);
    setSpeakingId(id);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-bold mb-2">Resources</h2>
        <p className="text-muted-foreground">Articles, blogs and your personal eco notes.</p>
      </div>

      <Tabs defaultValue="articles">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="articles">Articles & Blogs</TabsTrigger>
          <TabsTrigger value="notes">My Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4 mt-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === c ? "bg-primary/15 text-primary" : "bg-card border border-border text-muted-foreground hover:bg-muted"}`}>
                {c}
              </button>
            ))}
          </div>

          {loadingResources ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
              No articles yet. Check back soon!
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r, i) => {
                const isOpen = expanded === r.id;
                return (
                  <motion.div key={r.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-card rounded-2xl border border-border p-5 hover:border-primary/30 transition-all">
                    {r.image_url && (
                      <div className="h-32 rounded-xl overflow-hidden mb-4 bg-muted">
                        <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{r.category}</span>
                    </div>
                    <h3 className="text-foreground font-semibold mb-1">{r.title}</h3>
                    {r.author_name && <p className="text-muted-foreground text-xs mb-2">By {r.author_name}</p>}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      {isOpen ? (r.content || r.description) : (r.description || (r.content || "").slice(0, 120) + "...")}
                    </p>
                    <div className="flex items-center justify-between">
                      <button onClick={() => setExpanded(isOpen ? null : r.id)} className="text-xs text-primary hover:underline">
                        {isOpen ? "Show less" : "Read more"}
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speak(r.id, `${r.title}. ${r.content || r.description || ""}`)}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
                          aria-label={speakingId === r.id ? "Stop reading" : "Read aloud"}
                        >
                          {speakingId === r.id ? <Square className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                          {speakingId === r.id ? "Stop" : "Listen"}
                        </button>
                        {(r.external_url || r.url !== "#") && (
                          <a href={r.external_url || r.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                            Visit <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm">Your private notes — only you can see these.</p>
            <Button variant="hero" onClick={openAddNote}><Plus className="h-4 w-4 mr-1" /> Add Note</Button>
          </div>

          {loadingNotes ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
              <StickyNote className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No notes yet — create your first eco note!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((n) => {
                const c = noteColors.find((x) => x.id === n.color) || noteColors[0];
                return (
                  <div key={n.id} className={cn("rounded-2xl border p-5 flex flex-col", c.bg, c.border)}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-foreground font-semibold">{n.title}</h3>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditNote(n)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteNote(n.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </div>
                    <p className="text-foreground/80 text-sm whitespace-pre-wrap flex-1">{n.content}</p>
                    <p className="text-muted-foreground text-[10px] mt-3">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>{editingNote ? "Edit Note" : "New Note"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Content</Label>
              <Textarea rows={6} value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {noteColors.map((c) => (
                  <button key={c.id} onClick={() => setNoteForm({ ...noteForm, color: c.id })}
                    className={cn("h-9 w-9 rounded-full border-2", c.bg, noteForm.color === c.id ? "border-primary" : "border-transparent")}
                    aria-label={c.id} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialog(false)}>Cancel</Button>
            <Button variant="hero" onClick={saveNote}>{editingNote ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resources;
