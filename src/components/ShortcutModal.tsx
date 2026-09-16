import { useEffect, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { ModalInterface, holdEscape } from "./ModalInterface";
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

const LABEL = "mb-3 block text-xs text-muted dark:text-muted-dark";

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
      <div className="overflow-auto p-5">
        <h3 className="m-0 mb-3.5 text-[15px]">
          {editing ? "Modifier le raccourci" : "Nouveau raccourci"}
        </h3>

        <form onSubmit={handleSubmit}>
          <label className={LABEL}>
            Nom de l'action
            <input
              required
              autoFocus
              value={draft.name}
              className="field"
              placeholder="Ouvrir le dossier Projets"
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
            />
          </label>

          <label className={LABEL}>
            Cible (fichier, dossier, application, URL…)
            <input
              required
              value={draft.target}
              className="field"
              placeholder="~/git/shortcut-center"
              onChange={(e) =>
                setDraft((d) => ({ ...d, target: e.target.value }))
              }
            />
          </label>

          <label className={LABEL}>
            Type
            <select
              className="field"
              value={draft.type}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  type: e.target.value as ShortcutType,
                }))
              }
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className={LABEL}>
            Portée
            <select
              className="field"
              value={draft.scope}
              onChange={(e) =>
                setDraft((d) => ({ ...d, scope: e.target.value as ScopeId }))
              }
            >
              {SCOPES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className={LABEL}>
            Raccourci
            <input
              readOnly
              className="field font-mono tracking-[.06em]"
              autoComplete="off"
              value={draft.combo}
              placeholder="Cliquez puis tapez la combinaison"
              onKeyDown={handleCapture}
              onFocus={() => setCapturing(true)}
              onBlur={() => setCapturing(false)}
            />
          </label>

          <p
            className={`-mt-1.5 mb-3.5 text-[11px] ${hint.error ? "text-danger" : "text-muted dark:text-muted-dark"}`}
          >
            {hint.text}
          </p>

          <div className="mt-1.5 flex justify-end gap-2">
            <button type="button" className="btn" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </ModalInterface>
  );
}
