"use client";

const STEPS = [
  { step: 1, label: "Proposta gerada", sublabel: "Aguardando assinatura" },
  {
    step: 2,
    label: "Cliente assina",
    sublabel: "Assinatura digital do cliente",
  },
  { step: 3, label: "Empresa assina", sublabel: "Contrassinatura interna" },
  { step: 4, label: "Contrato ativo", sublabel: "Validade jurídica" },
] as const;

interface SignatureProgressStepsProps {
  pipelineStatus: string | null;
  signingStatus: "pending" | "signed" | null;
  signingUrl?: string | null;
}

/**
 * Exibe as 4 etapas do fluxo de assinatura (backlog Módulo 02).
 * Estado 1 = Proposta gerada (proposta + pending), 2–3 = em assinatura, 4 = Contrato ativo.
 */
export function SignatureProgressSteps({
  pipelineStatus,
  signingStatus,
  signingUrl,
}: SignatureProgressStepsProps) {
  const isPropostaPending =
    pipelineStatus === "proposta" && signingStatus === "pending";
  const isAtivo = pipelineStatus === "ativo" && signingStatus === "signed";
  const currentStep = isAtivo ? 4 : isPropostaPending ? 2 : 0;

  if (
    currentStep === 0 &&
    pipelineStatus !== "proposta" &&
    pipelineStatus !== "ativo"
  ) {
    return null;
  }

  return (
    <div className="mb-6 rounded-xl border border-5r-dark-border bg-5r-dark-surface p-6">
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-400">
        Fluxo de assinatura
      </h3>
      <div className="flex flex-wrap items-start gap-2 sm:gap-4">
        {STEPS.map(({ step, label, sublabel }) => {
          const done = currentStep > step || (currentStep === 4 && step <= 4);
          const current = currentStep === step;
          return (
            <div
              key={step}
              className="flex flex-shrink-0 items-center gap-2 sm:gap-3"
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                  done
                    ? "border-5r-orange bg-5r-orange text-white"
                    : current
                      ? "border-5r-orange bg-5r-orange/20 text-5r-orange"
                      : "border-5r-dark-border bg-5r-dark text-zinc-500"
                }`}
              >
                {done ? "✓" : step}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${
                    done || current ? "text-white" : "text-zinc-500"
                  }`}
                >
                  {label}
                </p>
                <p className="text-xs text-zinc-500">{sublabel}</p>
              </div>
              {step < 4 && (
                <div
                  className={`hidden h-0.5 w-4 flex-shrink-0 sm:block ${
                    done ? "bg-5r-orange" : "bg-5r-dark-border"
                  }`}
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
      {signingUrl && isPropostaPending && (
        <p className="mt-4">
          <a
            href={signingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-5r-orange hover:underline"
          >
            Abrir link de assinatura →
          </a>
        </p>
      )}
    </div>
  );
}
