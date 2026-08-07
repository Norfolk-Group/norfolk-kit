import React from "react";
import { createRoot } from "react-dom/client";
import { AuthJourneyCatalog } from "../../src/components/auth/AuthJourneyCatalog";
import "./style.css";

createRoot(document.getElementById("root")!).render(<AuthJourneyCatalog />);
