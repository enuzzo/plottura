import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { usePosterContext } from "@/features/poster/ui/PosterContext";
import {
  MAX_MARKER_SIZE,
  MIN_MARKER_SIZE,
} from "@/features/markers/domain/constants";
import PreviewPanel from "@/features/poster/ui/PreviewPanel";
import { useSwipeDown } from "@/shared/hooks/useSwipeDown";
import { Check, PanelLeftOpen } from "lucide-react";
import { useExport } from "@/features/export/application/useExport";
import Sidebar from "@/components/sidebar/Sidebar";
import MapCanvas from "@/components/canvas/MapCanvas";
import FloatingZoomControls from "@/components/canvas/FloatingZoomControls";

const SIDEBAR_STORAGE_KEY = "plottura:sidebar-collapsed";

function readSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

const SettingsPanel = lazy(() => import("@/features/poster/ui/SettingsPanel"));

type MobileTab =
  | "location"
  | "theme"
  | "layout"
  | "style"
  | "layers"
  | "markers";

function SettingsDrawer({
  mobileTab,
  onClose,
}: {
  mobileTab: MobileTab;
  onClose: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { sheetRef, handleRef, handleProps } = useSwipeDown(onClose, 80, {
    onExpand: () => setIsExpanded(true),
  });

  return (
    <div className="mobile-drawer" role="dialog" aria-label="Settings">
      <div
        className="mobile-drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`mobile-drawer-sheet${isExpanded ? " is-expanded" : ""}`}
        ref={sheetRef}
        data-mobile-tab={mobileTab}
      >
        <div
          className="mobile-drawer-handle"
          ref={handleRef}
          aria-hidden="true"
          {...handleProps}
        />
        <div className="mobile-drawer-content">
          <SettingsPanel mobileTab={mobileTab} />
        </div>
      </div>
    </div>
  );
}

export default function AppShell() {
  const { state, dispatch } = usePosterContext();
  const { isMarkerEditorActive } = state;
  const activeMarker =
    state.activeMarkerId !== null
      ? state.markers.find((marker) => marker.id === state.activeMarkerId) ?? null
      : null;

  const { handleDownloadPng, handleDownloadSvg, handleDownloadPdf, isExporting } = useExport();

  // Sidebar collapse state (desktop only)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed]);

  const toggleSidebar = useCallback(
    () => setSidebarCollapsed((c) => !c),
    [],
  );

  // Mobile state
  const [mobileTab, setMobileTab] = useState<MobileTab>("theme");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileLocationRowVisible, setMobileLocationRowVisible] =
    useState(true);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const preload = () => {
      void import("@/features/poster/ui/SettingsPanel");
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(preload, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = setTimeout(preload, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(
      "(max-width: 768px), (hover: none) and (pointer: coarse)",
    );
    const syncViewport = () => setIsMobileViewport(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (!mobileDrawerOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
    };
  }, [mobileDrawerOpen]);

  const handleMobileTabChange = (tab: MobileTab) => {
    if (tab === "location") {
      setMobileLocationRowVisible((isVisible) => !isVisible);
      setMobileDrawerOpen(false);
      return;
    }

    if (tab === mobileTab && mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    } else {
      setMobileTab(tab);
      setMobileDrawerOpen(true);
    }
  };

  const handleMobileMarkerSizeChange = useCallback(
    (nextSize: number) => {
      if (!activeMarker) {
        return;
      }
      const clampedSize = Math.max(
        MIN_MARKER_SIZE,
        Math.min(MAX_MARKER_SIZE, Math.round(nextSize)),
      );
      dispatch({
        type: "UPDATE_MARKER",
        markerId: activeMarker.id,
        changes: { size: clampedSize },
      });
    },
    [activeMarker, dispatch],
  );

  // Desktop layout: sidebar + canvas
  if (!isMobileViewport) {
    return (
      <div className="flex h-screen font-sans text-text-primary bg-app">
        <Sidebar
          onExportPng={handleDownloadPng}
          onExportSvg={handleDownloadSvg}
          onExportPdf={handleDownloadPdf}
          isExporting={isExporting}
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        >
          <Suspense fallback={null}>
            <SettingsPanel />
          </Suspense>
        </Sidebar>
        <MapCanvas>
          {sidebarCollapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              className="absolute top-3.5 left-3.5 z-10 p-2 rounded-lg bg-[var(--bg-card)]/90 backdrop-blur-sm border border-border text-text-muted hover:text-text-primary hover:bg-[var(--bg-card)] transition-colors shadow-sm"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
          <FloatingZoomControls />
          <PreviewPanel />
        </MapCanvas>
      </div>
    );
  }

  // Mobile layout: keep existing mobile behavior
  return (
    <div
      className="app-shell"
      data-mobile-tab={mobileTab}
    >
      {isMarkerEditorActive && activeMarker ? (
        <div
          className="mobile-marker-size-bar"
          role="group"
          aria-label="Selected marker size"
        >
          <p className="mobile-marker-size-bar__label">Marker Size</p>
          <div className="mobile-marker-size-bar__controls">
            <input
              type="range"
              className="mobile-marker-size-bar__slider map-control-slider"
              min={MIN_MARKER_SIZE}
              max={MAX_MARKER_SIZE}
              step={1}
              value={Math.round(activeMarker.size)}
              onChange={(event) =>
                handleMobileMarkerSizeChange(Number(event.target.value))
              }
            />
            <span className="mobile-marker-size-bar__value">
              {Math.round(activeMarker.size)}px
            </span>
          </div>
        </div>
      ) : null}

      <PreviewPanel />

      {mobileDrawerOpen ? (
        <SettingsDrawer
          mobileTab={mobileTab}
          onClose={() => setMobileDrawerOpen(false)}
        />
      ) : null}

      {isMarkerEditorActive ? (
        <button
          type="button"
          className="mobile-marker-edit-done"
          onClick={() => {
            dispatch({ type: "SET_MARKER_EDITOR_ACTIVE", active: false });
            dispatch({ type: "SET_ACTIVE_MARKER", markerId: null });
            setMobileDrawerOpen(false);
          }}
        >
          <Check className="w-4 h-4" />
          <span>Done Editing</span>
        </button>
      ) : null}

    </div>
  );
}
