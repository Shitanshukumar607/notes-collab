# Collaborative Document Editor — Data Flow and Socket.IO Architecture

## 1. Project Summary

This project is a **real-time collaborative document editor** built with **Vite + React**, **Express**, **Socket.IO**, **Prisma**, and a stronger auth layer. The core idea is not just to clone Google Docs, but to create a document system that can also behave like a **dynamic workspace**.

The product supports:

* Real-time collaborative editing
* Presence indicators and live cursors
* Document comments and suggestions
* Structured blocks such as headings, lists, tables, code blocks, and embeds
* AI-assisted transformations and summaries
* Document versioning and history
* Offline-friendly editing with sync recovery
* Interactive blocks such as charts, live data embeds, and executable code snippets
* Role-based access control and secure document sharing

---

## 2. Recommended Tech Stack

### Frontend

* **Vite + React** for fast UI development
* **TipTap / Slate / ProseMirror** for rich text editing
* **Socket.IO client** for real-time synchronization
* **TanStack Query** for server state
* **Zustand / Redux Toolkit** for local editor state if needed
* **Tailwind CSS** for UI styling

### Backend

* **Node.js + Express** as the API layer
* **Socket.IO server** for real-time collaboration
* **Prisma** for database access
* **PostgreSQL** as the main database
* **Auth.js / Better Auth** for authentication and session management
* **Redis** optionally for presence, pub/sub, and scaling Socket.IO

### Optional Supporting Services

* **Object storage** for exported files, attachments, and images
* **Queue system** for AI jobs, exports, and indexing
* **CRDT layer** such as Yjs if you want conflict-free collaborative editing

---

## 3. Core Product Features

### A. Editor Features

* Rich text formatting
* Headings, paragraphs, lists, blockquotes
* Tables
* Code blocks with syntax highlighting
* Mentions and slash commands
* Inline embeds
* Comments and suggestions
* Drag-and-drop block reordering
* Search within document

### B. Collaboration Features

* Live cursor tracking
* User presence indicators
* Typing indicators
* Multi-user editing
* Shared selections
* Activity feed
* Permissions-aware collaboration

### C. Document Intelligence Features

* AI summarization
* Rewrite / shorten / expand commands
* Convert notes into structured output
* Extract action items, deadlines, and entities
* Generate doc outlines automatically
* Smart suggestions based on context

### D. Interactive Document Features

* Live charts inside documents
* API data blocks that refresh automatically
* Code blocks that can be executed safely
* Dynamic widgets like counters, tables, and KPI cards
* Embedded forms or task panels

### E. Reliability Features

* Version history
* Autosave
* Offline draft support
* Conflict recovery
* Audit logs
* Export to PDF / DOCX / Markdown

### F. Security and Access Features

* Sign in / sign up
* Email verification or OAuth
* Session management
* Workspace-based access control
* Document ownership and sharing permissions
* Invite links with expiration
* Role-based editing and viewing

---

## 4. High-Level System Architecture

The system can be split into four layers:

### 4.1 Client Layer

The frontend editor handles:

* Typing and formatting
* Local optimistic updates
* Socket.IO event emission
* Receiving remote updates
* Presence rendering
* Command palette and AI actions

### 4.2 API Layer

The Express server handles:

* Authentication
* Document CRUD operations
* Permission checks
* Version storage
* Comment APIs
* Export APIs
* AI job orchestration

### 4.3 Realtime Layer

Socket.IO handles:

* Join document rooms
* Broadcast editor changes
* Broadcast cursor and selection presence
* Broadcast typing and awareness state
* Sync late joiners with current document state

### 4.4 Data Layer

Prisma + PostgreSQL store:

* Users
* Workspaces
* Documents
* Document versions
* Comments
* Shares and permissions
* Presence metadata if persisted
* Audit logs

---

## 5. Data Model Overview

A practical Prisma model set would include:

### User

* id
* name
* email
* avatar
* passwordHash or auth provider id
* createdAt

### Workspace

* id
* name
* ownerId
* createdAt

### WorkspaceMember

* id
* workspaceId
* userId
* role: owner | editor | viewer
* createdAt

### Document

* id
* workspaceId
* title
* content
* status: draft | published | archived
* createdById
* updatedById
* createdAt
* updatedAt

### DocumentVersion

* id
* documentId
* versionNumber
* snapshotContent
* createdById
* createdAt

### Comment

* id
* documentId
* userId
* anchorId or blockId
* text
* resolved
* createdAt

### ShareLink

* id
* documentId
* token
* permission: view | edit
* expiresAt
* createdAt

### AuditLog

* id
* documentId
* actorId
* actionType
* metadata
* createdAt

