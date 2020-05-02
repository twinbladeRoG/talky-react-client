import React from "react";
import { Card, Media, Image, Badge } from "react-bootstrap";

const UserCard = ({ name, type, children }) => {
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

        {children}
      </Media>
    </Card>
  );
};

UserCard.defaultProps = {};

export default UserCard;
