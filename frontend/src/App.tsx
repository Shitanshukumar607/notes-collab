import { SidebarProvider } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { SimpleEditor } from "./components/tiptap-templates/simple/simple-editor";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function EditorWrapper() {
  const { id } = useParams();

  if (!id) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
        <h2 className="text-2xl font-semibold mb-2">Select a document</h2>
        <p>
          Choose a document from the sidebar or create a new one to get started.
        </p>
      </div>
    );
  }

  return <SimpleEditor documentId={id} />;
}

function ProtectedApp() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex justify-center overflow-y-auto overflow-x-hidden w-full relative">
          <Routes>
            <Route path="/doc/:id" element={<EditorWrapper />} />
            <Route path="/" element={<EditorWrapper />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/*" element={<ProtectedApp />} />
    </Routes>
  );
}

export default App;