### LiveSession / Presence

* id
* documentId
* userId
* cursorPosition
* selectionRange
* lastSeenAt
* connectionId

---

## 6. Primary Data Flow

## 6.1 Sign-In Flow

1. User opens the app.
2. Frontend checks existing session.
3. Auth system validates the session token.
4. Backend returns the user profile and workspace access.
5. Frontend loads accessible documents.

### Result

The user enters the dashboard with authenticated access.

---

## 6.2 Document Open Flow

1. User selects a document from the dashboard.
2. Frontend calls `GET /documents/:id`.
3. Express validates permissions.
4. Prisma fetches the document, metadata, comments, and permissions.
5. Frontend loads the editor with the latest snapshot.
6. Frontend connects to Socket.IO and joins the document room.
7. Server sends current presence and sync state.

### Result

The editor is hydrated with the latest state and collaboration context.

---

## 6.3 Typing and Autosave Flow

1. User types in the editor.
2. Local editor state updates instantly.
3. A debounced change payload is prepared.
4. Frontend sends the incremental update through Socket.IO.
5. Server validates the payload and version context.
6. Server broadcasts the update to all users in the same document room.
7. Server optionally persists a checkpoint or version snapshot.
8. Frontend marks the document as saved.

### Result

Edits appear immediately and remain consistent across clients.

---

## 6.4 Multi-User Collaboration Flow

1. User A edits a paragraph.
2. The editor emits a change event.
3. Socket.IO sends the event to the document room.
4. User B and User C receive the update.
5. Their editors apply the change locally.
6. Presence updates continue separately for cursor and selection.

### Result

All collaborators see the same live document state.

---

## 6.5 Cursor and Presence Flow

1. Each client sends cursor position and selection changes.
2. Presence events are transmitted on a throttled interval.
3. Server broadcasts awareness updates to other room members.
4. Remote users see live cursor markers and names.
5. When a user disconnects, their presence is removed after timeout.

### Result

The document feels active and collaborative.

---

## 6.6 Comment Flow

1. User selects text and adds a comment.
2. Frontend sends the comment payload to the backend.
3. Express saves the comment through Prisma.
4. Socket.IO broadcasts a `comment:created` event.
5. All clients update the comment sidebar and inline marker.

### Result

Comments remain synchronized in real time.

---

## 6.7 Version History Flow

1. A meaningful edit threshold is reached or the user manually saves a version.
2. Backend stores a new `DocumentVersion` snapshot.
3. Version metadata is added to the database.
4. Users can view diffs between versions.
5. A selected version can be restored.

### Result

Document history is auditable and recoverable.

---

## 6.8 AI Assistance Flow

1. User highlights text or uses a slash command.
2. Frontend sends the selected content and document context to the backend.
3. Backend prepares a prompt with surrounding structure and metadata.
4. AI service returns rewritten text, summary, action items, or structured output.
5. Frontend applies the response as a suggestion or direct insertion.
6. Optional approval step lets the user accept or reject the AI output.

### Result

AI becomes a native editing primitive, not an external sidebar.

---

## 6.9 Interactive Block Flow

This is the feature that makes the product unique.

### Example: Live Chart Block

1. User inserts a chart block.
2. The block stores a data source configuration.
3. Backend or client fetches live metrics.
4. Chart renders inside the document.
5. If the source changes, the block refreshes automatically.

### Example: API Data Block

1. User pastes an API URL or connects a source.
2. Block stores endpoint, auth config, and refresh interval.
3. The block fetches live data.
4. The document shows updated values without manual copy-paste.

### Example: Executable Code Block

1. User inserts a code block.
2. The code is sent to a safe execution environment.
3. Output is returned and rendered below the block.
4. The result can be embedded into the document.

### Result

The document behaves like a lightweight app surface.

---

## 7. Socket.IO Event Architecture

A clean event structure is essential. The system should keep event names explicit and domain-based.

### Connection Events

* `connect`
* `disconnect`
* `room:join`
* `room:leave`

### Document Sync Events

* `doc:init`
* `doc:change`
* `doc:patch`
* `doc:sync-request`
* `doc:sync-response`
* `doc:save`

### Presence Events

* `presence:update`
* `presence:typing`
* `presence:cursor`
* `presence:selection`
* `presence:leave`

### Comment Events

* `comment:create`
* `comment:update`
* `comment:delete`
* `comment:resolve`

### Collaboration Events

* `collab:user-joined`
* `collab:user-left`
* `collab:lock-request`
* `collab:lock-release`

### AI and Smart Actions

* `ai:request`
* `ai:response`
* `ai:suggestion`

### System Events

