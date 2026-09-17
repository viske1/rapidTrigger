import { ModalInterface } from "./ModalInterface";
import { Button } from "./Button";
import { Field } from "./Field";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Demande de confirmation avant une action qui perd des données. */
export function ConfirmModal({
  open, title, message,
  confirmLabel = "Confirmer", cancelLabel = "Annuler",
  onConfirm, onCancel,
}: ConfirmModalProps) {
  return (
    <ModalInterface
      open={open}
      onClose={onCancel}
      label={title}
      className="max-w-[360px]"
      height="auto"
      anchor="stable"
    >
      <div className="p-4">
        <h3 className="m-0 text-[15px] font-medium tracking-[-0.2px]
          text-content dark:text-content-dark">
          {title}
        </h3>

        {message && (
          <div className="mt-3">
            <Field>
              <p className="m-0 pl-1 text-[13px] tracking-[-0.1px]
                text-muted dark:text-muted-dark">
                {message}
              </p>
            </Field>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="flat" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="solid" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalInterface>
  );
}
