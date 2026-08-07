import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { AnalystCubeIcon } from "../../src/components/animations/AnalystCubeIcon";
import "./styles.css";

function Catalog() {
  const [playing, setPlaying] = useState(true);
  return <main><p className="eyebrow">Private Norfolk AI reference · Product OS version unreleased · Kit version 0.1.0</p><p className="meta">Source path src/components/animations/AnalystCubeIcon.tsx · source-sha256 __MOTION_SOURCE_HASH__ · approval candidate · freshness 2026-08-05</p><h1>Motion catalog</h1><section><div><h2>Analyst cube</h2><p>Real portable component · registry id <code>analyst-cube</code></p><p>Pause the animation or use the operating-system reduced-motion setting without losing component identity.</p><button type="button" aria-pressed={!playing} onClick={() => setPlaying((value) => !value)}>{playing ? "Pause" : "Play"}</button></div><AnalystCubeIcon size={150} playing={playing} decorative={false} ariaLabel="Analyst cube processing indicator" /></section></main>;
}

createRoot(document.getElementById("root")!).render(<Catalog />);
