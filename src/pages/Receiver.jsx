import React, { useRef, useEffect, useState, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Media,
  Badge,
  Image,
  Card,
  Button,
} from "react-bootstrap";
import Peer from "simple-peer";
import io from "socket.io-client";
import classnames from "classnames";
import UserContext from "../contexts/UserContext";
import { useHistory } from "react-router";
import NavBar from "../components/Navbar";
import UserCard from "../components/UserCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneAlt } from "@fortawesome/free-solid-svg-icons";
import Draggable from "react-draggable";

const callStates = {
  RECEIVING_CALL: "RECEIVING_CALL",
  CALL_ACCEPTED: "CALL_ACCEPTED",
};

const Receiver = () => {
  const user = useContext(UserContext);

  const [users, setUsers] = useState([]);
  const [userID, setUserID] = useState(null);
  const [socketID, setSocketID] = useState(null);
  const [signal, setSignal] = useState(null);
  const [stream, setStream] = useState(null);
  const [caller, setCaller] = useState(null);
  const [callState, setCallState] = useState(null);

  const history = useHistory();
  const player = useRef(null);
  const peerPlayer = useRef(null);
  let socket = useRef(null);

  useEffect(() => {
    console.log(`Logged in as ${user.name}`);
    if (!user.name.length) {
      console.log("in clear");
      return history.push("/");
    }

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      setStream(stream);
      if (player.current) {
        player.current.srcObject = stream;
      }
    })();

    console.log("Connecting to Socket at:", process.env.REACT_APP_SOCKET_URL);
    socket.current = io(process.env.REACT_APP_SOCKET_URL, {
      query: {
        name: user.name,
        type: user.type,
      },
    });

    socket.current.on("connected", ({ id, socketID }) => {
      console.log("User ID", id);
      console.log("Socket ID", id);
      setUserID(id);
      setSocketID(socketID);
      user.setUserID(id);
      user.setSocketID(socketID);
    });

    socket.current.on("users", (res) => {
      console.log(res);
      setUsers(res);
    });

    socket.current.on("get-signal", (res) => {
      console.log("Received signal: ", res.from);
      console.log(callState);
      // if (callState === null) setCallState(callStates.RECEIVING_CALL);
      setSignal(res.signal);
      setCaller(res.from);
    });

    return () => {
      console.log("disconnect");
      socket.current.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  const onAccept = (caller) => {
    setCallState((c) => callStates.CALL_ACCEPTED);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478?transport=udp" },
          {
            url: "turn:numb.viagenie.ca",
            username: process.env.REACT_APP_TURN_SERVER_USERNAME,
            credential: process.env.REACT_APP_TURN_SERVER_CREDENTIAL,
          },
        ],
      },
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.current.emit("acknowledge-call", {
        signal: data,
        from: {
          id: userID,
          name: user.name,
          type: user.type,
          socketID: socketID,
        },
        to: caller,
      });
    });

    peer.on("stream", (stream) => {
      peerPlayer.current.srcObject = stream;
    });

    peer.signal(signal);
  };

  const [activeDrags, setActiveDrags] = useState(0);
  const onStart = () => {
    setActiveDrags(activeDrags + 1);
  };
  const onStop = () => {
    setActiveDrags(activeDrags - 1);
  };

  return (
    <>
      <NavBar />
      <Container className="my-5">
        <Card body className="mb-3">
          <Media>
            <Image
              roundedCircle
              src={`https://api.adorable.io/avatars/285/${user.name}.png`}
              className="mr-3 bg-light emboss"
              width={70}
              height={70}
            />
            <Media.Body>
              <h6 className="mb-0">{user.name}</h6>
              <Badge variant="success">{user.type}</Badge>
            </Media.Body>
          </Media>
        </Card>

        <Row className="my-5" noGutters>
          <Draggable
            onStart={onStart}
            onStop={onStop}
            disabled={callState !== callStates.CALL_ACCEPTED}
          >
            <Col
              sm={12}
              className={classnames(
                callState === callStates.CALL_ACCEPTED ? "video-self" : null
              )}
            >
              <video ref={player} autoPlay muted className="img-fluid" />
            </Col>
          </Draggable>
          <Col
            sm={12}
            className={classnames(
              callState === callStates.CALL_ACCEPTED ? "video-peer" : "d-none"
            )}
          >
            <video ref={peerPlayer} autoPlay className="img-fluid w-100" />
          </Col>
        </Row>

        {users.map(({ id, name, type, socketID: sID }) => {
          if (id === userID && sID === socketID) return null;
          return (
            <UserCard key={id} name={name} type={type}>
              {caller && caller.id === id && (
                <Button
                  variant={
                    callState === callStates.CALL_ACCEPTED
                      ? "success"
                      : "primary"
                  }
                  disabled={callState === callStates.CALL_ACCEPTED}
                  onClick={() => onAccept({ id, name, type, socketID: sID })}
                >
                  <FontAwesomeIcon icon={faPhoneAlt} className="mr-2" />
                  {callState === callStates.CALL_ACCEPTED
                    ? "ACCEPTED"
                    : "ANSWER"}
                </Button>
              )}
            </UserCard>
          );
        })}
      </Container>
    </>
  );
};

export default Receiver;
