import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Loader2, Users } from "lucide-react"

export const CollaboratorsDialog = ({
  collaborators,
  owner,
  onAddCollaborator,
  isAdding,
  canInvite,
}: {
  collaborators: any[]
  owner: any
  onAddCollaborator: (email: string, role: string) => void
  isAdding: boolean
  canInvite: boolean
}) => {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("EDITOR")

  if (!owner) return null

  // Combine owner and collaborators into a single list
  const allAccess = [
    { user: owner, role: "OWNER" },
    ...collaborators.filter((c) => c.userId !== owner.id),
  ]

  const handleAdd = () => {
    if (!email) return
    onAddCollaborator(email, role)
    setEmail("")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors h-8 px-2 rounded-md hover:bg-muted group">
          <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Collaborators</span>
          <span className="flex items-center justify-center min-w-[20px] h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full px-1.5 shadow-sm shrink-0 border border-white dark:border-zinc-800">
            {allAccess.length}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Document Access</DialogTitle>
          <DialogDescription>
            Invite others to collaborate on this document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {canInvite && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add Collaborator</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 text-xs"
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                </select>
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleAdd}
                  disabled={isAdding || !email}
                  className="h-8 px-3"
                >
                  {isAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : "Invite"}
                </Button>
              </div>
            </div>
          )}

          {canInvite && <div className="h-px bg-border" />}

          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">People with access</Label>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {allAccess.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-sm overflow-hidden shrink-0 text-xs">
                      {item.user.image ? (
                        <img
                          src={item.user.image}
                          alt={item.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        item.user.name?.charAt(0).toUpperCase() || item.user.email?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {item.user.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {item.user.email}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                    item.role === "OWNER" 
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  }`}>
                    {item.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
