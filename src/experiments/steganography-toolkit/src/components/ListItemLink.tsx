import React, { FunctionComponent, PropsWithChildren, forwardRef } from 'react';
import clsx from 'clsx';
import { ListItemButton, ListItemButtonProps } from '@mui/material';
import { NavLink, NavLinkProps } from 'react-router-dom';

export interface ListItemLinkProps {
  to: string;
  className?: string;
  activeClassName?: string;
  onClick?(): void;
}

export const ListItemLink: FunctionComponent<
  PropsWithChildren<ListItemLinkProps>
> = ({ to, activeClassName, ...props }) => {
  const renderLink = React.useMemo(
    () =>
      forwardRef<HTMLAnchorElement, Omit<NavLinkProps, 'to'>>(function Link(
        { className, ...itemProps },
        ref,
      ) {
        return (
          <NavLink
            to={to}
            ref={ref}
            className={({ isActive }) =>
              clsx(className, isActive && activeClassName)
            }
            {...itemProps}
            role={undefined}
          />
        );
      }),
    [to],
  );

  return (
    <li>
      <ListItemButton component={renderLink} {...props} />
    </li>
  );
};
