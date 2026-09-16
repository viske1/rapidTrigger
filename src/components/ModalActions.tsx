import { InfoIcon } from "./icons/InfoIcon";

interface ModalActionsProps {
  /** Message affiché à gauche, ex. « Modifications non enregistrées ». */
  message?: string;
  /** Révèle la barre : les conditions de validation sont réunies. */
  visible: boolean;
  onCancel: () => void;
  /** Libellé du bouton de validation, ex. « Créer », « Renommer ». */
  submitLabel: string;
  cancelLabel?: string;
}

/** Hauteur de la barre déployée, en pixels. */
const HEIGHT = 52;

/**
 * Barre d'actions d'une modale, masquée tant que la saisie n'est pas valide.
 *
 * À l'entrée, la hauteur s'ouvre d'abord et les boutons suivent aux deux
 * tiers, en cascade. À la sortie, ils partent aussitôt — sans quoi la hauteur
 * se refermerait sur eux et les rognerait.
 */
export function ModalActions({
  visible,
  onCancel,
  submitLabel,
  cancelLabel = "Annuler",
  message = "Modifications non enregistrées",
}: ModalActionsProps) {
  const button = `transition-[opacity,transform,filter] duration-500
     [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]
     motion-reduce:transition-none
     ${
       visible
         ? "translate-y-0 opacity-100 blur-0"
         : "pointer-events-none -translate-y-5 opacity-0 blur-[3px]"
     }`;

  // Cascade de 50 ms, en phase avec le début de la transition de hauteur.
  const stagger = (index: number) =>
    visible ? `${index * 50}ms` : `${index * 50}ms`;

  return (
    <div
      aria-hidden={!visible}
      style={{ height: visible ? HEIGHT : 0 }}
      className={`overflow-hidden transition-[height] ease-out
        motion-reduce:transition-none
        ${visible ? "duration-300" : "delay-200 duration-300"}`}
    >
      <div className="flex h-[52px] items-center justify-between gap-2 pt-[12px] px-1.5">
        <span
          style={{ transitionDelay: stagger(0) }}
          className={`flex items-center gap-2 text-[13px] font-normal
            tracking-[-0.1px] text-content/60 dark:text-content-dark/60 ${button}`}
        >
          <InfoIcon className="h-[15px] w-[15px] shrink-0" />
          {message}
        </span>

        <span className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            style={{ transitionDelay: stagger(0) }}
            className={`btn btn-tiny ${button}`}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            style={{ transitionDelay: stagger(1) }}
            className={`btn btn-tiny btn-primary ${button}`}
          >
            {submitLabel}
          </button>
        </span>
      </div>
    </div>
  );
}
