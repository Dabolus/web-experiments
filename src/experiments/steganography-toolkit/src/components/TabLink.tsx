import React, { FunctionComponent } from 'react';
import { Link, To, useParams, useNavigate } from 'react-router-dom';
import { Tab, TabProps, Typography } from '@mui/material';

export interface TabLinkProps extends Omit<TabProps, 'component'> {
  to: To;
}

const TabLink: FunctionComponent<TabLinkProps> = ({
  value,
  to = value,
  label,
  ...props
}) => (
  <Tab
    component={Link}
    to={to}
    replace
    value={value}
    label={
      <Typography variant="button" component="h3">
        {label}
      </Typography>
    }
    {...(props as TabProps)}
  />
);

export default TabLink;
