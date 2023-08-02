import React, { FunctionComponent, PropsWithChildren, ReactNode } from 'react';
import {
  Drawer,
  Toolbar as MuiToolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
  DrawerProps,
  styled,
} from '@mui/material';

export interface SidebarLayoutProps extends DrawerProps {
  menuContent?: ReactNode;
}

const Toolbar = styled(MuiToolbar)(({ theme }) => theme.mixins.toolbar);

const Menu = styled('nav')(({ theme }) => ({
  width: 'min(100vw - 56px, 280px)',

  [theme.breakpoints.up('sm')]: {
    width: 'min(100vw - 64px, 320px)',
  },
}));

const Content = styled('div')(({ theme }) => ({
  width: '100vw',
  minHeight: '100vh',
  float: 'right',
  position: 'relative',

  [theme.breakpoints.up('sm')]: {
    width: 'calc(100vw - min(100vw - 64px, 320px))',
  },
}));

const SidebarLayout: FunctionComponent<
  PropsWithChildren<SidebarLayoutProps>
> = ({ menuContent, open, children, ...props }) => {
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <>
      <Drawer
        anchor="left"
        variant={isNarrow ? 'permanent' : 'temporary'}
        open={isNarrow || open}
        {...props}
      >
        <Toolbar>
          <Typography variant="h6" component="h1">
            Steganography Toolkit
          </Typography>
        </Toolbar>
        <Divider />
        <Menu>{menuContent}</Menu>
      </Drawer>
      <Content>{children}</Content>
    </>
  );
};

export default SidebarLayout;
