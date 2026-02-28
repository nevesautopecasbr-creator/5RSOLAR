"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  getDocumentFolderTree,
  CATEGORY_ICONS,
  type FolderItem,
} from "@/app/(dashboard)/dashboard/documents/[projectId]/document-categories";
import {
  listProjectDocuments,
  uploadProjectDocument,
  type DocumentCategoryType,
  type DocumentRow,
} from "@/app/(dashboard)/dashboard/documents/actions";

const ACCEPT = {
  "application/pdf": [".pdf"],
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp"]);

function getExtension(doc: DocumentRow): string | null {
  if (doc.storagePath) {
    const m = doc.storagePath.match(/\.([a-z0-9]+)$/i);
    return m ? m[1].toLowerCase() : null;
  }
  if (doc.url) {
    try {
      const path = new URL(doc.url).pathname;
      const m = path.match(/\.([a-z0-9]+)$/i);
      return m ? m[1].toLowerCase() : null;
    } catch {
      return null;
    }
  }
  return null;
}

function isInlineViewable(doc: DocumentRow): boolean {
  const ext = getExtension(doc);
  return ext === "pdf" || (ext !== null && IMAGE_EXT.has(ext));
}

interface DocumentManagerProps {
  projectId: string;
  projectName: string;
  initialDocuments: DocumentRow[];
}

export function DocumentManager({
  projectId,
  projectName,
  initialDocuments,
}: DocumentManagerProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<DocumentCategoryType | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>(initialDocuments);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    url: string;
    type: "pdf" | "image";
  } | null>(null);

  const refreshDocuments = useCallback(
    async (category?: DocumentCategoryType) => {
      setLoading(true);
      setError(null);
      const { data, error: err } = await listProjectDocuments(
        projectId,
        category ?? undefined,
      );
      setLoading(false);
      if (err) setError(err);
      else setDocuments(data);
    },
    [projectId],
  );

  const onSelectFolder = (item: FolderItem) => {
    if (item.category) {
      setSelectedCategory(item.category);
      refreshDocuments(item.category);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!selectedCategory) {
        setError("Selecione uma pasta na barra lateral para fazer o upload.");
        return;
      }
      setUploading(true);
      setError(null);
      for (const file of acceptedFiles) {
        const result = await uploadProjectDocument({
          projectId,
          file,
          name: file.name.replace(/\.[^.]+$/, ""),
          category: selectedCategory,
        });
        if (result.error) {
          setError(result.error);
          break;
        }
      }
      setUploading(false);
      if (selectedCategory) refreshDocuments(selectedCategory);
    },
    [projectId, selectedCategory, refreshDocuments],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: true,
    disabled: !selectedCategory || uploading,
  });

  const tree = getDocumentFolderTree();

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[500px] rounded-xl border border-5r-dark-border bg-5r-dark-surface">
      {/* Sidebar: Cliente > Projeto/Obra | Crédito Solar */}
      <aside className="w-64 shrink-0 border-r border-5r-dark-border bg-5r-dark p-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-5r-orange">
          Cliente
        </p>
        <p className="truncate text-sm font-medium text-white">
          {projectName || "Projeto"}
        </p>
        <nav className="mt-4 space-y-1">
          {tree.map((section) => (
            <div key={section.id} className="mb-3">
              <p className="mb-1.5 text-xs font-medium text-zinc-500">
                {section.label}
              </p>
              {section.children?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectFolder(item)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                    selectedCategory === item.category
                      ? "bg-5r-orange/20 text-5r-orange"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.category && (
                    <span className="text-base" aria-hidden>
                      {CATEGORY_ICONS[item.category]}
                    </span>
                  )}
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main: dropzone + list */}
      <main className="flex flex-1 flex-col overflow-hidden p-6">
        {selectedCategory ? (
          <>
            <p className="mb-4 text-sm text-zinc-400">
              Pasta atual:{" "}
              <span className="font-medium text-white">{selectedCategory}</span>{" "}
              — os arquivos enviados serão salvos com esta categoria.
            </p>

            <div
              {...getRootProps()}
              className={`mb-6 flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition ${
                isDragActive
                  ? "border-5r-orange bg-5r-orange/10"
                  : "border-5r-dark-border bg-5r-dark hover:border-zinc-500"
              } ${uploading ? "pointer-events-none opacity-60" : ""}`}
            >
              <input {...getInputProps()} />
              <span className="text-4xl text-5r-orange">📁</span>
              <p className="mt-2 text-center text-sm text-zinc-300">
                {isDragActive
                  ? "Solte os arquivos aqui..."
                  : "Arraste arquivos ou clique para selecionar"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">PDF, imagens, .docx</p>
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="flex-1 overflow-auto">
              <h3 className="mb-1 text-sm font-medium text-zinc-400">
                Documentos nesta pasta
              </h3>
              <p className="mb-2 text-xs text-zinc-500">
                O sistema mantém histórico de versões: ao enviar um arquivo com
                o mesmo nome, uma nova versão é criada.
              </p>
              {loading ? (
                <p className="text-sm text-zinc-500">Carregando...</p>
              ) : documents.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Nenhum documento nesta categoria.
                </p>
              ) : (
                <ul className="space-y-2">
                  {documents.map((doc) => {
                    const viewable = doc.url && isInlineViewable(doc);
                    const ext = getExtension(doc);
                    const previewType = ext === "pdf" ? "pdf" : "image";
                    return (
                      <li
                        key={doc.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-5r-dark-border bg-5r-dark px-4 py-3"
                      >
                        <span
                          className="shrink-0 text-xl text-5r-orange"
                          aria-hidden
                        >
                          {CATEGORY_ICONS[doc.category]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-white">
                            {doc.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            v{doc.version}
                            {doc.createdAt &&
                              ` · ${new Date(doc.createdAt).toLocaleDateString("pt-BR")}`}
                          </p>
                        </div>
                        {doc.url && (
                          <div className="flex shrink-0 gap-2">
                            {viewable && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreview({
                                    url: doc.url!,
                                    type: previewType,
                                  })
                                }
                                className="rounded border border-5r-dark-border bg-5r-dark-surface px-3 py-1.5 text-sm font-medium text-white hover:border-5r-orange/50 hover:bg-5r-orange/10"
                              >
                                Visualizar
                              </button>
                            )}
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded bg-5r-orange px-3 py-1.5 text-sm font-medium text-white hover:bg-5r-orange-hover"
                            >
                              Abrir
                            </a>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="text-5xl text-zinc-600">📂</span>
            <p className="mt-4 text-zinc-400">
              Selecione uma pasta na barra lateral para ver e enviar documentos.
            </p>
          </div>
        )}
      </main>

      {/* Modal: visualização inline de PDF e imagens (sem forçar download) */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label="Visualizar documento"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-5r-dark-border bg-5r-dark px-4 py-2">
            <p className="text-sm text-zinc-400">Visualização inline</p>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="rounded bg-5r-dark-surface px-3 py-1.5 text-sm font-medium text-white hover:bg-5r-orange"
            >
              Fechar
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {preview.type === "pdf" ? (
              <iframe
                src={preview.url}
                title="Documento PDF"
                className="h-full min-h-[80vh] w-full rounded border-0 bg-white"
              />
            ) : (
              <img
                src={preview.url}
                alt="Documento"
                className="mx-auto max-h-full max-w-full object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
