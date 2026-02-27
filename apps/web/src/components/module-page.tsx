import { ReactNode } from "react";

type ModulePageProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function ModulePage({ title, description, children }: ModulePageProps) {
  return (
    <div className="stack">
      <div className="card">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
