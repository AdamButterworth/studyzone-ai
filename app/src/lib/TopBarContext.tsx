"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface BreadcrumbData {
  subjectId: string;
  subjectName: string;
  docTitle: string;
  onTitleChange: (val: string) => void;
  onDownload?: () => void;
}

interface TopBarContextType {
  breadcrumb: BreadcrumbData | null;
  setBreadcrumb: (data: BreadcrumbData | null) => void;
}

const TopBarContext = createContext<TopBarContextType>({
  breadcrumb: null,
  setBreadcrumb: () => {},
});

export function TopBarProvider({ children }: { children: ReactNode }) {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbData | null>(null);
  return (
    <TopBarContext.Provider value={{ breadcrumb, setBreadcrumb }}>
      {children}
    </TopBarContext.Provider>
  );
}

export function useTopBar() {
  return useContext(TopBarContext);
}
