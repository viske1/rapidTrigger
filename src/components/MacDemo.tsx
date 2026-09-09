import { useEffect, useMemo, useState } from 'react';
import { KeySlot } from './KeyCap';

interface MacDemoProps {
  /** Nombre d'emplacements affichés dans le dock. */
  slots?: number;
}

function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return useMemo(
    () => new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short', hour: '2-digit', minute: '2-digit',
    }).format(now),
    [now],
  );
}

/**
 * Maquette de bureau macOS : écran, barre de menu et dock d'emplacements vides.
 * Les touches (KeyCap) viendront s'y placer une fois la mise en scène arrêtée.
 */
export function MacDemo({ slots = 4 }: MacDemoProps) {
  const clock = useClock();

  return (
    <figure className="mac-demo">
      <div className="mac-screen">
        <div className="mac-wallpaper" aria-hidden="true" />

        <div className="mac-menubar">
          <span className="mac-menu-apple" aria-hidden="true"></span>
          <div className="mac-menu-right">
            <span className="mac-menu-icon" aria-hidden="true">▣</span>
            <span className="mac-menu-icon" aria-hidden="true">✳</span>
            <span className="mac-menu-icon" aria-hidden="true">⧉</span>
            <span className="mac-menu-clock">{clock}</span>
          </div>
        </div>

        <div className="mac-dock">
          {Array.from({ length: slots }, (_, i) => <KeySlot key={i} />)}
        </div>
      </div>
    </figure>
  );
}
