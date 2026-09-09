import { useRef } from 'react';

interface HeaderProps {
  onNew: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

/**
 * En-tête de l'application : identité et actions globales.
 * Remplace Topbar — même rôle, marquage sémantique et libellés alignés sur la maquette.
 */
export function Header({ onNew, onExport, onImport, onReset }: HeaderProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <header className="app-header">
      <div className="app-header-brand">
        <span className="app-header-logo" aria-hidden="true">⌘</span>
        <div>
          <h1 className="app-header-title">Shortcut Center</h1>
          <p className="app-header-tagline">
            Centre de contrôle des raccourcis macOS — démo web
          </p>
        </div>
      </div>

      <nav className="app-header-actions" aria-label="Actions globales">
        <button type="button" className="btn primary" onClick={onNew}>
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
        <button type="button" className="btn danger-ghost" onClick={onReset}>
          Réinitialiser
        </button>
      </nav>
    </header>
  );
}
