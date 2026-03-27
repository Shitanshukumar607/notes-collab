import {
  Search,
  Settings,
  FileText,
  Clock,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Plus,
  Loader2,
  MoreHorizontal,
  Trash2,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { documentClient } from "@/lib/document-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Document {
  id: string;
  title: string;
  ownerId: string;
}

import { Sidebar as ShadcnSidebar } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Sidebar() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const user = session?.user;

  const [isCollaboratorDialogOpen, setIsCollaboratorDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");

  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);
  const [sharedDocsExpanded, setSharedDocsExpanded] = useState(true);

  // Queries
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["documents"],
    queryFn: () => documentClient.list(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (title: string) => documentClient.create(title),
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      navigate(`/doc/${newDoc.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentClient.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      if (activeId && !documents.find((d: Document) => d.id === activeId)) {
        navigate("/");
      }
    },
  });

  const addCollaboratorMutation = useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      documentClient.addCollaborator(id, email, "EDITOR"),
    onSuccess: (_, variables) => {
      setIsCollaboratorDialogOpen(false);
      setCollaboratorEmail("");
      setSelectedDocumentId(null);
      // Invalidate both the list and the specific document
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", variables.id] });
    },
    onError: (error) => {
      console.error("Failed to add collaborator", error);
      alert("Failed to add collaborator. Make sure the email is correct.");
    },
  });

  const workspaceDocs = documents.filter((doc: Document) => doc.ownerId === user?.id);
  const sharedDocs = documents.filter((doc: Document) => doc.ownerId !== user?.id);

  const handleCreateDocument = () => {
    createMutation.mutate("Untitled");
  };

  const handleDeleteDocument = (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    deleteMutation.mutate(id);
  };

  const handleAddCollaborator = () => {
    if (!selectedDocumentId || !collaboratorEmail) return;
    addCollaboratorMutation.mutate({ id: selectedDocumentId, email: collaboratorEmail });
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/login");
        },
      },
    });
  };

  const navItems = [
    { icon: Search, label: "Search", shortcut: "⌘K" },
    { icon: Clock, label: "Recent" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <ShadcnSidebar collapsible="offcanvas" className="border-r border-sidebar-border shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10">
      <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
        {/* User Dropdown Header */}
        <div className="p-4 pb-2">
          <button className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group">
            {user?.image ? (
              <img
                src={user.image}
                alt={user?.name || "User"}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-md object-cover border border-sidebar-border shadow-sm shrink-0"
              />
            ) : (
              <div className="w-5 h-5 bg-sidebar-primary rounded flex items-center justify-center text-sidebar-primary-foreground font-semibold text-[10px] shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-semibold truncate leading-none mb-1">
                {user?.name || "User"}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60 transition-colors" />
          </button>
        </div>

        <nav className="flex flex-col gap-[2px] px-3">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150 text-sidebar-foreground/80 text-sm font-medium"
            >
              <item.icon className="w-4 h-4 text-sidebar-foreground/60" />
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="ml-auto text-xs text-sidebar-foreground/50 border border-sidebar-border rounded px-1 tracking-widest">
                  {item.shortcut}
                </span>
              )}
            </button>
          ))}
        </nav>        <div className="flex-1 overflow-y-auto mt-4">
          <div className="flex flex-col gap-[2px] px-3">
            <div className="px-1 text-[11px] font-bold text-sidebar-foreground/40 uppercase tracking-widest mb-1.5 flex items-center justify-between group/header">
              <button 
                onClick={() => setWorkspaceExpanded(!workspaceExpanded)}
                className="flex items-center gap-1 hover:text-sidebar-foreground/60 transition-colors"
              >
                {workspaceExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                <span>Workspace</span>
              </button>
              <button
                onClick={handleCreateDocument}
                disabled={createMutation.isPending}
                className="p-[2px] rounded hover:bg-sidebar-accent transition-colors opacity-0 group-hover/header:opacity-100"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5 cursor-pointer" />
                )}
              </button>
            </div>

            {workspaceExpanded && (
              <>
                {isLoading && (
                  <div className="px-2 py-1.5 flex items-center gap-2 text-sidebar-foreground/40">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="text-xs">Loading...</span>
                  </div>
                )}

                {!isLoading && workspaceDocs.length === 0 && (
                  <div className="px-2 py-1.5 text-xs text-sidebar-foreground/40 italic">
                    No documents yet
                  </div>
                )}

                {workspaceDocs.map((doc: Document) => (
                  <div
                    key={doc.id}
                    className={`group relative flex items-center gap-2 w-full px-2 py-1.5 rounded-md transition-all duration-150 text-sm font-medium cursor-pointer ${
                      activeId === doc.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    }`}
                    onClick={() => navigate(`/doc/${doc.id}`)}
                  >
                    <FileText
                      className={`w-4 h-4 shrink-0 ${activeId === doc.id ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/60"}`}
                    />
                    <span className="truncate flex-1">{doc.title}</span>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className="p-0.5 rounded hover:bg-sidebar-accent-foreground/10 transition-colors">
                            {deleteMutation.isPending && deleteMutation.variables === doc.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <MoreHorizontal className="w-3.5 h-3.5 text-sidebar-foreground/60" />
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocumentId(doc.id);
                              setIsCollaboratorDialogOpen(true);
                            }}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Add Collaborators</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(doc.id);
                            }}
                            className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Document</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </>
            )}

            {sharedDocs.length > 0 && (
              <>
                <div className="px-1 text-[11px] font-bold text-sidebar-foreground/40 uppercase tracking-widest mt-6 mb-1.5">
                  <button 
                    onClick={() => setSharedDocsExpanded(!sharedDocsExpanded)}
                    className="flex items-center gap-1 hover:text-sidebar-foreground/60 transition-colors"
                  >
                    {sharedDocsExpanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    <span>Shared with me</span>
                  </button>
                </div>
                {sharedDocsExpanded && sharedDocs.map((doc: Document) => (
                  <div
                    key={doc.id}
                    className={`group relative flex items-center gap-2 w-full px-2 py-1.5 rounded-md transition-all duration-150 text-sm font-medium cursor-pointer ${
                      activeId === doc.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    }`}
                    onClick={() => navigate(`/doc/${doc.id}`)}
                  >
                    <FileText
                      className={`w-4 h-4 shrink-0 ${activeId === doc.id ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/60"}`}
                    />
                    <span className="truncate flex-1">{doc.title}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Footer User Profile */}
        <div className="p-3 border-t border-sidebar-border mt-auto bg-sidebar/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-2 py-2">
            {user?.image ? (
              <img
                src={user.image}
                alt={user?.name || "User"}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-sidebar-border shadow-sm shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 border border-sidebar-border flex items-center justify-center text-sidebar-primary shrink-0 transition-all duration-200">
                <UserIcon className="w-4.5 h-4.5" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate text-sidebar-foreground leading-none mb-1">
                {user?.name || "Guest User"}
              </span>
              <span className="text-[11px] text-sidebar-foreground/50 truncate leading-none">
                {user?.email || "No email"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full mt-1 px-3 py-2 rounded-md hover:bg-red-500/10 hover:text-red-500 text-sidebar-foreground/70 transition-all duration-200 text-sm font-medium group"
          >
            <LogOut className="w-4 h-4 text-sidebar-foreground/50 group-hover:text-red-500 transition-colors" />
            <span>Log out</span>
          </button>
        </div>
      </div>

      <Dialog open={isCollaboratorDialogOpen} onOpenChange={setIsCollaboratorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Collaborator</DialogTitle>
            <DialogDescription>
              Enter the email address of the person you want to collaborate with.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCollaborator();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCollaboratorDialogOpen(false)}
              disabled={addCollaboratorMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCollaborator}
              disabled={addCollaboratorMutation.isPending || !collaboratorEmail}
            >
              {addCollaboratorMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Collaborator"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ShadcnSidebar>
  );
}
