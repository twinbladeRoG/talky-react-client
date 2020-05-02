import React, { useEffect, useState, useRef, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Image,
  Media,
  Badge,
  Card,
  Button,
} from "react-bootstrap";
import classnames from "classnames";
import Peer from "simple-peer";
import io from "socket.io-client";
import UserContext from "../contexts/UserContext";
import { useHistory } from "react-router";
import NavBar from "../components/Navbar";
import UserCard from "../components/UserCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneAlt } from "@fortawesome/free-solid-svg-icons";
import Draggable from "react-draggable";

const callStates = {
  CALLING: "CALLING",
  CALL_ACCEPTED: "CALL_ACCEPTED",
};

const Broadcast = () => {
  const user = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [stream, setStream] = useState(null);
  const [userID, setUserID] = useState(null);
  const [socketID, setSocketID] = useState(null);
  const [callState, setCallState] = useState(null);

  const history = useHistory();
  const player = useRef(null);
  const peerPlayer = useRef(null);
  let socket = useRef(null);

  useEffect(() => {
    console.log(`Logged in as ${user.name}, ${!user.name.length}`);
    if (!user.name.length) {
      console.log("in clear");
      return history.push("/");
    }

    console.log("Connecting to Socket at:", process.env.REACT_APP_SOCKET_URL);
    socket.current = io(process.env.REACT_APP_SOCKET_URL, {
      query: {
        name: user.name,
        type: user.type,
      },
    });

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

    socket.current.on("connected", ({ id, socketID }) => {
      console.log("User ID", id);
      console.log("Socket ID", socketID);
      setUserID(id);
      setSocketID(socketID);
      user.setUserID(id);
      user.setSocketID(socketID);
    });

    socket.current.on("users", (res) => {
      console.log(res);
      setUsers(res);
    });

    return () => {
      console.log("disconnect");
      socket.current.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  const onCall = (callUser) => {
    console.log("click");
    setCallState(callStates.CALLING);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
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
    });

    peer.on("signal", (data) => {
      socket.current.emit("send-signal", {
        signal: data,
        from: {
          id: userID,
          name: user.name,
          type: user.type,
          socketID: socketID,
        },
        to: callUser,
      });
    });

    peer.on("stream", (stream) => {
      peerPlayer.current.srcObject = stream;
    });

    socket.current.on("call-acknowledged", (res) => {
      setCallState(callStates.CALL_ACCEPTED);
      console.log("Call Acknowledged from: ", res.from.name, res.from.socketID);
      peer.signal(res.signal);
    });
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
            <Media.Body className="align-self-center">
              <h6 className="mb-0">{user.name}</h6>
              <Badge variant="primary">{user.type}</Badge>
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
            <UserCard
              key={id}
              name={name}
              type={type}
              buttonText={"Call"}
              onClick={() => onCall({ id, name, type, socketID: sID })}
            >
              <Button
                variant={
                  callState === callStates.CALL_ACCEPTED ? "success" : "primary"
                }
                disabled={callState !== null}
                onClick={() => onCall({ id, name, type, socketID: sID })}
              >
                <FontAwesomeIcon icon={faPhoneAlt} className="mr-2" />
                {callState === callStates.CALLING && "CALLING"}
                {callState === callStates.CALL_ACCEPTED && "ACCEPTED"}
                {callState === null && "Call"}
              </Button>
            </UserCard>
          );
        })}
      </Container>
    </>
  );
};

export default Broadcast;
