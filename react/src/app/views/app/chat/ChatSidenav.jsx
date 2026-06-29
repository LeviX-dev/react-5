import { useState } from "react";
import Scrollbar from "react-perfect-scrollbar";
import { format } from "date-fns";

export default function ChatSidenav({
  contactList = [],
  recentContactList = [],
  open,
  toggleSidenav,
  handleContactClick
}) {
  const [query, setQuery] = useState("");

  return (
    <div className="chat-sidebar-wrap sidebar" style={{ left: !open ? "-260px" : 0 }}>
      <div className="border-right">
        <div className="px-3 py-2 gap-3 d-flex align-items-center o-hidden box-shadow-1 chat-topbar">
          <span className="link-icon d-md-none" onClick={toggleSidenav}>
            <i className="icon-regular ms-0 i-Left" />
          </span>

          <div className="form-group m-0 flex-grow-1">
            <input
              type="text"
              id="search"
              placeholder="Search contacts"
              className="form-control form-control-rounded"
              onChange={(event) => setQuery(event.target.value)}
              value={query}
            />
          </div>
        </div>

        <Scrollbar className="contacts-scrollable">
          <div className="mt-4 pb-2 ps-3 pe-3 font-weight-bold text-muted border-bottom">
            Recent
          </div>

          {recentContactList
            .filter((user) => user.name.toLocaleLowerCase().match(query.toLocaleLowerCase()))
            .map((user) => (
              <div
                key={user.id}
                onClick={() => handleContactClick(user.id)}
                className={`p-3 d-flex gap-3 align-items-center border-bottom contact ${user.status}`}>
                <img src={user.avatar} className="avatar-sm rounded-circle" alt="User" />

                <div>
                  <h6 className="m-0">{user.name}</h6>
                  <span className="text-muted text-small">
                    {format(new Date(user.lastChatTime).getTime(), "dd MMM, yyyy")}
                  </span>
                </div>
              </div>
            ))}

          <div className="mt-3 pb-2 ps-3 pe-3 font-weight-bold text-muted border-bottom">
            Contacts
          </div>

          {contactList
            .filter((user) => user.name.toLocaleLowerCase().match(query.toLocaleLowerCase()))
            .map((user) => (
              <div
                key={user.id}
                onClick={() => handleContactClick(user.id)}
                className="p-3 gap-3 d-flex border-bottom align-items-center contact online">
                <img src={user.avatar} className="avatar-sm rounded-circle" alt="User" />
                <h6 className="">{user.name}</h6>
              </div>
            ))}
        </Scrollbar>
      </div>
    </div>
  );
}
