import { lazy, Suspense } from "react";
import type { ReactNode } from "react";

const InteractiveWorld3D = lazy(() => import("./InteractiveWorld3D"));

type Props = {
  kind: string;
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
};

export default function RealmBanner({ kind, eyebrow, title, subtitle, children }: Props) {
  return (
    <section className={`realm-banner realm-${kind}`}>
      <div className="realm-banner-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {children && <div className="realm-banner-side">{children}</div>}
      <Suspense fallback={null}>
        <InteractiveWorld3D kind={kind} className="realm-banner-world" />
      </Suspense>
    </section>
  );
}
