import React, { useEffect, useState, useRef, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Image,
  Media,
  Badge,
  Card,
} from "react-bootstrap";
import Peer from "simple-peer";
import io from "socket.io-client";
import UserContext from "../contexts/UserContext";
import { useHistory } from "react-router";
import NavBar from "../components/Navbar";
import UserCard from "../components/UserCard";

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
      console.log("Call Acknowledged from: ", res.from.name, res.from.socketID);
      peer.signal(res.signal);
    });
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
          <Col sm={12} md={6} lg={6}>
            <video
              ref={player}
              autoPlay
              controls
              muted
              className="img-fluid w-100"
            />
          </Col>
          <Col sm={12} md={6} lg={6}>
            <video
              ref={peerPlayer}
              autoPlay
              controls
              className="img-fluid w-100"
            />
          </Col>
        </Row>

        {users.map(({ id, name, type, socketID: sID }) => {
          if (id === userID && sID === socketID) return null;
          return (
            <UserCard
              key={id}
              name={name}
              type={type}
              buttonText="Call"
              onClick={() => onCall({ id, name, type, socketID: sID })}
            />
          );
        })}
      </Container>
    </>
  );
};

export default Broadcast;
