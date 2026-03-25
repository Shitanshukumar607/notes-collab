import Sidebar from "./components/Sidebar";
import { SimpleEditor } from "./components/tiptap-templates/simple/simple-editor";

function App() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex justify-center overflow-y-auto overflow-x-hidden w-full relative">
        <SimpleEditor />
      </main>
    </div>
  );
}

export default App;
