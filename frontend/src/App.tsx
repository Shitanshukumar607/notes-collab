import { Routes, Route, Navigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import Sidebar from "./components/Sidebar";
import { SimpleEditor } from "./components/tiptap-templates/simple/simple-editor";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function ProtectedApp() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex justify-center overflow-y-auto overflow-x-hidden w-full relative">
        <SimpleEditor />
      </main>
    </div>
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
