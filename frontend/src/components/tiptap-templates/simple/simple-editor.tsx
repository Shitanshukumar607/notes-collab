"use client"

import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

// --- Tiptap Core Extensions ---
import { Highlight } from "@tiptap/extension-highlight"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Selection } from "@tiptap/extensions"
import { StarterKit } from "@tiptap/starter-kit"

// --- UI Primitives ---
import { Toolbar } from "@/components/tiptap-ui-primitive/toolbar"
import { Placeholder } from "@tiptap/extension-placeholder"

// --- Tiptap Node ---
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Icons ---
import { Loader2 } from "lucide-react"

// --- Hooks ---
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useWindowSize } from "@/hooks/use-window-size"

// --- Extracted Components ---
import { EditorTopbar } from "./editor-topbar"
import { MainToolbarContent, MobileToolbarContent } from "./editor-toolbar"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"

import { documentClient } from "@/lib/document-client"
import { debounce } from "lodash"
import { io, Socket } from "socket.io-client"

export function SimpleEditor({ documentId }: { documentId: string }) {
  const queryClient = useQueryClient()
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  )
  const { data: session } = authClient.useSession()
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [localTitle, setLocalTitle] = useState("")

  // Socket state
  const [socket, setSocket] = useState<Socket | null>(null)
  const isProgrammaticUpdate = useRef(false)
  const programmaticUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Queries
  const { data: document, isLoading } = useQuery({
    queryKey: ["document", documentId],
    queryFn: async () => {
      const doc = await documentClient.get(documentId)
      setLocalTitle(doc.title)
      return doc
    },
    enabled: !!documentId,
  })

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (updates: { title?: string; content?: any }) =>
      documentClient.update(documentId, updates),
    onSuccess: (updatedDoc) => {
      // Update the cache for this specific document
      queryClient.setQueryData(["document", documentId], updatedDoc)
      // If title changed, we might want to refresh the sidebar list
      if (updatedDoc.title) {
        queryClient.invalidateQueries({ queryKey: ["documents"] })
      }
    },
  })

  // Role management
  const currentUserRole = document?.ownerId === session?.user?.id 
    ? 'OWNER' 
    : document?.collaborators?.find((c: any) => c.userId === session?.user?.id)?.role;

  const isViewer = currentUserRole === 'VIEWER';
  const canInvite = document?.ownerId === session?.user?.id;

  // Socket Connection
  useEffect(() => {
    if (!documentId) return;

    const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000", {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join-document", documentId);
    });

    return () => {
      newSocket.emit("leave-document", documentId);
      newSocket.disconnect();
    };
  }, [documentId]);

  const addCollaboratorMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      documentClient.addCollaborator(documentId, email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] })
      toast.success("Collaborator added successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to add collaborator")
    },
  })

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
      handleKeyDown: () => {
        if (!isViewer && socket) {
          socket.emit("document:typing", {
            documentId,
            user: session?.user,
          });
        }
        return false;
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      Placeholder.configure({
        placeholder: "Write something amazing...",
        showOnlyWhenEditable: true,
      }),
    ],
    onUpdate: ({ editor }) => {
      if (!isViewer) {
        const content = editor.getJSON()
        debouncedSave(content)

        if (!isProgrammaticUpdate.current && socket) {
          socket.emit("document:update", {
            documentId,
            content,
          });
        }
      }
    },
  })

  const debouncedSave = useRef(
    debounce((content: any) => {
      updateMutation.mutate({ content })
    }, 1000)
  ).current

  const debouncedTitleSave = useRef(
    debounce((title: string) => {
      updateMutation.mutate({ title })
    }, 1000)
  ).current

  const handleTitleChange = (newTitle: string) => {
    if (isViewer) return
    setLocalTitle(newTitle)
    debouncedTitleSave(newTitle)
    
    if (socket) {
      socket.emit("document:update", {
        documentId,
        title: newTitle,
      })
    }
  }

  useEffect(() => {
    if (document && editor) {
      // Sync editability
      if (editor.isEditable !== !isViewer) {
        editor.setEditable(!isViewer);
      }

      // Sync content if not editing
      if (!editor.isFocused) {
        // Only set content if it's different to avoid cursor jumps
        const currentContent = editor.getJSON()
        if (JSON.stringify(currentContent) !== JSON.stringify(document.content)) {
          if (programmaticUpdateTimeoutRef.current) clearTimeout(programmaticUpdateTimeoutRef.current);
          isProgrammaticUpdate.current = true;
          
          editor.commands.setContent(document.content || "", { emitUpdate: false });
          
          programmaticUpdateTimeoutRef.current = setTimeout(() => {
            isProgrammaticUpdate.current = false;
          }, 50);
        }
      }
    }
  }, [document, editor, isViewer])

  // Socket event listeners
  useEffect(() => {
    if (!socket || !editor) return;

    const handleUpdate = ({ content, title }: { content: any; title?: string }) => {
      if (title && title !== localTitle) {
        setLocalTitle(title);
      }
      
      if (content) {
        const currentContent = editor.getJSON();
        if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
          if (programmaticUpdateTimeoutRef.current) clearTimeout(programmaticUpdateTimeoutRef.current);
          isProgrammaticUpdate.current = true;
          
          const { from, to } = editor.state.selection;
          editor.commands.setContent(content, { emitUpdate: false });
          
          try {
            editor.commands.setTextSelection({ from, to });
          } catch (e) {
            // ignore out of bounds
          }
          
          programmaticUpdateTimeoutRef.current = setTimeout(() => {
            isProgrammaticUpdate.current = false;
          }, 50);
        }
      }
    };

    const handleTyping = ({ user }: { user: any }) => {
      if (!user || user.id === session?.user?.id) return;
      
      setTypingUser(user.name || "Someone");
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser(null);
      }, 2000);
    };

    socket.on("document:update", handleUpdate);
    socket.on("document:typing", handleTyping);

    return () => {
      socket.off("document:update", handleUpdate);
      socket.off("document:typing", handleTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, editor, session, localTitle]);

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">Document not found</p>
      </div>
    )
  }

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <EditorTopbar
          title={localTitle}
          updatedAt={document.updatedAt}
          collaborators={document.collaborators || []}
          owner={document.owner}
          onAddCollaborator={(email, role) => addCollaboratorMutation.mutate({ email, role })}
          isAdding={addCollaboratorMutation.isPending}
          canInvite={canInvite}
        />
        {!isViewer && (
          <Toolbar
            ref={toolbarRef}
            style={{
              ...(isMobile
                ? {
                    bottom: `calc(100% - ${height - rect.y}px)`,
                  }
                : {
                    top: "48px",
                  }),
            }}
          >
            {mobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                onLinkClick={() => setMobileView("link")}
                isMobile={isMobile}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === "highlighter" ? "highlighter" : "link"}
                onBack={() => setMobileView("main")}
              />
            )}
          </Toolbar>
        )}

        <div className="max-w-[750px] mx-auto w-full pt-16 px-8 relative">
          {typingUser && (
            <div className="absolute top-6 left-8 text-xs font-medium text-blue-500 animate-pulse">
              {typingUser} is typing...
            </div>
          )}
          <input
            type="text"
            readOnly={isViewer}
            value={localTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full text-4xl font-bold bg-transparent border-none outline-none mb-4 placeholder:text-muted-foreground/30"
            placeholder="Untitled"
          />
          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content"
          />
        </div>
      </EditorContext.Provider>
    </div>
  )
}