* `error`
* `permission:denied`
* `version:created`
* `version:restored`

---

## 8. Socket.IO Flow in Detail

## 8.1 Connection Lifecycle

1. Client establishes WebSocket connection.
2. Auth token is attached in the handshake.
3. Server validates the token.
4. Server maps socket to a user identity.
5. Client joins a document room.
6. Server sends current snapshot and presence state.

## 8.2 Room-Based Collaboration

Each document has its own room.

* Room name example: `document:{documentId}`
* Every user currently editing the same document joins the room.
* All changes for that document are broadcast only within that room.

## 8.3 Update Broadcasting

When one user edits:

* Emit patch or delta
* Server validates permissions and revision context
* Server rebroadcasts to others
* Server may persist after a debounce or after block-level checkpoints

## 8.4 Presence Broadcasting

Presence data should be lightweight.

* cursor position
* selected text range
* typing state
* viewport focus state

Presence should be emitted more frequently than full document saves, but throttled to avoid network noise.

## 8.5 Late Join Sync

When a new collaborator joins:

1. Server sends the latest document snapshot.
2. Server sends current presence list.
3. Client reconciles local editor state.
4. Client begins receiving live patches.

---

## 9. Suggested Real-Time Sync Strategy

You have two realistic options:

### Option A: Simple Delta Sync

* Send editor patches over Socket.IO
* Persist full snapshots periodically
* Easier to build
* Suitable for MVP

### Option B: CRDT-Based Sync

* Use Yjs or a similar CRDT layer
* Better conflict handling
* Stronger for concurrent editing
* More complex but more correct

### Recommendation

For an interview-grade project, start with **Socket.IO + patch sync** for the MVP, then add **CRDT support** as the advanced version.

---

## 10. Suggested API Endpoints

### Auth

* `POST /auth/register`
* `POST /auth/login`
* `POST /auth/logout`
* `GET /auth/me`

### Workspaces

* `GET /workspaces`
* `POST /workspaces`
* `GET /workspaces/:id`

### Documents

* `GET /documents/:id`
* `POST /documents`
* `PATCH /documents/:id`
* `DELETE /documents/:id`
* `GET /documents/:id/versions`
* `POST /documents/:id/restore`

### Comments

* `POST /documents/:id/comments`
* `PATCH /comments/:id`
* `DELETE /comments/:id`

### Sharing

* `POST /documents/:id/share`
* `PATCH /share-links/:id`

### AI

* `POST /documents/:id/ai/summarize`
* `POST /documents/:id/ai/rewrite`
* `POST /documents/:id/ai/extract-tasks`

---

## 11. Recommended Folder Structure

### Frontend

* `src/components`
* `src/editor`
* `src/features/auth`
* `src/features/documents`
* `src/features/comments`
* `src/features/presence`
* `src/features/ai`
* `src/hooks`
* `src/lib/socket`
* `src/lib/api`
* `src/store`

### Backend

* `server/src/routes`
* `server/src/controllers`
* `server/src/services`
* `server/src/socket`
* `server/src/middleware`
* `server/src/lib`
* `server/prisma`

---

## 12. Key Design Principles

* Local-first interaction for instant typing feedback
* Server-authoritative permissions
* Room-based Socket.IO isolation
* Structured editor blocks rather than plain text only
* Snapshot + incremental sync hybrid
* AI actions should be context-aware and reversible
* Every advanced feature should degrade gracefully

---

## 13. What Makes This Project Unique

This should be the project narrative:

> A real-time collaborative document editor that goes beyond text editing by turning documents into interactive workspaces with live data blocks, AI transformations, presence awareness, and versioned collaboration.

That framing is stronger than “Google Docs clone” because it emphasizes:

* system design
* real-time sync
* collaborative state management
* document intelligence
* dynamic embedded content

---

## 14. MVP Scope

### MVP 1

* Authentication
* Workspace and document creation
* Rich text editor
* Save/load documents
* Socket.IO real-time collaboration
* Presence indicators
* Basic comments

### MVP 2

* Version history
* AI summarization and rewrite
* Share links and permissions
* Tables, code blocks, embeds

### MVP 3

* Live data widgets
* Executable code blocks
* Offline support
* CRDT synchronization
* Audit logs and advanced analytics

---

## 15. Final Architecture Summary

**Frontend (Vite + React)** renders the editor and sends changes in real time.

**Express** provides authenticated APIs for documents, permissions, comments, and AI actions.

**Socket.IO** handles low-latency collaboration, presence, cursor tracking, and room-based document sync.

**Prisma + PostgreSQL** persist document data, versions, users, permissions, and logs.

**Better Auth** secures user sessions and identity.
