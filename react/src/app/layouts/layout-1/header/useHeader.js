import { useDispatch, useSelector } from "react-redux";
import merge from "lodash/merge";

import { setLayoutSettings } from "app/redux/layout/layoutSlice";

export default function useHeader() {
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.layout);

  const { leftSidebar } = settings.layout1Settings;

  const handleMenuClick = () => {
    const merged = merge({}, settings, {
      layout1Settings: {
        leftSidebar: {
          secondaryNavOpen: false,
          open: leftSidebar.secondaryNavOpen || !leftSidebar.open
        }
      }
    });

    dispatch(setLayoutSettings(merged));
  };

  //   FULLSCREEN VIEW TOGGLER
  const toggleFullScreen = () => {
    if (document.fullscreenEnabled) {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  };

  // SEARCH BOX TOGGLER
  const handleSearchBoxOpen = () => {
    const merged = merge({}, settings, {
      layout1Settings: { searchBox: { open: true } }
    });

    dispatch(setLayoutSettings(merged));
  };

  return { handleMenuClick, toggleFullScreen, handleSearchBoxOpen };
}
