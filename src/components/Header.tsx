import { useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { CustomTooltip } from "./CustomTooltip";
import { DropdownInterface } from "./DropdownInterface";
import { ButtonOptionInterface } from "./ButtonOptionInterface";
import { PlusIcon } from "./icons/PlusIcon";
import { HistoryIcon } from "./icons/HistoryIcon";
import { MoreVertIcon } from "./icons/MoreVertIcon";
import { AutorenewIcon } from "./icons/AutorenewIcon";
import { DownloadIcon } from "./icons/DownloadIcon";
import { UploadIcon } from "./icons/UploadIcon";

interface HeaderProps {
  search: string;
  onSearchChange: (search: string) => void;
  onNew: () => void;
  onToggleHistory: () => void;
  historyOpen: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

/** Barre de recherche et actions de l'interface. */
export function Header({
  search,
  onSearchChange,
  onNew,
  onToggleHistory,
  historyOpen,
  onExport,
  onImport,
  onReset,
}: HeaderProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex items-center gap-1 p-4">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Rechercher un raccourci…"
        aria-label="Rechercher un raccourci"
        className="w-full min-w-0 flex-1 rounded-[10px] border-0 bg-black/[.04] py-[5px] pl-3 pr-3
          text-[13px] font-medium tracking-[-0.1px] text-content outline-none
          transition-all duration-200 placeholder:text-content/40
          focus:ring-2 focus:ring-black/10 focus:ring-offset-0
          dark:bg-white/[.06] dark:text-content-dark dark:placeholder:text-content-dark/40
          dark:focus:ring-white/15"
      />

      <CustomTooltip text="Nouveau raccourci" position="bottom">
        <IconButton label="Nouveau raccourci" onClick={onNew}>
          <PlusIcon className="h-[14px] w-[14px]" />
        </IconButton>
      </CustomTooltip>

      <CustomTooltip
        text={historyOpen ? "Masquer l'historique" : "Historique des modifications"}
        position="bottom"
      >
        <IconButton
          label="Historique des modifications"
          onClick={onToggleHistory}
          aria-pressed={historyOpen}
          className={
            historyOpen
              ? "bg-black/[.09] text-content dark:bg-white/[.12] dark:text-content-dark"
              : ""
          }
        >
          <HistoryIcon className="h-[14px] w-[14px]" />
        </IconButton>
      </CustomTooltip>

      {/* Ancre du menu : le Dropdown se positionne sur ce parent. */}
      <div className="relative">
        <IconButton
          label="Plus d'options"
          data-dropdown-trigger
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <MoreVertIcon className="h-[14px] w-[14px]" />
        </IconButton>

        <DropdownInterface
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          align="right"
          className="w-[200px]"
        >
          <ButtonOptionInterface
            label="Exporter"
              icon={<DownloadIcon className="h-4 w-4" />}
            onClick={() => {
              setMenuOpen(false);
              onExport();
            }}
          />
          <ButtonOptionInterface
            label="Importer"
              icon={<UploadIcon className="h-4 w-4" />}
            onClick={() => {
              setMenuOpen(false);
              fileInput.current?.click();
            }}
          />
          <ButtonOptionInterface
            label="Réinitialiser"
              icon={<AutorenewIcon className="h-4 w-4" />}
            onClick={() => {
              setMenuOpen(false);
              onReset();
            }}
          />
        </DropdownInterface>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImport(file);
          e.target.value = "";
        }}
      />
    </header>
  );
}
