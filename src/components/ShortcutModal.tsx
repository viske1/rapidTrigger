import { useEffect, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { ModalInterface, holdEscape } from "./ModalInterface";
import { Field, FIELD_INPUT } from "./Field";
import { Select } from "./Select";
import { MacKeyboard } from "./MacKeyboard";
import { ModalActions } from "./ModalActions";
import { KeyboardIcon } from "./icons/KeyboardIcon";
import { SCOPES } from "../lib/data";
import { comboFromEvent } from "../lib/keys";
import type {
  Shortcut,
  ShortcutDraft,
  ShortcutType,
  ScopeId,
} from "../lib/types";
import type { ScopeFilter } from "./types";

interface ShortcutModalProps {
  open: boolean;
  /** Raccourci à modifier, ou null pour une création. */
  editing: Shortcut | null;
  shortcuts: Shortcut[];
  currentScope: ScopeFilter;
  onSubmit: (draft: ShortcutDraft) => void;
  onClose: () => void;
}

const DEFAULT_HINT =
  "Astuce : cliquez dans le champ et appuyez sur la combinaison souhaitée (ex. ⌘⌥K).";

const TYPE_OPTIONS: { value: ShortcutType; label: string }[] = [
  { value: "app", label: "Application" },
  { value: "folder", label: "Dossier" },
  { value: "file", label: "Fichier" },
  { value: "url", label: "URL" },
  { value: "script", label: "Script" },
  { value: "system", label: "Système" },
];

export function ShortcutModal({
  open,
  editing,
  shortcuts,
  currentScope,
  onSubmit,
  onClose,
}: ShortcutModalProps) {
  const [draft, setDraft] = useState<ShortcutDraft>(() => ({
    name: editing?.name ?? "",
    target: editing?.target ?? "",
    type: editing?.type ?? "app",
    scope: editing?.scope ?? (currentScope !== "all" ? currentScope : "apps"),
    combo: editing?.combo ?? "",
  }));
  const [hint, setHint] = useState({ text: DEFAULT_HINT, error: false });
  const [capturing, setCapturing] = useState(false);

  /*
   * ModalInterface ferme déjà sur Échap. Pendant la capture, la touche doit
   * au contraire effacer la combinaison : on intercepte alors l'évènement en
   * amont pour qu'il n'atteigne pas la modale.
   */
  useEffect(() => {
    if (!capturing) return;
    return holdEscape();
  }, [capturing]);

  function handleCapture(e: KeyboardEvent<HTMLInputElement>) {
    e.preventDefault();

    if (e.key === "Escape") {
      setDraft((d) => ({ ...d, combo: "" }));
      setHint({
        text: "Combinaison effacée — le raccourci sera non assigné.",
        error: false,
      });
      return;
    }

    const combo = comboFromEvent(e);
    if (!combo) {
      setHint({
        text: "Continuez : ajoutez une touche à ce ou ces modificateurs.",
        error: false,
      });
      return;
    }

    setDraft((d) => ({ ...d, combo }));
    const clash = shortcuts.find(
      (s) => s.combo === combo && s.id !== editing?.id,
    );
    setHint(
      clash
        ? {
            text: `⚠︎ Déjà utilisé par « ${clash.name} ». Vous pouvez enregistrer, le conflit sera signalé.`,
            error: true,
          }
        : { text: "Combinaison libre.", error: false },
    );
  }

  /* Les trois champs obligatoires doivent être remplis pour valider. */
  const canSubmit =
    draft.name.trim().length > 0 && draft.target.trim().length > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      ...draft,
      name: draft.name.trim(),
      target: draft.target.trim(),
      combo: draft.combo.trim(),
    });
  }

  return (
    <ModalInterface
      open={open}
      onClose={onClose}
      label={editing ? "Modifier le raccourci" : "Nouveau raccourci"}
      className="max-w-[460px]"
      height="auto"
    >
      <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden p-4">
        <h3 className="m-0 mb-3 flex items-center gap-2 text-[15px] font-medium
          tracking-[-0.2px] text-content dark:text-content-dark">
          <KeyboardIcon className="h-[18px] w-[18px] shrink-0 text-content/60
            dark:text-content-dark/60" />
          {editing ? "Modifier le raccourci" : "Nouveau raccourci"}
        </h3>

        <div className="flex flex-col gap-2.5 overflow-y-auto">
          <Field label="Nom de l'action">
            <input
              required
              autoFocus
              value={draft.name}
              className={FIELD_INPUT}
              placeholder="Ouvrir le dossier Projets"
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
            />
          </Field>

          <Field label="Cible (fichier, dossier, application, URL…)">
            <input
              required
              value={draft.target}
              className={FIELD_INPUT}
              placeholder="~/git/shortcut-center"
              onChange={e => setDraft(d => ({ ...d, target: e.target.value }))}
            />
          </Field>

          <div className="flex gap-2.5">
            <Field label="Type">
              <Select
                label="Type"
                value={draft.type}
                options={TYPE_OPTIONS}
                onChange={type => setDraft(d => ({ ...d, type }))}
              />
            </Field>

            <Field label="Portée">
              <Select
                label="Portée"
                value={draft.scope}
                options={SCOPES.map(s => ({ value: s.id, label: s.label }))}
                onChange={scope => setDraft(d => ({ ...d, scope }))}
              />
            </Field>
          </div>

          <Field label="Raccourci">
            <input
              readOnly
              autoComplete="off"
              value={draft.combo}
              className={`${FIELD_INPUT} font-mono tracking-[.06em]`}
              placeholder="Cliquez puis tapez la combinaison"
              onKeyDown={handleCapture}
              onFocus={() => setCapturing(true)}
              onBlur={() => setCapturing(false)}
            />

            <p className={`mt-1.5 pl-1 text-[11px] ${
              hint.error ? "text-danger" : "text-muted dark:text-muted-dark"
            }`}>
              {hint.text}
            </p>

            <div className="mt-2.5 w-full">
              <MacKeyboard highlight={draft.combo} unit={22} />
            </div>
          </Field>
        </div>

        <ModalActions
          visible={canSubmit}
          onCancel={onClose}
          submitLabel={editing ? "Enregistrer" : "Créer"}
        />
      </form>
    </ModalInterface>
  );
}
