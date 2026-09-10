import { useRef } from 'react';

interface HeaderProps {
  onNew: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

/** En-tête de l'application : identité et actions globales. */
export function Header({ onNew, onExport, onImport, onReset }: HeaderProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <header
      className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 rounded-t-2xl
        border-b border-line bg-panel px-5 py-3.5
        dark:border-line-dark dark:bg-panel-dark"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid h-[38px] w-[38px] place-items-center rounded-[9px]
            bg-gradient-to-br from-accent to-accent-strong text-xl text-white"
        >
          ⌘
        </span>
        <div>
          <h1 className="m-0 text-base -tracking-[.01em]">Shortcut Center</h1>
          <p className="mb-0 mt-0.5 text-xs text-muted dark:text-muted-dark">
            Centre de contrôle des raccourcis macOS — démo web
          </p>
        </div>
      </div>

      <nav aria-label="Actions globales" className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={onNew}>
          ＋ Nouveau raccourci
        </button>
        <button type="button" className="btn" onClick={onExport}>Exporter</button>
        <button type="button" className="btn" onClick={() => fileInput.current?.click()}>
          Importer
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          hidden
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) onImport(file);
            e.target.value = '';
          }}
        />
        <button type="button" className="btn btn-danger" onClick={onReset}>
          Réinitialiser
        </button>
      </nav>
    </header>
  );
}
