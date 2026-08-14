"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  parseProfileDialogTab,
  type ProfileDialogTab,
} from "@/lib/profile-dialog";

const QUERY_PARAM = "open";
const DEFAULT_TAB: ProfileDialogTab = "profile";

type DialogState = {
  isOpen: boolean;
  activeTab: ProfileDialogTab;
};

function deriveState(value: string | null | undefined): DialogState {
  const parsed = parseProfileDialogTab(value ?? null);
  return {
    isOpen: parsed !== null,
    activeTab: parsed ?? DEFAULT_TAB,
  };
}

export function useProfileDialogUrlState() {
  const searchParams = useSearchParams();

  const [state, setState] = useState<DialogState>(() =>
    deriveState(searchParams?.get(QUERY_PARAM) ?? null),
  );

  useEffect(() => {
    function handlePopState() {
      const params = new URLSearchParams(window.location.search);
      setState(deriveState(params.get(QUERY_PARAM)));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const writeUrl = useCallback((tab: ProfileDialogTab | null) => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (tab === null) {
      params.delete(QUERY_PARAM);
    } else {
      params.set(QUERY_PARAM, tab);
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState(window.history.state, "", newUrl);
  }, []);

  const openTab = useCallback(
    (tab: ProfileDialogTab) => {
      setState({ isOpen: true, activeTab: tab });
      writeUrl(tab);
    },
    [writeUrl],
  );

  const closeDialog = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
    writeUrl(null);
  }, [writeUrl]);

  return useMemo(
    () => ({
      isOpen: state.isOpen,
      activeTab: state.activeTab,
      openTab,
      closeDialog,
    }),
    [state.isOpen, state.activeTab, openTab, closeDialog],
  );
}
