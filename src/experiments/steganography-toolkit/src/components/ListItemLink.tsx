import React, { FunctionComponent, PropsWithChildren } from 'react';
import { ListItemButton, ListItemButtonProps, styled } from '@mui/material';
import { NavLink, NavLinkProps } from 'react-router-dom';

export type ListItemLinkProps = Omit<
  ListItemButtonProps & NavLinkProps,
  'component'
>;

const ListItemNavLink = styled(ListItemButton)<
  ListItemLinkProps & { component: typeof NavLink }
>(({ theme }) => ({
  '&.active': {
    '& *': {
      color: theme.palette.primary.main,
      fontWeight: theme.typography.fontWeightBold,
    },
  },
}));

export const ListItemLink: FunctionComponent<
  PropsWithChildren<ListItemLinkProps>
> = props => {
  return (
    <li>
      <ListItemNavLink component={NavLink} {...props} />
    </li>
  );
};
