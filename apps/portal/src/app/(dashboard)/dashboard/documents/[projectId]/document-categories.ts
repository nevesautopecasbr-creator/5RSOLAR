import type { DocumentCategoryType } from "../actions";

export interface FolderItem {
  id: string;
  label: string;
  category?: DocumentCategoryType;
  children?: FolderItem[];
}

/**
 * Hierarquia exata: Cliente > Projeto/Obra (Contrato, Proposta, ART, NF, Fotos) e Crédito Solar (Contrato de Crédito, Contas de Energia).
 */
export function getDocumentFolderTree(): FolderItem[] {
  return [
    {
      id: "projeto-obra",
      label: "Projeto/Obra",
      children: [
        { id: "Contrato", label: "Contrato", category: "Contrato" },
        { id: "Proposta", label: "Proposta", category: "Proposta" },
        { id: "ART", label: "ART/Alvará", category: "ART" },
        { id: "NF", label: "NF", category: "NF" },
        { id: "Fotos", label: "Fotos", category: "Fotos" },
      ],
    },
    {
      id: "credito-solar",
      label: "Crédito Solar",
      children: [
        {
          id: "Credito",
          label: "Contrato de Crédito",
          category: "Crédito",
        },
        {
          id: "Contas",
          label: "Contas de Energia",
          category: "Contas",
        },
      ],
    },
  ];
}
