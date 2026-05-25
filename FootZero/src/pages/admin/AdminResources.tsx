import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  type: string;
  category: string;
  author_name: string | null;
  image_url: string | null;
  external_url: string | null;
  is_published: boolean;
  is_active: boolean;
}

const TYPES = ["blog", "tip", "fact", "link"];
const CATEGORIES = ["General", "Transport", "Diet", "Energy", "Shopping"];

const empty: Omit<Resource, "id"> = {
  title: "", description: "", content: "", type: "blog", category: "General",
  author_name: "", image_url: "", external_url: "", is_published: true, is_active: true,
};

const AdminResources = () => {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [form, setForm] = useState<Omit<Resource, "id">>(empty);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("resources" as any).select("*").order("created_at", { ascending: false });
    setItems((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (r: Resource) => {
    setEditing(r);
    setForm({
      title: r.title, description: r.description || "", content: r.content || "",
      type: r.type || "blog", category: r.category, author_name: r.author_name || "",
      image_url: r.image_url || "", external_url: r.external_url || "",
      is_published: r.is_published, is_active: r.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) return toast({ title: "Title required", variant: "destructive" });
    const payload: any = { ...form, url: form.external_url || "#" };
    if (editing) {
      const { error } = await supabase.from("resources" as any).update(payload).eq("id", editing.id);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase.from("resources" as any).insert(payload);
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setOpen(false); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    await supabase.from("resources" as any).delete().eq("id", id);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold mb-2">Resources Management</h2>
          <p className="text-muted-foreground">Create blogs, tips, and links shown on the user Resources page.</p>
        </div>
        <Button variant="hero" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Resource</Button>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4">
        {loading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No resources yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map((r) => (
              <div key={r.id} className="flex items-center gap-3 bg-background border border-border rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-foreground text-sm font-medium truncate">{r.title}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">{r.category}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{r.type || "blog"}</span>
                    {!r.is_published && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">Draft</span>}
                  </div>
                  <p className="text-muted-foreground text-xs truncate">{r.description || r.content}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Resource</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>Author Name</Label>
              <Input value={form.author_name || ""} onChange={(e) => setForm({ ...form, author_name: e.target.value })} /></div>
            <div className="space-y-1"><Label>Short Excerpt</Label>
              <Textarea rows={2} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-1"><Label>Full Content</Label>
              <Textarea rows={6} value={form.content || ""} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
            <div className="space-y-1"><Label>Image URL</Label>
              <Input value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
            <div className="space-y-1"><Label>External URL</Label>
              <Input value={form.external_url || ""} onChange={(e) => setForm({ ...form, external_url: e.target.value })} /></div>
            <div className="flex items-center justify-between"><Label>Published</Label>
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={save}>{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminResources;
