import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import merge from "lodash/merge";

import { isMobile } from "@utils";

import { setLayoutSettings } from "app/redux/layout/layoutSlice";

export default function useSidebar(navigations = []) {
  const location = useLocation();
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.layout);

  const { open, secondaryNavOpen } = settings.layout1Settings.leftSidebar || {};

  const [state, setState] = useState({
    navOpen: true,
    selectedItem: null,
    secondaryNavOpen: false
  });

  const setSelected = (selectedItem) => {
    setState({ selectedItem });
  };

  const findSelectedItem = useCallback(() => {
    function findItem(navigations, pathname) {
      for (const item of navigations) {
        if (item.path === pathname) return item;

        if (item.sub) {
          const selectedSubItem = findItem(item.sub, pathname);
          if (selectedSubItem) return item;
        }
      }

      return null;
    }

    const selectedItem = findItem(navigations, location.pathname);
    if (selectedItem) setSelected(selectedItem);
  }, [location.pathname, navigations]);

  const openSecSidenav = () => {
    const merged = merge({}, settings, {
      layout1Settings: {
        leftSidebar: { secondaryNavOpen: true }
      }
    });

    dispatch(setLayoutSettings(merged));
  };

  const closeSecSidenav = useCallback(() => {
    const other = {};

    if (isMobile()) {
      other.open = false;
    }

    const merged = merge({}, settings, {
      layout1Settings: {
        leftSidebar: { ...other, secondaryNavOpen: false }
      }
    });

    dispatch(setLayoutSettings(merged));
  }, [dispatch, settings]);

  const closeSidenav = useCallback(() => {
    const merged = merge({}, settings, {
      layout1Settings: {
        leftSidebar: { open: false, secondaryNavOpen: false }
      }
    });

    dispatch(setLayoutSettings(merged));
  }, [dispatch, settings]);

  const openSidenav = useCallback(() => {
    const merged = merge({}, settings, {
      layout1Settings: { leftSidebar: { open: true } }
    });

    dispatch(setLayoutSettings(merged));
  }, [dispatch, settings]);

  const onMainItemMouseEnter = (item) => {
    if (item.type === "dropDown") {
      setSelected(item);
      openSecSidenav();
    } else {
      setSelected(item);
      closeSecSidenav();
    }
  };

  useEffect(() => {
    findSelectedItem();
  }, [findSelectedItem]);

  useEffect(() => {
    const listener = () => {
      if (window.innerWidth < 1200) closeSidenav();
      else openSidenav();
    };

    window.addEventListener("resize", listener);

    return () => window.removeEventListener("resize", listener);
  }, [closeSidenav, openSidenav]);

  return {
    open,
    state,
    secondaryNavOpen,
    closeSecSidenav,
    onMainItemMouseEnter
  };
}
