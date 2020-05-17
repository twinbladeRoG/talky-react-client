import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import classnames from 'classnames';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import { useHistory } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhoneAlt, faPhoneSlash } from '@fortawesome/free-solid-svg-icons';
import Draggable from 'react-draggable';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import UserCard from '../components/UserCard';
import NavBar from '../components/Navbar';
import { socketConnected } from '../redux/actions/userActions';

const videoConstraints = {
  fullhd: { width: { exact: 1920 }, height: { exact: 1080 } },
  hd: { width: { exact: 1280 }, height: { exact: 720 } },
  vga: { width: { exact: 640 }, height: { exact: 480 } },
  qvga: { width: { exact: 320 }, height: { exact: 240 } }
};

const CallStates = {
  CALLING: 'CALLING',
  CALL_ACKNOWLEDGED: 'CALL_ACKNOWLEDGED',
  CALL_ACCEPTED: 'CALL_ACCEPTED'
};

const Broadcast = ({ user, room, onSocketConnected }) => {
  const [users, setUsers] = useState([]);
  const [stream, setStream] = useState(null);
  const [userID, setUserID] = useState(null);
  const [socketID, setSocketID] = useState(null);
  const [callerSignal, setCallerSignal] = useState(null);
  const [caller, setCaller] = useState(null);
  const [callState, setCallState] = useState(null);

  const history = useHistory();
  const player = useRef(null);
  const peerPlayer = useRef(null);
  const peerUser = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    if (!user.name.length) {
      return history.push('/');
    }

    (async () => {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: videoConstraints.hd
      });

      setStream(s);
      if (player.current) {
        player.current.srcObject = s;
      }
    })();

    socket.current = io(process.env.REACT_APP_SOCKET_URL, {
      query: {
        name: user.name,
        room: room.name
      }
    });

    socket.current.on('join-room', (res) => toast.info(res));

    socket.current.on('connected', ({ id, socketID: sid }) => {
      setUserID(id);
      setSocketID(sid);
      onSocketConnected(id, sid);
    });

    socket.current.on('users', (res) => {
      console.log(res);
      setUsers(res);
    });

    socket.current.on('get-signal', (res) => {
      console.log('Received signal: ', res.from);
      setCallerSignal(res.signal);
      setCaller(res.from);
      console.log('Call State on Get-Signal: ', callState);
    });

    return () => socket.current.disconnect();

    // eslint-disable-next-line
  }, []);

  const onEnd = () => {
    stream.getTracks().forEach((track) => track.stop());
    peerUser.current.destroy();
    socket.current.disconnect();
    history.push('/');
  };

  const onCall = (callUser) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
          {
            url: 'turn:numb.viagenie.ca',
            username: process.env.REACT_APP_TURN_SERVER_USERNAME,
            credential: process.env.REACT_APP_TURN_SERVER_CREDENTIAL
          }
        ]
      }
    });

    peerUser.current = peer;
    setCallState(CallStates.CALLING);

    peer.on('signal', (data) => {
      socket.current.emit('send-signal', {
        signal: data,
        from: {
          id: userID,
          name: user.name,
          socketID
        },
        to: callUser
      });
    });

    peer.on('stream', (s) => {
      if (peerPlayer.current) peerPlayer.current.srcObject = s;
    });

    peer.on('close', () => onEnd());

    socket.current.on('call-acknowledged', (res) => {
      console.log('Call Acknowledged from: ', res.from.name, res.from.socketID);
      setCallState(CallStates.CALL_ACKNOWLEDGED);
      peer.signal(res.signal);
    });
  };

  const onAccept = (callUser) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
          {
            url: 'turn:numb.viagenie.ca',
            username: process.env.REACT_APP_TURN_SERVER_USERNAME,
            credential: process.env.REACT_APP_TURN_SERVER_CREDENTIAL
          }
        ]
      },
      stream
    });

    peerUser.current = peer;
    setCallState(CallStates.CALL_ACCEPTED);

    peer.on('signal', (data) => {
      console.log('Got PEER signal on Answer');
      socket.current.emit('acknowledge-call', {
        signal: data,
        from: {
          id: userID,
          name: user.name,
          socketID
        },
        to: callUser
      });
    });

    peer.on('stream', (s) => {
      peerPlayer.current.srcObject = s;
    });

    peer.on('close', () => onEnd());

    peer.signal(callerSignal);
  };

  const [activeDrags, setActiveDrags] = useState(0);
  const onStart = () => {
    setActiveDrags(activeDrags + 1);
  };
  const onStop = () => {
    setActiveDrags(activeDrags - 1);
  };

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
            {users.map(({ id, name, socketID: sID }) => {
              if (id === userID && sID === socketID) return null;
              return (
                <UserCard key={id} name={name}>
                  {!caller && (
                    <Button
                      size="sm"
                      disabled={callState !== null}
                      variant={callState === null ? 'primary' : 'success'}
                      onClick={() => onCall({ id, name, socketID: sID })}
                    >
                      <FontAwesomeIcon icon={faPhoneAlt} className="mr-2" />
                      {callState === null && 'Call'}
                      {callState === CallStates.CALLING && 'Calling'}
                      {callState === CallStates.CALL_ACKNOWLEDGED && 'ACCEPTED'}
                    </Button>
                  )}
                  {caller && caller.id === id && (
                    <Button
                      size="sm"
                      disabled={callState === CallStates.CALL_ACCEPTED}
                      variant="success"
                      onClick={() => onAccept({ id, name, socketID: sID })}
                    >
                      <FontAwesomeIcon icon={faPhoneAlt} className="mr-2" />
                      {callState === CallStates.CALL_ACCEPTED
                        ? 'ACCEPTED'
                        : 'ANSWER'}
                    </Button>
                  )}
                </UserCard>
              );
            })}
          </Col>
          <Col sm={12} md={6} lg={8}>
            <Draggable
              onStart={onStart}
              onStop={onStop}
              disabled={callState === null || callState === CallStates.CALLING}
            >
              <div
                className={classnames(
                  callState === null || callState === CallStates.CALLING
                    ? 'video-self-idle'
                    : 'video-self'
                )}
              >
                <video
                  ref={player}
                  autoPlay
                  playsInline
                  muted
                  className="img-fluid"
                />
              </div>
            </Draggable>

            {(callState === CallStates.CALL_ACCEPTED
              || callState === CallStates.CALL_ACKNOWLEDGED) && (
              <Button
                variant="danger"
                className={classnames('rounded-circle btn-call-end shadow')}
                onClick={onEnd}
              >
                <FontAwesomeIcon icon={faPhoneSlash} color="#fff" />
              </Button>
            )}
          </Col>
        </Row>

        {/* PEER Video */}
        <div
          sm={12}
          className={classnames(
            callState === CallStates.CALL_ACCEPTED
              || callState === CallStates.CALL_ACKNOWLEDGED
              ? 'video-peer'
              : null
          )}
        >
          <video
            ref={peerPlayer}
            autoPlay
            playsInline
            className="img-fluid w-100"
          />
        </div>
      </Container>
    </>
  );
};

Broadcast.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string
  }).isRequired,
  onSocketConnected: PropTypes.func.isRequired
};

const mapStateToProps = ({ user, room }) => ({
  user,
  room
});

const mapDispatchToProps = (dispatch) => ({
  onSocketConnected: (id, socketId) => dispatch(socketConnected(id, socketId))
});

export default connect(mapStateToProps, mapDispatchToProps)(Broadcast);
