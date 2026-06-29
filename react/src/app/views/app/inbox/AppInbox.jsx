import { useEffect, useState } from "react";
import { isMobile } from "@utils";
import InboxSidenav from "./InboxSidenav";
import InboxContent from "./InboxContent";
import { getAllMessage } from "./inboxService";

export default function AppInbox() {
  const [state, setState] = useState({
    mainSidenavOpen: true,
    secSidenavOpen: true,
    masterCheckbox: false,
    isMobile: false,
    messageList: []
  });

  const toggleSidenav = (field) => {
    setState((prevState) => ({ ...prevState, [field]: !state[field] }));
  };

  const isMobileView = () => {
    setState((prevState) => ({
      ...prevState,
      isMobile: true,
      secSidenavOpen: false,
      mainSidenavOpen: false
    }));
  };

  useEffect(() => {
    if (isMobile()) isMobileView();

    getAllMessage().then((data) => {
      setState((prevState) => ({ ...prevState, messageList: data.data }));
    });

    if (window) {
      const listener = () => {
        if (isMobile()) {
          isMobileView();
        } else {
          setState((prevState) => ({
            ...prevState,
            isMobile: false,
            secSidenavOpen: true,
            mainSidenavOpen: true
          }));
        }
      };

      window.addEventListener("resize", listener);

      return () => {
        window.removeEventListener("resize", listener);
      };
    }
  }, []);

  let { mainSidenavOpen, secSidenavOpen, messageList } = state;

  return (
    <div className="inbox-main-sidebar-container sidebar-container">
      <InboxContent
        isMobile={state.isMobile}
        messageList={messageList}
        secSidenavOpen={secSidenavOpen}
        mainSidenavOpen={mainSidenavOpen}
        toggleSidenav={toggleSidenav}
      />

      <InboxSidenav open={mainSidenavOpen} toggleSidenav={toggleSidenav} />
    </div>
  );
}
