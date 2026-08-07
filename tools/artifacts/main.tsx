import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StatusCard } from "../../src/client/components/StatusCard";
import "../../src/styles/globals.css";

function ReferenceArtifact() {
  return (
    <main>
      <header>
        <p className="eyebrow">Self-contained specimen · 0.1</p>
        <h1>Norfolk Kit Reference</h1>
        <p className="lede">Generated from the real reference component. No server or external request is required.</p>
      </header>
      <StatusCard subject="Product OS" status="ready" detail="Static evidence generated from executable source." />
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Missing artifact root");
createRoot(root).render(<StrictMode><ReferenceArtifact /></StrictMode>);
