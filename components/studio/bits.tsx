import ui from "./site.module.css";

/* A hairline arrow in its own disc. The trailing icon never sits naked beside
   a label: it is a button inside the button, and it is the part that moves. */
export function Arrow({ down = false }: { down?: boolean }) {
  return (
    <span className={ui.btnIcon} aria-hidden>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        {down ? <path d="M8 3.5v9M4.2 8.8 8 12.5l3.8-3.7" /> : <path d="M4.5 11.5l7-7M5.8 4.5h5.7v5.7" />}
      </svg>
    </span>
  );
}
