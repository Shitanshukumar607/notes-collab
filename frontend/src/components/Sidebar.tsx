import { Search, Settings, FileText, Star, Clock, LogOut, User as UserIcon, ChevronDown, Plus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const user = session?.user;

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

  const docs = [
    { icon: FileText, label: "Private Roadmap", active: true },
    { icon: FileText, label: "Engineering Setup" },
    { icon: Star, label: "Design System Guidelines" },
    { icon: FileText, label: "Meeting Notes" },
  ];

  return (
    <aside className="w-[255px] min-w-[255px] h-full bg-sidebar border-r border-sidebar-border flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10 text-sidebar-foreground">
      {/* User Dropdown Header */}
      <div className="p-4 pb-2">
        <button className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group">
          <div className="w-5 h-5 bg-sidebar-primary rounded flex items-center justify-center text-sidebar-primary-foreground font-semibold text-[10px] shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
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
               <span className="ml-auto text-xs text-sidebar-foreground/50 border border-sidebar-border rounded px-1 tracking-widest">{item.shortcut}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto mt-4">
        <div className="flex flex-col gap-[2px] px-3">
          <div className="px-2 text-[11px] font-bold text-sidebar-foreground/40 uppercase tracking-widest mb-1.5 flex items-center justify-between group">
            <span>Workspace</span>
            <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-sidebar-accent p-[2px] rounded" />
          </div>
          {docs.map((doc, idx) => (
            <button
              key={idx}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md transition-all duration-150 text-sm font-medium ${
                doc.active ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
              }`}
            >
              <doc.icon className={`w-4 h-4 ${doc.active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/60"}`} />
              <span className="truncate">{doc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer User Profile */}
      <div className="p-3 border-t border-sidebar-border mt-auto bg-sidebar/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-2 py-2">
          {user?.image ? (
            <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full border border-sidebar-border shadow-sm shrink-0" />
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
    </aside>
  );
}
