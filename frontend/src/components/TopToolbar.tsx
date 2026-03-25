import { type Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Link,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

interface TopToolbarProps {
  editor: Editor | null;
}

export default function TopToolbar({ editor }: TopToolbarProps) {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="sticky top-0 z-50 flex items-center gap-1 p-2 bg-background/80 backdrop-blur border-b border-border mb-8 w-full max-w-[800px] mx-auto">
      <div className="flex items-center gap-1 text-muted-foreground">
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-accent text-accent-foreground"
              : ""
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-accent text-accent-foreground"
              : ""
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-accent text-accent-foreground"
              : ""
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-border mx-2"></div>

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors ${
            editor.isActive("bold") ? "bg-accent text-accent-foreground" : ""
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors ${
            editor.isActive("italic") ? "bg-accent text-accent-foreground" : ""
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors ${
            editor.isActive("underline")
              ? "bg-accent text-accent-foreground"
              : ""
          }`}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-border mx-2"></div>

        <button
          onClick={setLink}
          className={`p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors ${
            editor.isActive("link") ? "bg-accent text-accent-foreground" : ""
          }`}
          title="Link"
        >
          <Link className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
