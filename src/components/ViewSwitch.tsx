import { useEffect, useState } from "react";
import type { ReactNode } from "react";

interface ViewSwitchProps {
  /** Vue affichée ; tout changement déclenche la transition. */
  viewKey: string;
  children: ReactNode;
}

/** Sortie de l'ancienne vue, puis entrée de la nouvelle. */
const EXIT = 180;
const ENTER = 260;
/** Recouvrement : la nouvelle entre avant que l'ancienne ait fini de partir. */
const OVERLAP = 70;

/**
 * Enchaîne deux vues : l'ancienne s'efface en reculant et se floutant, la
 * nouvelle entre peu après. Le léger recouvrement évite le temps mort d'un
 * échange strictement séquentiel.
 */
export function ViewSwitch({ viewKey, children }: ViewSwitchProps) {
  const [shown, setShown] = useState({ key: viewKey, node: children });
  const [phase, setPhase] = useState<"idle" | "exit" | "entering" | "enter">("idle");

  /*
   * L'échange déclenche la sortie, puis remplace la vue. Le pilotage des
   * phases est séparé du rendu : `setShown` relance cet effet, et son
   * nettoyage annulerait la bascule vers l'état visible.
   */
  useEffect(() => {
    if (viewKey === shown.key) return;

    setPhase("exit");
    const swap = setTimeout(() => {
      setShown({ key: viewKey, node: children });
      setPhase("entering");
    }, EXIT - OVERLAP);

    return () => clearTimeout(swap);
  }, [viewKey, shown.key, children]);

  // Même vue : suivre ses mises à jour sans rejouer la transition.
  useEffect(() => {
    if (viewKey === shown.key) setShown(prev => ({ ...prev, node: children }));
  }, [children, viewKey, shown.key]);

  /*
   * Monté à l'état décalé, le contenu doit être peint avant de basculer :
   * sans cette frame intermédiaire, il n'y a pas d'état de départ à animer.
   */
  useEffect(() => {
    if (phase !== "entering") return;

    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setPhase("enter"));
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [phase]);

  // Retour au repos une fois l'entrée terminée.
  useEffect(() => {
    if (phase !== "enter") return;
    const timer = setTimeout(() => setPhase("idle"), ENTER);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col transition-all ease-out
        motion-reduce:transition-none
        ${phase === "exit"
          ? "scale-[.97] opacity-0 blur-[3px] duration-[180ms]"
          : phase === "entering"
            ? "scale-[1.02] opacity-0 blur-[2px] duration-0"
            : "scale-100 opacity-100 blur-0 duration-[260ms]"}`}
    >
      {/* La cascade anime les enfants directs de ce conteneur. */}
      <div
        className={`flex min-h-0 flex-1 flex-col
          ${phase === "enter" ? "view-cascade" : ""}`}
      >
        {shown.node}
      </div>
    </div>
  );
}
