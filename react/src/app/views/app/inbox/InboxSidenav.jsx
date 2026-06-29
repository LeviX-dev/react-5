import { useState } from "react";
import InboxComposeDialog from "./InboxComposeDialog";

export default function InboxSidenav({ open, toggleSidenav }) {
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);

  const closeDialog = () => setComposeDialogOpen(false);

  return (
    <div className="inbox-main-sidebar sidebar" style={{ left: open ? 0 : "-180px" }}>
      <div className="pt-3 pe-3 pb-3">
        <i
          className="sidebar-close i-Close cursor-pointer"
          onClick={() => toggleSidenav("mainSidenavOpen")}
        />

        <button
          onClick={() => setComposeDialogOpen(true)}
          className="btn btn-rounded btn-primary w-100 mb-4">
          Compose
        </button>

        <div className="ps-3">
          <p className="text-muted mb-2">Browse</p>

          <ul className="inbox-main-nav">
            <li>
              <span className="active d-flex align-items-center gap-2">
                <i className="icon-regular i-Mail-2" />
                Inbox (2)
              </span>
            </li>

            <li>
              <span className="d-flex align-items-center gap-2">
                <i className="icon-regular i-Mail-Outbox" />
                Sent
              </span>
            </li>

            <li>
              <span className="d-flex align-items-center gap-2">
                <i className="icon-regular i-Mail-Favorite" />
                Starred
              </span>
            </li>

            <li>
              <span className="d-flex align-items-center gap-2">
                <i className="icon-regular i-Folder-Trash" />
                Trash
              </span>
            </li>

            <li>
              <span className="d-flex align-items-center gap-2">
                <i className="icon-regular i-Spam-Mail" />
                Spam
              </span>
            </li>
          </ul>
        </div>
      </div>

      <InboxComposeDialog open={composeDialogOpen} handleClose={closeDialog}></InboxComposeDialog>
    </div>
  );
}
