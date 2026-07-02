/**
 * Nadpis sekce v panelu vlastností — malý, kapitálkami, utlumená barva.
 */
import type { ReactNode } from 'react';

export interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function Section({ title, children, className = '' }: SectionProps) {
  return (
    <section className={`space-y-1.5 ${className}`}>
      <h3 className="text-[10px] font-bold uppercase tracking-widest [color:var(--text-muted)]">
        {title}
      </h3>
      {children}
    </section>
  );
}
