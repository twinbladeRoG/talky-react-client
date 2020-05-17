import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Form,
  InputGroup,
  FormControl,
  Button,
  Row,
  Col,
  Card
} from 'react-bootstrap';
import { useHistory } from 'react-router';
import validator from 'validator';
import { WEBRTC_SUPPORT } from 'simple-peer';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVihara, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import NavBar from '../components/Navbar';
import { login } from '../redux/actions/userActions';
import { createRoom } from '../redux/actions/roomActions';

const Login = ({ onLogin, onCreateRoom }) => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [error, setError] = useState(false);

  const onChangeName = (event) => setName(event.target.value);
  const onChangeRoom = (event) => setRoom(event.target.value);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!name.length) {
      setError('Username is required');
    } else if (!validator.isAlpha(name)) {
      setError('Username should contain only alphabets');
    } else if (!room.length) {
      setError('Room name is required');
    } else if (!validator.isAlpha(room)) {
      setError('Room name should contain only alphabets');
    } else {
      setError(false);
      onLogin(name);
      onCreateRoom(room);
      toast(`Welcome ${name}`);
      history.push('/room');
    }
  };

  useEffect(() => {
    if (WEBRTC_SUPPORT) {
      toast.success('WebRTC Supported');
    } else {
      toast.error('WebRTC Not Supported');
    }
  }, []);

  return (
    <>
      <NavBar />
      <Container fluid className="my-5">
        <Row>
          <Col sm={12} md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
            <Card body>
              <Form onSubmit={onSubmit}>
                <InputGroup className="">
                  <InputGroup.Prepend>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faVihara} size="1x" />
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl
                    placeholder="Room"
                    value={room}
                    onChange={onChangeRoom}
                  />
                </InputGroup>
                <InputGroup className="mt-2">
                  <InputGroup.Prepend>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faUserCircle} size="1x" />
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl
                    placeholder="Username"
                    value={name}
                    onChange={onChangeName}
                  />
                </InputGroup>

                <Form.Text className="text-danger font-weight-bold">
                  {error}
                </Form.Text>

                <Button block variant="primary" type="submit" className="mt-3">
                  Login
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onCreateRoom: PropTypes.func.isRequired
};

const mapDispatchToProps = (dispatch) => ({
  onLogin: (name) => dispatch(login(name)),
  onCreateRoom: (name) => dispatch(createRoom(name))
});

export default connect(null, mapDispatchToProps)(Login);
