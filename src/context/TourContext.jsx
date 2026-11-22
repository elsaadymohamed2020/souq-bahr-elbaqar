import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useApp } from './AppContext';
import { TOUR_STEPS } from '../tour/steps';

const TourContext = createContext(null);
const SEEN_KEY = 'bb_tour_seen';

export function TourProvider({ children }) {
  const app = useApp();
  const appRef = useRef(app);
  appRef.current = app;

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [lastAddedCode, setLastAddedCode] = useState(null);
  const [dock, setDock] = useState('bottom'); // where the phone tour card sits, so toasts can avoid it
  const tourRef = useRef({ lastAddedCode: null });
  tourRef.current = { lastAddedCode };

  const steps = TOUR_STEPS;
  const step = active ? steps[index] : null;

  const closeOverlays = () => {
    const a = appRef.current;
    a.closeQuickView();
    a.setIsCartOpen(false);
    a.setIsCheckoutOpen(false);
    a.setIsSearchOpen(false);
    a.setIsCategorySheetOpen(false);
    a.setSelectedDealForDetail(null);
    a.setSelectedCustomer(null);
    a.setIsAddOfferOpen(false);
    a.setIsRecordSaleOpen(false);
    a.setIsAddDealOpen?.(false);
  };

  const markSeen = () => {
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      // ignore
    }
  };

  const start = useCallback(() => {
    const a = appRef.current;
    closeOverlays();
    a.setIsAddProductOpen(false);
    a.setWaitingCustomerAlert(null);
    a.resetDemo({ silent: true });
    a.setViewMode('store');
    setLastAddedCode(null);
    setIndex(0);
    setActive(true);
    markSeen();
    window.scrollTo({ top: 0 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = useCallback(() => {
    const cur = steps[index];
    if (active && cur?.onExit) cur.onExit(appRef.current, tourRef.current);
    setActive(false);
    markSeen();
  }, [active, index, steps]);

  const goTo = useCallback(
    (nextIndex) => {
      if (nextIndex < 0 || nextIndex >= steps.length) return;
      const cur = steps[index];
      if (cur?.onExit) cur.onExit(appRef.current, tourRef.current);
      setIndex(nextIndex);
    },
    [index, steps]
  );

  const next = useCallback(() => {
    if (index >= steps.length - 1) {
      stop();
      return;
    }
    goTo(index + 1);
  }, [index, steps.length, goTo, stop]);

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Enter a step: switch view / tab, then run its setup.
  useEffect(() => {
    if (!active || !step) return undefined;
    const a = appRef.current;
    let t;
    const needsView = step.view && a.viewMode !== step.view;
    if (needsView) a.setViewMode(step.view);
    if (step.adminTab) a.setAdminTab(step.adminTab);
    if (step.onEnter) {
      t = setTimeout(() => step.onEnter(appRef.current, tourRef.current), needsView ? 350 : 60);
    }
    return () => clearTimeout(t);
  }, [active, index]); // eslint-disable-line react-hooks/exhaustive-deps

  // Waiting steps move forward when the real action happens in the app.
  useEffect(() => {
    if (!active || !step?.waitFor) return undefined;
    let timer;
    const off = app.onAppEvent((type, payload) => {
      if (type === 'product:added' && payload?.product?.code) setLastAddedCode(payload.product.code);
      if (type === step.waitFor) {
        timer = setTimeout(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), type === 'product:added' ? 900 : 500);
      }
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, [active, index]); // eslint-disable-line react-hooks/exhaustive-deps

  // ?tour=1 starts the tour automatically (handy when recording the phone video).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tour') === '1') {
      const t = setTimeout(start, 700);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [start]);

  const hasSeen = () => {
    try {
      return localStorage.getItem(SEEN_KEY) === '1';
    } catch {
      return true;
    }
  };

  return (
    <TourContext.Provider
      value={{
        active,
        index,
        step,
        steps,
        total: steps.length,
        start,
        stop,
        next,
        prev,
        goTo,
        lastAddedCode,
        tourState: tourRef.current,
        hasSeen,
        markSeen,
        dock,
        setDock,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export const useTour = () => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
};
