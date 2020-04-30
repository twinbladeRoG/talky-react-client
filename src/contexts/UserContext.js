import { createContext } from "react";

const UserContext = createContext({
  name: "",
  id: null,
  type: "",
  setUserName: null,
  setUserID: null,
  setUserType: null
});

export default UserContext;
