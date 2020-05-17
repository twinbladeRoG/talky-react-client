import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Broadcast from './pages/Broadcast';
import Login from './pages/Login';

const Router = () => (
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <Switch>
      <Route exact path="/" component={Login} />
      <Route path="/room" component={Broadcast} />
    </Switch>
  </BrowserRouter>
);

export default Router;
