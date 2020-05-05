import React, { useState, useContext, useEffect } from "react";
import {
  Container,
  Form,
  InputGroup,
  FormControl,
  Button,
  Row,
  Col,
  Card,
  Alert,
} from "react-bootstrap";
import UserContext from "../contexts/UserContext";
import { useHistory } from "react-router";
import NavBar from "../components/Navbar";
import validator from "validator";
import Peer from "simple-peer";

const Login = () => {
  const { setUserName } = useContext(UserContext);
  const history = useHistory();
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (Peer.WEBRTC_SUPPORT) {
      console.log("Supported");
      setSupported(true);
    } else {
      console.log("Not Supported");
      setSupported(false);
    }
  }, []);

  const onChange = (event) => {
    setName(event.target.value);
  };

  const onLogin = (e) => {
    e.preventDefault();
    if (!name.length) {
      setError("Username is required");
    } else if (!validator.isAlpha(name)) {
      setError("Username should contain only alphabets");
    } else {
      setError(false);
      setUserName(name);
      history.push("/broadcast");
    }
  };

  return (
    <>
      <NavBar />
      <Container fluid className="my-5">
        <Alert variant={supported ? "success" : "danger"}>
          {supported ? "WebRTC supported" : "WebRTC not supported"}
        </Alert>
        <Row>
          <Col sm={12} md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
            <Card body>
              <Form onSubmit={onLogin}>
                <InputGroup className="mt-2">
                  <InputGroup.Prepend>
                    <InputGroup.Text>@</InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl
                    placeholder="Username"
                    value={name}
                    onChange={onChange}
                  />
                  <InputGroup.Append>
                    <Button variant="primary" type="submit">
                      Login
                    </Button>
                  </InputGroup.Append>
                </InputGroup>

                <Form.Text className="text-danger font-weight-bold">
                  {error}
                </Form.Text>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Login;
