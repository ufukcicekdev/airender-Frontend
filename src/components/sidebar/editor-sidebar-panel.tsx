"use client";

import { AccountPanel } from "@/components/account/account-panel";
import { HistoryPanel } from "@/components/sidebar/history-panel";
import { SettingsPanel } from "@/components/sidebar/settings-panel";
import { SupportPanel } from "@/components/sidebar/support-panel";
import { TutorialPanel } from "@/components/sidebar/tutorial-panel";
import type { SidebarSection } from "@/store/ui-store";

interface EditorSidebarPanelProps {
  section: SidebarSection;
  onClose: () => void;
}

export function EditorSidebarPanel({ section, onClose }: EditorSidebarPanelProps) {
  switch (section) {
    case "account":
      return <AccountPanel onClose={onClose} />;
    case "history":
      return <HistoryPanel onClose={onClose} />;
    case "tutorial":
      return <TutorialPanel onClose={onClose} />;
    case "support":
      return <SupportPanel onClose={onClose} />;
    case "settings":
      return <SettingsPanel onClose={onClose} />;
    default:
      return null;
  }
}
