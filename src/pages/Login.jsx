import React, { useState, useContext } from "react";
import {
  Container,
  Form,
  InputGroup,
  FormControl,
  Button,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import UserContext from "../contexts/UserContext";
import { useHistory } from "react-router";
import NavBar from "../components/Navbar";
import validator from "validator";

const Login = () => {
  const { setUserName, setUserType } = useContext(UserContext);
  const history = useHistory();
  const [name, setName] = useState("");
  const [type, setType] = useState("BROADCASTER");
  const [error, setError] = useState(false);

  const onChange = (event) => {
    setName(event.target.value);
  };
  const onTypeChange = (e) => {
    setType(e.target.value);
  };

  const onLogin = (e) => {
    e.preventDefault();
    if (!name.length) {
      setError("Username is required");
    } else if (!validator.isAlpha(name)) {
      console.log("alp");
      setError("Username should contain only alphabets");
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
      <NavBar />
      <Container fluid className="my-5">
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

                <Form.Group className="mt-3">
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
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Login;
