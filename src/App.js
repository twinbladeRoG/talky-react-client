import React, { useState } from "react";
// eslint-disable-next-line
import adapter from "webrtc-adapter";
import Router from "./Router";
import "./index.scss";
import UserContext from "./contexts/UserContext";

// console.log(adapter.browserDetails.browser);
// console.log(adapter.browserDetails.version);

const App = () => {
  const [user, setUser] = useState({
    name: "",
    id: "",
    type: "",
    socketID: null
  });

  const setUserID = id => {
    setUser(state => ({ ...state, id }));
  };
  const setUserName = name => {
    setUser(state => ({ ...state, name }));
  };
  const setUserType = type => {
    setUser(state => ({ ...state, type }));
  };
  const setSocketID = socketID => {
    setUser(state => ({ ...state, socketID }));
  };

  return (
    <UserContext.Provider
      value={{
        id: user.id,
        name: user.name,
        type: user.type,
        socketID: user.socketID,
        setUserID: setUserID,
        setUserName: setUserName,
        setUserType: setUserType,
        setSocketID: setSocketID
      }}
    >
      <Router />
    </UserContext.Provider>
  );
};

export default App;
