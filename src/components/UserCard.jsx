import PropTypes from 'prop-types';
import React from 'react';
import { Card, Media, Image } from 'react-bootstrap';
import classnames from 'classnames';

const UserCard = ({ name, children, className }) => (
  <Card body className={classnames('mb-3', className)}>
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
      </Media.Body>

      {children}
    </Media>
  </Card>
);

UserCard.defaultProps = {
  children: null,
  name: null,
  className: null
};

UserCard.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string,
  className: PropTypes.string
};

UserCard.defaultProps = {};

export default UserCard;
