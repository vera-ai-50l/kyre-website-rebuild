"use client";

import styles from "./hero.module.css";
import { CalLoader, calAttrs } from "./cal";
import { RebuildScene } from "./RebuildScene";
import { useCursorGlow } from "./useCursorGlow";

export default function Hero() {
  /* Publishes --mx/--my/--px/--py to the section; every background layer below
     reads them straight out of CSS, so moving the mouse costs no re-render. */
  const glowRef = useCursorGlow<HTMLElement>();

  return (
    <section ref={glowRef} className={styles.hero}>
      <div className={styles.field} aria-hidden>
        <span className={`${styles.track} ${styles.t1}`}>
          <span className={`${styles.wash} ${styles.w1}`} />
        </span>
        <span className={`${styles.track} ${styles.t2}`}>
          <span className={`${styles.wash} ${styles.w2}`} />
        </span>
      </div>
      <div className={styles.grain} aria-hidden />
      <div className={styles.horizon} aria-hidden />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.pulse} aria-hidden />
            Interface rebuilds for AI infrastructure
          </p>

          {/* No "it's not X, it's Y". That construction is the most-flagged
              generated-copy tell there is, and this page had three of them. */}
          <h1 className={styles.headline}>
            They judge the model by the{" "}
            <span className="serif">screen</span> it arrives on.
          </h1>

          <p className={styles.sub}>
            You&apos;ve stared at your own dashboard for six months, so you
            can&apos;t see it anymore. Kyre rebuilds it as deployed code in five
            days. Outside judgment, shipped.
          </p>

          <div className={styles.actions}>
            <button type="button" {...calAttrs} className={styles.primary}>
              Get a free teardown
            </button>
            <a href="#teardowns" className={styles.secondary}>
              See the work
            </a>
          </div>
        </div>

        <div className={styles.stage}>
          <RebuildScene />
        </div>
      </div>

      <CalLoader />
    </section>
  );
}
