import React, { useState, useContext } from "react";
import {
  Navbar,
  Container,
  Form,
  InputGroup,
  FormControl,
  Button,
  Alert
} from "react-bootstrap";
import UserContext from "../contexts/UserContext";
import { useHistory } from "react-router";

const Login = () => {
  const { setUserName, setUserType } = useContext(UserContext);
  const history = useHistory();
  const [name, setName] = useState("");
  const [type, setType] = useState("BROADCASTER");
  const [error, setError] = useState(false);

  const onChange = event => {
    setName(event.target.value);
  };
  const onTypeChange = e => {
    setType(e.target.value);
  };

  const onLogin = e => {
    e.preventDefault();
    if (!name.length) {
      setError(true);
    } else {
      setError(false);
      setUserName(name);
      setUserType(type);
      if (type === "BROADCASTER") history.push("/broadcast");
      else history.push("/receiver");
    }
  };

  return (
    <>
      <Navbar bg="dark" expand="lg">
        <Navbar.Brand className="text-white">Talky</Navbar.Brand>
      </Navbar>
      <Container className="my-5">
        {error && <Alert variant="danger">Username required</Alert>}
        <Form onSubmit={onLogin}>
          <InputGroup className="mb-3">
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

          <Form.Group>
            <Form.Check
              custom
              inline
              defaultChecked
              type="radio"
              id="broadcaster"
              name="type"
              label={"Broadcaster"}
              value="BROADCASTER"
              onChange={onTypeChange}
            />

            <Form.Check
              custom
              inline
              type="radio"
              id="receiver"
              name="type"
              label="Receiver"
              value="RECEIVER"
              onChange={onTypeChange}
            />
          </Form.Group>
        </Form>
      </Container>
    </>
  );
};

export default Login;
