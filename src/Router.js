import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Broadcast from "./pages/Broadcast";
import Receiver from "./pages/Receiver";
import Login from "./pages/Login";

const Router = () => (
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <Switch>
      <Route exact path="/" component={Login} />
      <Route path="/broadcast" component={Broadcast} />
      <Route path="/receiver" component={Receiver} />
    </Switch>
  </BrowserRouter>
);

export default Router;
