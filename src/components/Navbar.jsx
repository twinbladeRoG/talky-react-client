import PropTypes from 'prop-types';
import React from 'react';
import { Navbar } from 'react-bootstrap';
import { connect } from 'react-redux';

const NavBar = ({ roomName }) => (
  <Navbar bg="dark" expand="lg">
    <Navbar.Brand className="text-light">Talky</Navbar.Brand>
    <Navbar.Text className="text-light">{roomName}</Navbar.Text>
  </Navbar>
);

NavBar.propTypes = {
  roomName: PropTypes.string.isRequired
};

const mapStateToProps = ({ room }) => ({
  roomName: room.name
});

export default connect(mapStateToProps, null)(NavBar);
