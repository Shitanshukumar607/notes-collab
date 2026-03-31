import { Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { CollaboratorsDialog } from "./collaborators-dialog"

export const EditorTopbar = ({
  title,
  updatedAt,
  collaborators,
  owner,
  onAddCollaborator,
  isAdding,
  canInvite,
}: {
  title: string
  updatedAt?: string
  collaborators: any[]
  owner: any
  onAddCollaborator: (email: string, role: string) => void
  isAdding: boolean
  canInvite: boolean
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-0 border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 h-12">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-foreground truncate">
          {title || "Untitled Document"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {updatedAt && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Edited{" "}
              {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
            </span>
          </div>
        )}

        <div className="h-4 w-px bg-border hidden sm:block" />

        <CollaboratorsDialog 
          collaborators={collaborators} 
          owner={owner} 
          onAddCollaborator={onAddCollaborator}
          isAdding={isAdding}
          canInvite={canInvite}
        />
      </div>
    </div>
  )
}
