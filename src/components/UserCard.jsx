import React from "react";
import { Card, Media, Image, Button, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneAlt } from "@fortawesome/free-solid-svg-icons";

const UserCard = ({ name, type, onClick, buttonText, showButton }) => {
  return (
    <Card body className="mb-3">
      <Media className="align-items-center">
        <Image
          roundedCircle
          src={`https://api.adorable.io/avatars/285/${name}.png`}
          className="mr-3 bg-light emboss"
          width={70}
          height={70}
        />
        <Media.Body>
          <h6 className="mb-0">{name}</h6>
          <Badge variant="primary">{type}</Badge>
        </Media.Body>

        {showButton && (
          <Button variant="success" onClick={onClick}>
            <FontAwesomeIcon icon={faPhoneAlt} className="mr-2" />
            {buttonText}
          </Button>
        )}
      </Media>
    </Card>
  );
};
UserCard.defaultProps = {
  showButton: true,
};
export default UserCard;
