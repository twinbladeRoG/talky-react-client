import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import classnames from 'classnames';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import { useHistory } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhoneSlash } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import UserCard from '../components/UserCard';
import NavBar from '../components/Navbar';
import { socketConnected, logout } from '../redux/actions/userActions';

const videoConstraints = {
  fullhd: { width: { exact: 1920 }, height: { exact: 1080 } },
  hd: { width: { exact: 1280 }, height: { exact: 720 } },
  vga: { width: { exact: 640 }, height: { exact: 480 } },
  qvga: { width: { exact: 320 }, height: { exact: 240 } }
};

const ServerConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
    {
      url: 'turn:numb.viagenie.ca',
      username: process.env.REACT_APP_TURN_SERVER_USERNAME,
      credential: process.env.REACT_APP_TURN_SERVER_CREDENTIAL
    }
  ]
};

const CallStates = {
  RECEIVER_SIGNALED: 'RECEIVER_SIGNALED'
};

const Broadcast = ({ user, room, onSocketConnected, logOut }) => {
  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);
  const [users, setUsers] = useState([]);
  const [callState, setCallState] = useState(null);

  const history = useHistory();
  const player = useRef(null);
  const peerPlayer = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    if (!user.name) {
      return history.push('/');
    }

    (async () => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: videoConstraints.hd
      });

      setStream(mediaStream);
    })();

    socket.current = io(process.env.REACT_APP_SOCKET_URL, {
      query: {
        name: user.name,
        room: room.name
      }
    });

    socket.current.on('join-room', (res) => toast.info(res));

    socket.current.on('connected', ({ id, socketId: sid }) => {
      onSocketConnected(id, sid);
    });

    socket.current.on('users', (res) => setUsers(res));

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (peer) {
        peer.destroy();
      }
      if (socket.current) {
        socket.current.disconnect();
      }
      logOut();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (stream && player.current) {
      player.current.srcObject = stream;
    }
  }, [stream, player]);

  useEffect(() => {
    console.log('Users:', users.length);
    if (users.length > 1 && peer === null && stream !== null) {
      const isInitiator = users[0].id === user.id;
      console.log('Creating Peer:', isInitiator);
      setPeer(
        new Peer({
          initiator: isInitiator,
          trickle: false,
          stream,
          config: ServerConfig
        })
      );
    }
  }, [users, stream]);

  useEffect(() => {
    if (peer !== null) {
      if (peer.initiator) {
        peer.on('signal', (signal) => {
          console.log('Generated Signal');
          socket.current.emit('send-signal', {
            signal,
            from: {
              id: user.id,
              name: user.name,
              socketId: user.socketId
            }
          });
        });
      }
      if (!peer.initiator) {
        peer.on('signal', (signal) => {
          console.log('Generated Signal in Receiver');
          if (Object.prototype.hasOwnProperty.call(signal, 'sdp', 'type')) {
            console.log(signal);
            socket.current.emit('send-signal', {
              signal,
              from: {
                id: user.id,
                name: user.name,
                socketId: user.socketId
              }
            });
          }
        });
      }

      peer.on('stream', (s) => {
        if (peerPlayer.current) peerPlayer.current.srcObject = s;
      });
    }
  }, [peer]);

  useEffect(() => {
    if (peer !== null) {
      if (!peer.initiator) {
        users.forEach((usr) => {
          if (user.id !== usr.id && !!usr.signal && callState === null) {
            console.log(`User: ${usr.name}, Has signal: ${!!usr.signal}`);
            setCallState(CallStates.RECEIVER_SIGNALED);
            peer.signal(usr.signal);
          }
        });
      }
      if (peer.initiator) {
        users.forEach((usr) => {
          if (user.id !== usr.id && !!usr.signal && callState === null) {
            console.log(`User: ${usr.name}, Has signal: ${!!usr.signal}`);
            peer.signal(usr.signal);
          }
        });
      }
    }
  }, [peer, users]);

  const onVideoQualityChange = async (e) => {
    const s = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: videoConstraints[e.target.value]
    });

    setStream(s);
    if (player.current) {
      player.current.srcObject = stream;
    }
  };

  const onCallDisconnect = () => {
    history.push('/');
  };

  return (
    <>
      <NavBar />
      <Container className="my-5">
        <Row>
          <Col sm={12} className="text-right">
            <Form.Group className="d-flex justify-content-end">
              <Form.Control
                as="select"
                custom
                className="select-quality"
                onChange={onVideoQualityChange}
              >
                <option value="hd">HD</option>
                <option value="vga">VGA</option>
                <option value="qvga">QVGA</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col sm={12} md={6} lg={4}>
            <UserCard name={user.name} />
            {users.map(({ id, name }) => {
              if (id === user.id) return null;
              return <UserCard key={id} name={name} />;
            })}
          </Col>

          <Col sm={12} md={6} lg={8}>
            <div className={classnames(users.length > 1 ? 'video-self':'video-self-idle')}>
              <video
                ref={player}
                autoPlay
                playsInline
                muted
                className="img-fluid"
              />
            </div>

            {/* PEER Video */}
            <div className={classnames('mt-3', users.length > 1 ? 'video-peer' : 'video-self-idle')}>
              <video
                ref={peerPlayer}
                autoPlay
                playsInline
                className="img-fluid w-100"
              />
            </div>
          </Col>

        </Row>

        {
          users.length > 1 && (
            <Button variant="danger" className="btn-call-end" onClick={onCallDisconnect}>
              <FontAwesomeIcon icon={faPhoneSlash} />
            </Button>
          )
        }
      </Container>
    </>
  );
};

Broadcast.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    socketId: PropTypes.string
  }).isRequired,
  room: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    socketId: PropTypes.string
  }).isRequired,
  onSocketConnected: PropTypes.func.isRequired,
  logOut: PropTypes.func.isRequired
};

const mapStateToProps = ({ user, room }) => ({
  user,
  room
});

const mapDispatchToProps = (dispatch) => ({
  onSocketConnected: (id, socketId) => dispatch(socketConnected(id, socketId)),
  logOut: () => dispatch(logout())
});

export default connect(mapStateToProps, mapDispatchToProps)(Broadcast);
