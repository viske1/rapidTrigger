import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ModalInterface } from "./ModalInterface";
import { JoystickIcon } from "./icons/JoystickIcon";
import { ModalActions } from "./ModalActions";
import { Field, FIELD_INPUT } from "./Field";

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
      className="max-w-[412px]"
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

        <Field label={mode === "create" ? "Nom du nouveau jeu" : "Nouveau nom"}>
          <input
            ref={input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du jeu"
            aria-label="Nom du jeu"
            className={FIELD_INPUT}
          />
        </Field>

        <ModalActions
          visible={canSubmit}
          onCancel={onClose}
          submitLabel={mode === "create" ? "Créer" : "Renommer"}
        />
      </form>
    </ModalInterface>
  );
}
