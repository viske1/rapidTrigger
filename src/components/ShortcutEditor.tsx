import { useEffect, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Field, FieldGroup, FieldLabel, FIELD_INPUT } from "./Field";
import { ComboAdvisor } from "./ComboAdvisor";
import { Select } from "./Select";
import { IconButton } from "./IconButton";
import { CustomTooltip } from "./CustomTooltip";
import { CloseSmallIcon } from "./icons/CloseSmallIcon";
import { Button } from "./Button";
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

interface ShortcutEditorProps {
  /** Raccourci à modifier, ou null pour une création. */
  editing: Shortcut | null;
  shortcuts: Shortcut[];
  currentScope: ScopeFilter;
  onSubmit: (draft: ShortcutDraft) => void;
  onClose: () => void;
  /** Fermeture demandée alors que la saisie a changé : à confirmer. */
  onDirtyClose: () => void;
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

export function ShortcutEditor({
  editing,
  shortcuts,
  currentScope,
  onSubmit,
  onClose,
  onDirtyClose,
}: ShortcutEditorProps) {
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
   * Échap abandonne l'édition, sauf pendant la capture où la touche sert à
   * effacer la combinaison.
   */
  useEffect(() => {
    if (capturing) return;

    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [capturing, onClose]);

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

  /*
   * Fermer sans prévenir perdrait la saisie : on confirme dès qu'un champ
   * s'écarte de son état d'origine.
   */
  const dirty =
    draft.name !== (editing?.name ?? "") ||
    draft.target !== (editing?.target ?? "") ||
    draft.combo !== (editing?.combo ?? "");

  function requestClose() {
    if (dirty) onDirtyClose();
    else onClose();
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
    <div className="flex min-h-0 flex-1 flex-col">
      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 pt-6"
      >
        <div className="mb-5 flex shrink-0 items-center justify-between gap-2">
          <h3
            className="m-0 flex items-center gap-2 text-[15px] font-medium
            tracking-[-0.2px] text-content dark:text-content-dark"
          >
            <KeyboardIcon
              className="h-[18px] w-[18px] shrink-0 text-content/60
              dark:text-content-dark/60"
            />
            {editing ? "Modifier le raccourci" : "Nouveau raccourci"}
          </h3>

          <div className="flex shrink-0 items-center gap-2">
            {/* Le bouton n'apparaît qu'une fois les champs requis renseignés. */}
            <Button
              type="submit"
              variant="solid"
              /*
                En style inline : Button déclare transition-colors, dont la
                règle est émise après celle-ci dans la feuille et écraserait
                transition-property.
              */
              style={{
                transition:
                  "opacity 300ms cubic-bezier(0.16,1,0.3,1)," +
                  " transform 300ms cubic-bezier(0.16,1,0.3,1)," +
                  " filter 300ms cubic-bezier(0.16,1,0.3,1)",
                opacity: canSubmit ? 1 : 0,
                transform: canSubmit ? "scale(1)" : "scale(0.85)",
                filter: canSubmit ? "blur(0)" : "blur(2px)",
                pointerEvents: canSubmit ? undefined : "none",
              }}
            >
              {editing ? "Enregistrer" : "Créer ce raccourcis"}
            </Button>

            <CustomTooltip text="Fermer" position="bottom">
              <IconButton label="Fermer" onClick={requestClose}>
                <CloseSmallIcon className="h-[15px] w-[15px]" />
              </IconButton>
            </CustomTooltip>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-12 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col gap-2.5 overflow-y-auto">
            <Field label="Nom de l'action">
              <input
                required
                autoFocus
                value={draft.name}
                className={FIELD_INPUT}
                placeholder="Ouvrir le dossier Projets"
                onChange={(e) =>
                  setDraft((d) => ({ ...d, name: e.target.value }))
                }
              />
            </Field>

            {/* Un seul bloc : la cible occupe la moitié, type et portée un quart. */}
            <FieldGroup>
              <div className="w-1/2 min-w-0">
                <FieldLabel label="Cible (fichier, dossier, application, URL…)" />
                <input
                  required
                  value={draft.target}
                  className={FIELD_INPUT}
                  placeholder="~/git/shortcut-center"
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, target: e.target.value }))
                  }
                />
              </div>

              <div className="w-1/4 min-w-0">
                <FieldLabel label="Type" />
                <Select
                  label="Type"
                  value={draft.type}
                  options={TYPE_OPTIONS}
                  onChange={(type) => setDraft((d) => ({ ...d, type }))}
                />
              </div>

              <div className="w-1/4 min-w-0">
                <FieldLabel label="Portée" />
                <Select
                  label="Portée"
                  value={draft.scope}
                  options={SCOPES.map((s) => ({ value: s.id, label: s.label }))}
                  onChange={(scope) => setDraft((d) => ({ ...d, scope }))}
                />
              </div>
            </FieldGroup>

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

              <p
                className={`mt-1.5 pl-1 text-[11px] ${
                  hint.error ? "text-danger" : "text-muted dark:text-muted-dark"
                }`}
              >
                {hint.text}
              </p>
            </Field>
          </div>

          <ComboAdvisor
            combo={draft.combo}
            shortcuts={shortcuts}
            editingId={editing?.id}
          />
        </div>
      </form>
    </div>
  );
}
