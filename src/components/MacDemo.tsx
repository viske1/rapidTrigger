import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "./Dropdown";
import {
  ButtonOptionDropdown,
  DropdownSeparator,
} from "./ButtonOptionDropdown";
import { ShortcutReminder } from "./ShortcutReminder";
import { useModifierHold } from "../lib/useModifierHold";
import type { ReactNode } from "react";
import { KeySlot } from "./KeyCap";
import { WifiIcon } from "./icons/WifiIcon";
import { ControlCenterIcon } from "./icons/ControlCenterIcon";
import { LogoIcon } from "./icons/LogoIcon";

interface MacDemoProps {
  /** Nombre d'emplacements affichés dans le dock. */
  slots?: number;
  /** Ouvre le centre de contrôle depuis le logo de la barre de menu. */
  onOpen?: () => void;
  /** Contenu superposé à l'écran, ex. la modale du centre de contrôle. */
  children?: ReactNode;
}

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(now),
    [now],
  );
}

/**
 * Maquette de bureau macOS : écran, barre de menu et dock d'emplacements vides.
 * Les touches (KeyCap) viendront s'y placer une fois la mise en scène arrêtée.
 */
interface MenuItem {
  label: string;
  combo?: string;
  submenu?: boolean;
}

/** Entrées du menu « Raccourcis », dans l'esprit des menus macOS. */
const MENU_GROUPS: MenuItem[][] = [
  [
    { label: "Annuler", combo: "⌘ Z" },
    { label: "Rétablir", combo: "⇧ ⌘ Z" },
  ],
  [
    { label: "Couper", combo: "⌘ X" },
    { label: "Copier", combo: "⌘ C" },
    { label: "Coller", combo: "⌘ V" },
  ],
  [
    { label: "Rechercher", combo: "⌘ F" },
    { label: "Remplacer", combo: "⌥ ⌘ F" },
    // Sans combo : ⌘ + survol y propose « Créer » au lieu de « Modifier ».
    { label: "Rechercher dans la sélection" },
  ],
  [
    { label: "Rechercher dans les fichiers", combo: "⇧ ⌘ F" },
    { label: "Remplacer dans les fichiers", combo: "⇧ ⌘ H" },
    { label: "Ouvrir le dossier du projet" },
  ],
];

export function MacDemo({ slots = 4, onOpen, children }: MacDemoProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { held, symbols } = useModifierHold();

  // Raccourcis dont la combinaison commence par les modificateurs maintenus.
  const reminderEntries = useMemo(() => {
    if (symbols.length === 0) return [];

    const prefix = symbols.join(" ");
    return MENU_GROUPS.flat()
      .filter((item): item is { label: string; combo: string } =>
        Boolean(item.combo),
      )
      .filter((item) => item.combo.startsWith(prefix + " "));
  }, [symbols]);
  const clock = useClock();

  return (
    <figure className="m-0 flex min-h-screen items-center justify-center p-5">
      {/*
        La hauteur pilote la taille, la largeur suit le ratio 16:9.
        Sous un viewport plus étroit que 16:9, la contrainte s'inverse
        (max-aspect-ratio) pour éviter tout débordement horizontal.
      */}
      <div
        className="relative aspect-video h-[80vh] w-auto max-w-full shrink-0
          overflow-hidden rounded-[32px] shadow-screen
          [@media(max-aspect-ratio:16/9)]:h-auto [@media(max-aspect-ratio:16/9)]:w-full"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#241a52] bg-[url('/img/macOS_wallpaper_2.jpg')]
            bg-cover bg-center bg-no-repeat"
        />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between pt-5 px-5 text-white">
          {/* <span
            aria-hidden="true"
            className="grid h-[30px] w-11 place-items-center rounded-b-[12px] rounded-r-[12px] rounded-tl-[18px] bg-white/[.16] text-[15px]"
          ></span> */}

          {/*
            Le dropdown est sorti du conteneur flouté : backdrop-filter y crée
            un contexte d'empilement dont un enfant ne peut plus flouter le
            dehors. Ce wrapper relative sert d'ancre de positionnement.
          */}
          <div className="relative">
            <div className="flex items-center gap-3 rounded-b-[12px] rounded-r-[12px] rounded-tl-[18px] bg-white/[.16] pl-1 pr-1 py-[4px] text-[15px] backdrop-blur-sm tracking-[-0.2px]">
              <button
                type="button"
                data-dropdown-trigger
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="hover-pop grid h-7 place-items-center rounded-b-[9px] rounded-r-[9px] rounded-tl-[14px] px-2.5
                    focus-visible:outline-none"
              >
                <span className="font-medium">Raccourcis</span>
              </button>
            </div>

            <Dropdown
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              className="w-[320px]"
            >
              {MENU_GROUPS.map((group, i) => (
                <div key={i}>
                  {i > 0 && <DropdownSeparator />}
                  {group.map((item) => (
                    <ButtonOptionDropdown
                      key={item.label}
                      label={item.label}
                      combo={item.combo}
                      submenu={item.submenu}
                      onClick={() => {
                        setMenuOpen(false);
                        onOpen?.();
                      }}
                      onTrigger={() => {
                        setMenuOpen(false);
                        onOpen?.();
                      }}
                    />
                  ))}
                </div>
              ))}
            </Dropdown>
          </div>

          <div className="flex items-center gap-3 rounded-b-[12px] rounded-l-[12px] rounded-tr-[18px] bg-white/[.16] pl-3 pr-4 py-[8px] text-[15px] backdrop-blur-sm tracking-[-0.2px]">
            <div className="flex gap-2 items-center mr-2">
              <button
                type="button"
                onClick={onOpen}
                aria-label="Ouvrir le centre de contrôle"
                className="hover-pop grid h-6 w-6 place-items-center rounded-lg
                  focus-visible:outline-none"
              >
                <LogoIcon className="h-[16px] w-auto" />
              </button>
              <div className="flex items-center justify-center h-6 w-6">
                <WifiIcon className="h-[12px] w-auto" />
              </div>
              <div className="flex items-center justify-center h-6 w-6">
                <ControlCenterIcon className="h-[13px] w-auto" />
              </div>
            </div>

            <span className="font-medium">{clock}</span>
          </div>
        </div>

        <div
          className="absolute bottom-[22px] left-1/2 flex -translate-x-1/2 gap-2.5
            rounded-[32px] border border-white/[.22] bg-white/[.18] p-3 backdrop-blur-md"
        >
          {Array.from({ length: slots }, (_, i) => (
            <KeySlot key={i} />
          ))}
        </div>

        <ShortcutReminder
          open={held}
          symbols={symbols}
          entries={reminderEntries}
        />

        {children}
      </div>
    </figure>
  );
}
