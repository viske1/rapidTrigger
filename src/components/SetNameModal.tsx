import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ModalInterface } from "./ModalInterface";
import { JoystickIcon } from "./icons/JoystickIcon";
import { ModalActions } from "./ModalActions";

interface SetNameModalProps {
  open: boolean;
  /** Nom actuel pour un renommage, vide pour une création. */
  initialName?: string;
  /** Titre et libellé du bouton varient selon l'intention. */
  mode: "create" | "rename";
  onSubmit: (name: string) => void;
  onClose: () => void;
}

/** Saisie du nom d'un jeu de raccourcis, à la création comme au renommage. */
export function SetNameModal({
  open,
  initialName = "",
  mode,
  onSubmit,
  onClose,
}: SetNameModalProps) {
  const [name, setName] = useState(initialName);
  const input = useRef<HTMLInputElement>(null);

  // Le champ est repeuplé à chaque ouverture : la modale reste montée entre
  // deux usages, et garderait sinon la saisie précédente.
  useEffect(() => {
    if (!open) return;
    setName(initialName);
    const timer = setTimeout(() => input.current?.select(), 60);
    return () => clearTimeout(timer);
  }, [open, initialName]);

  /*
   * À la création, un nom suffit ; au renommage, il doit en plus différer du
   * nom actuel — sinon valider ne changerait rien.
   */
  const trimmed = name.trim();
  const canSubmit =
    trimmed.length > 0 && (mode === "create" || trimmed !== initialName.trim());

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (canSubmit) onSubmit(trimmed);
  }

  return (
    <ModalInterface
      open={open}
      onClose={onClose}
      label={mode === "create" ? "Nouveau jeu" : "Renommer le jeu"}
      className="max-w-[380px]"
      height="auto"
      anchor="stable"
    >
      <form onSubmit={handleSubmit} className="p-2">
        <h3
          className="m-0 flex items-center gap-2 text-[15px] font-medium
          tracking-[-0.2px] text-content dark:text-content-dark px-4 pb-4 pt-3"
        >
          <JoystickIcon
            className="h-[18px] w-[18px] shrink-0 text-content/60
            dark:text-content-dark/60"
          />
          {mode === "create" ? "Nouveau jeu" : "Renommer le jeu"}
        </h3>

        <div
          /*
            Deux ombres internes pour le relief : un liseré clair sur tout le
            pourtour, puis une seconde sans flou et plus claire, qui n'éclaire
            que la partie haute comme le ferait une lumière rasante.
          */
          style={{
            boxShadow:
              "inset 0 0 4px 0 rgba(255,255,255,.1), inset 0 1.2px 0 0 rgba(255,255,255,.10)",
          }}
          className="flex flex-col items-start justify-center w-full bg-white/5 border border-black p-3 rounded-[18px]"
        >
          <span className="text-[13px] tracking-[-0.1px] font-medium text-white mb-2 pl-1">
            Nom du nouveau jeu
          </span>
          <input
            ref={input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du jeu"
            aria-label="Nom du jeu"
            className="h-[34px] w-full rounded-[10px] border-0 bg-black/[.04] px-3
            text-[13px] font-medium tracking-[-0.1px] text-content outline-none
            transition-all duration-200 placeholder:text-content/40
            focus:ring-2 focus:ring-black/10
            dark:bg-white/[.06] dark:text-content-dark
            dark:placeholder:text-content-dark/40 dark:focus:ring-white/15"
          />
        </div>

        <ModalActions
          visible={canSubmit}
          onCancel={onClose}
          submitLabel={mode === "create" ? "Créer" : "Renommer"}
        />
      </form>
    </ModalInterface>
  );
}
