"use client";

import { useState } from "react";
import LandingPageList from "./LandingPageList";
import LandingPageEditor from "./LandingPageEditor";

// This component is the entry point for the landing page generator feature.
// It switches between two views:
//   - LandingPageList: shows all landing pages the user has created
//   - LandingPageEditor: the vibe coding interface for a specific page
export default function LandingPageGenerator() {
  // null means show the list; a page ID means show the editor for that page
  const [activePageId, setActivePageId] = useState<string | null>(null);

  if (activePageId) {
    return (
      <LandingPageEditor
        pageId={activePageId}
        onBack={() => setActivePageId(null)}
      />
    );
  }

  return <LandingPageList onSelectPage={setActivePageId} />;
}
