import React, { useRef, useEffect, useState, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Media,
  Badge,
  Image,
  Card,
} from "react-bootstrap";
import Peer from "simple-peer";
import io from "socket.io-client";
import UserContext from "../contexts/UserContext";
import { useHistory } from "react-router";
import NavBar from "../components/Navbar";
import UserCard from "../components/UserCard";

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
      setCallState(callStates.RECEIVING_CALL);
      setSignal(res.signal);
      setCaller(res.from);
    });

    return () => {
      socket.current.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  const onAccept = (caller) => {
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
      setCallState(callStates.CALL_ACCEPTED);
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
          <Col sm={12} md={6} lg={6}>
            <video ref={player} autoPlay controls muted className="img-fluid" />
          </Col>
          <Col sm={12} md={6} lg={6}>
            <video ref={peerPlayer} autoPlay controls className="img-fluid" />
          </Col>
        </Row>

        {users.map(({ id, name, type, socketID: sID }) => {
          if (id === userID && sID === socketID) return null;
          return (
            <UserCard
              key={id}
              name={name}
              type={type}
              showButton={caller && caller.id === id}
              buttonText="Accept"
              onClick={() => onAccept({ id, name, type, socketID: sID })}
            />
          );
        })}
      </Container>
    </>
  );
};

export default Receiver;
