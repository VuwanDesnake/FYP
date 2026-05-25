import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, UserX, Trash2, UserPlus, Shield, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  city: string | null;
  created_at: string;
  is_active?: boolean;
}

// Extracted outside to prevent re-render focus loss
const UserFormFields = ({ role, formState, setFormState, onSubmit, creating }: {
  role: "user" | "admin";
  formState: { name: string; email: string; password: string; city: string; adminKey: string };
  setFormState: (key: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  creating: boolean;
}) => (
  <form onSubmit={onSubmit} className="space-y-4 mt-2">
    <div className="space-y-2">
      <Label className="text-foreground">Full Name</Label>
      <Input value={formState.name} onChange={e => setFormState("name", e.target.value)} className="bg-background border-border text-foreground" required />
    </div>
    <div className="space-y-2">
      <Label className="text-foreground">Email</Label>
      <Input type="email" value={formState.email} onChange={e => setFormState("email", e.target.value)} className="bg-background border-border text-foreground" required />
    </div>
    <div className="space-y-2">
      <Label className="text-foreground">Password</Label>
      <Input type="password" value={formState.password} onChange={e => setFormState("password", e.target.value)} className="bg-background border-border text-foreground" required />
    </div>
    <div className="space-y-2">
      <Label className="text-foreground">City</Label>
      <Input value={formState.city} onChange={e => setFormState("city", e.target.value)} className="bg-background border-border text-foreground" />
    </div>
    {role === "admin" && (
      <div className="space-y-2">
        <Label className="text-foreground">Admin Secret Key</Label>
        <Input type="password" value={formState.adminKey} onChange={e => setFormState("adminKey", e.target.value)} placeholder="Enter admin secret key" className="bg-background border-border text-foreground" required />
      </div>
    )}
    <Button type="submit" variant="hero" className="w-full" disabled={creating}>
      {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
      Create {role === "admin" ? "Admin" : "User"}
    </Button>
  </form>
);

const UsersManagement = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [openUser, setOpenUser] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formState, setFormState] = useState({ name: "", email: "", password: "", city: "", adminKey: "" });

  const updateFormState = (key: string, value: string) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setUsers(data as UserProfile[]);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u =>
    (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormState({ name: "", email: "", password: "", city: "", adminKey: "" });
  };

  const handleCreate = async (e: React.FormEvent, role: "user" | "admin") => {
    e.preventDefault();
    if (role === "admin" && formState.adminKey !== "Vuwan1") {
      toast({ title: "Invalid key", description: "The admin secret key is incorrect.", variant: "destructive" });
      return;
    }
    setCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password,
          full_name: formState.name,
          city: formState.city || "Kathmandu",
          role,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: result.error || "Failed to create user", variant: "destructive" });
        setCreating(false);
        return;
      }

      toast({ title: `${role === "admin" ? "Admin" : "User"} created`, description: `${formState.name} has been added as ${role}. They can log in immediately.` });
      role === "admin" ? setOpenAdmin(false) : setOpenUser(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setCreating(false);
  };

  const handleDeactivate = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    const newStatus = user?.is_active === false ? true : false;
    const { error } = await supabase.from("profiles").update({ is_active: newStatus } as any).eq("id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: newStatus ? "User activated" : "User deactivated", description: `User has been ${newStatus ? "activated" : "deactivated"}.` });
      fetchUsers();
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    // Delete profile (cascade will handle related data)
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "User deleted", description: "The user has been removed." });
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-foreground text-2xl font-bold mb-2">User Management</h2>
          <p className="text-muted-foreground">View, deactivate, or delete platform users.</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={openUser} onOpenChange={(v) => { setOpenUser(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="hero"><UserPlus className="h-4 w-4 mr-2" />Add User</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Add New User</DialogTitle>
              </DialogHeader>
              <UserFormFields role="user" formState={formState} setFormState={updateFormState} onSubmit={e => handleCreate(e, "user")} creating={creating} />
            </DialogContent>
          </Dialog>

          <Dialog open={openAdmin} onOpenChange={(v) => { setOpenAdmin(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10"><Shield className="h-4 w-4 mr-2" />Add Admin</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Add New Admin</DialogTitle>
              </DialogHeader>
              <UserFormFields role="admin" formState={formState} setFormState={updateFormState} onSubmit={e => handleCreate(e, "admin")} creating={creating} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border text-foreground" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center"><p className="text-muted-foreground">No users found</p></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">City</th>
                <th className="text-left px-5 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">Joined</th>
                <th className="text-right px-5 py-3 text-muted-foreground text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-foreground text-sm font-medium">{u.full_name || "—"}</p>
                    <p className="text-muted-foreground text-xs">{u.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.role === "admin" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-sm">{u.city || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active !== false ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                      {u.is_active !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleDeactivate(u.id)} title={u.is_active !== false ? "Deactivate" : "Activate"}>
                        <UserX className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(u.id)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
};

export default UsersManagement;
