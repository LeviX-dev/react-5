import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";

import {
  getAllContact,
  sendNewMessage,
  getContactById,
  getRecentContact,
  getChatRoomByContactId
} from "./chatService";
import ChatSidenav from "./ChatSidenav";
import ChatContainer from "./ChatContainer";

import { isMobile } from "@utils";

export default function AppChat() {
  const [state, setState] = useState({
    currentUser: { id: "7863a6802ez0e277a0f98534" },
    contactList: [],
    recentContactList: [],
    messageList: [],
    currentChatRoom: "",
    opponentUser: null,
    open: true,
    isMobile: false
  });

  const updateRecentContactList = async () => {
    try {
      const { id } = state.currentUser;
      const { data } = await getRecentContact(id);
      setState((prevState) => ({ ...prevState, recentContactList: [...data] }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleContactClick = async (contactId) => {
    try {
      if (isMobile()) toggleSidenav();

      const { data } = await getContactById(contactId);
      setState((prevState) => ({ ...prevState, opponentUser: { ...data } }));

      const { data: chatRoomData } = await getChatRoomByContactId(state.currentUser.id, contactId);
      const { chatId, messageList, recentListUpdated } = chatRoomData;
      setState((prevState) => ({ ...prevState, currentChatRoom: chatId, messageList }));

      if (recentListUpdated) updateRecentContactList();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let { id } = state.currentUser;

    getContactById(id).then((data) => {
      setState((prevState) => ({ ...prevState, currentUser: { ...data.data } }));
    });

    getAllContact(state.currentUser.id).then((data) => {
      setState((prevState) => ({ ...prevState, contactList: [...data.data] }));
    });

    updateRecentContactList();

    if (isMobile()) {
      setState((prevState) => ({ ...prevState, open: false, isMobile: true }));
    }

    if (window) {
      const listener = (e) => {
        if (isMobile()) setState((prevState) => ({ ...prevState, open: false, isMobile: true }));
        else setState((prevState) => ({ ...prevState, open: true, isMobile: false }));
      };

      window.addEventListener("resize", listener);
      return () => window.removeEventListener("resize", listener);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMessageSend = async (message) => {
    const { currentUser, opponentUser, currentChatRoom } = state;
    const { id } = currentUser;

    if (!currentChatRoom) return;

    try {
      const { data } = await sendNewMessage({
        text: message,
        contactId: id,
        time: new Date(),
        chatId: currentChatRoom
      });

      setState({ ...state, messageList: [...data] });

      // AUTO REPLY GENERATOR
      const autoReply = async () => {
        const { data } = await sendNewMessage({
          time: new Date(),
          chatId: currentChatRoom,
          contactId: opponentUser.id,
          text: `Hi, I'm ${opponentUser.name}. Your imaginary friend.`
        });

        setState({ ...state, messageList: [...data] });
      };

      setTimeout(autoReply, 1000);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleSidenav = () => {
    setState((prevState) => ({ ...prevState, open: !prevState.open }));
  };

  let {
    open,
    currentUser,
    contactList,
    recentContactList,
    messageList,
    opponentUser,
    currentChatRoom
  } = state;

  return (
    <Card className="chat-sidebar-container sidebar-container">
      <ChatSidenav
        open={open}
        isMobile={state.isMobile}
        contactList={contactList}
        recentContactList={recentContactList}
        toggleSidenav={toggleSidenav}
        handleContactClick={handleContactClick}
      />

      <ChatContainer
        open={open}
        isMobile={state.isMobile}
        messageList={messageList}
        currentUser={currentUser}
        opponentUser={opponentUser}
        currentChatRoom={currentChatRoom}
        toggleSidenav={toggleSidenav}
        handleMessageSend={handleMessageSend}
      />
    </Card>
  );
}
