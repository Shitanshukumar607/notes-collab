import { Search, Settings, FileText, Star, Clock } from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { icon: Search, label: "Search", shortcut: "⌘K" },
    { icon: Clock, label: "Recent" },
    { icon: Settings, label: "Settings" },
  ];

  const docs = [
    { icon: FileText, label: "Private Roadmap", active: true },
    { icon: FileText, label: "Engineering Setup" },
    { icon: Star, label: "Design System Guidelines" },
    { icon: FileText, label: "Meeting Notes" },
  ];

  return (
    <aside className="w-[250px] min-w-[250px] h-full bg-sidebar border-r border-sidebar-border p-4 flex flex-col gap-6 shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10 text-sidebar-foreground">
      <div className="flex items-center gap-2 px-2 text-sm font-medium">
        <div className="w-5 h-5 bg-sidebar-primary rounded flex items-center justify-center text-sidebar-primary-foreground font-semibold text-xs">
          S
        </div>
        Shitanshu's Work
      </div>

      <nav className="flex flex-col gap-[2px]">
        {navItems.map((item, idx) => (
          <button
            key={idx}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150 text-sidebar-foreground/80 text-sm font-medium"
          >
            <item.icon className="w-4 h-4 text-sidebar-foreground/60" />
            <span>{item.label}</span>
            {item.shortcut && (
               <span className="ml-auto text-xs text-sidebar-foreground/50 border border-sidebar-border rounded px-1 tracking-widest">{item.shortcut}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="flex flex-col gap-[2px]">
        <div className="px-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-1">
          Workspace
        </div>
        {docs.map((doc, idx) => (
          <button
            key={idx}
            className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md transition-colors duration-150 text-sm font-medium ${
              doc.active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
            }`}
          >
            <doc.icon className={`w-4 h-4 ${doc.active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/60"}`} />
            <span className="truncate">{doc.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
