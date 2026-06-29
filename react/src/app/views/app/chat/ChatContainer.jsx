import { useState } from "react";
import Button from "react-bootstrap/Button";
import Scrollbar from "react-perfect-scrollbar";

import EmptyMessage from "./EmptyMessage";

import { getTimeDifference } from "@utils";

export default function ChatContainer({
  currentUser = {},
  toggleSidenav,
  opponentUser = {},
  messageList = [],
  handleMessageSend,
  isMobile
}) {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) handleMessageSend(trimmedMessage);
    setMessage("");
  };

  const sendMessageOnEnter = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      sendMessage();
    }
  };

  return (
    <div
      className="chat-content-wrap sidebar-content"
      style={{ marginLeft: isMobile ? 0 : "260px" }}>
      <div className="d-flex gap-3 px-3 py-2 o-hidden box-shadow-1 chat-topbar">
        <span className="link-icon d-md-none" onClick={toggleSidenav}>
          <i className="icon-regular i-Right ms-0" />
        </span>

        {opponentUser && (
          <div className="d-flex align-items-center gap-2">
            <img src={opponentUser.avatar} alt="" className="avatar-sm rounded-circle" />
            <p className="m-0 text-title text-16 flex-grow-1">{opponentUser.name}</p>
          </div>
        )}
      </div>

      {opponentUser ? (
        <>
          <Scrollbar className="chat-content">
            {messageList.map((item, ind) =>
              item.contactId === opponentUser.id ? (
                <div key={ind} className="d-flex gap-3 mb-4">
                  <div className="message flex-grow-1">
                    <div className="d-flex">
                      <p className="mb-1 text-title text-16 flex-grow-1">{item.name}</p>
                      <span className="text-small text-muted">
                        {getTimeDifference(new Date(item.time))} ago
                      </span>
                    </div>

                    <p className="m-0 white-space-pre-line">{item.text}</p>
                  </div>

                  <img src={item.avatar} alt="" className="avatar-sm rounded-circle" />
                </div>
              ) : (
                <div key={ind} className="d-flex gap-3 mb-4 user">
                  <img src={item.avatar} alt="" className="avatar-sm rounded-circle" />

                  <div className="message flex-grow-1">
                    <div className="d-flex">
                      <p className="mb-1 text-title text-16 flex-grow-1">{item.name}</p>

                      <span className="text-small text-muted">
                        {getTimeDifference(new Date(item.time))} ago
                      </span>
                    </div>

                    <p className="m-0 white-space-pre-line">{item.text}</p>
                  </div>
                </div>
              )
            )}
          </Scrollbar>

          <div className="ps-3 pe-3 pt-3 pb-3 box-shadow-1 chat-input-area">
            <form className="inputForm">
              <div className="form-group">
                <textarea
                  className="form-control"
                  placeholder="Type your message"
                  name="message"
                  id="message"
                  cols="30"
                  rows="3"
                  value={message}
                  onKeyUp={sendMessageOnEnter}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="d-flex">
                <div className="flex-grow-1" />

                <Button
                  variant="primary"
                  className="btn btn-icon btn-rounded me-2"
                  onClick={sendMessage}>
                  <i className="i-Paper-Plane" />
                </Button>

                <label htmlFor="attachment" className="mb-0">
                  <Button type="button" className="me-2" as="span" variant="outline-primary">
                    <i className="i-Add-File" />
                  </Button>
                </label>

                <input
                  onChange={(event) => console.log(event.target.files[0])}
                  className="d-none"
                  id="attachment"
                  type="file"
                />
              </div>
            </form>
          </div>
        </>
      ) : (
        <EmptyMessage />
      )}
    </div>
  );
}
