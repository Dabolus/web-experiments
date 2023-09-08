import React, {
  FunctionComponent,
  useCallback,
  ReactNode,
  PropsWithChildren,
} from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Link,
  styled,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

export interface TopbarLayoutProps {
  title?: ReactNode;
  topbarContent?: ReactNode;
  onMenuButtonClick?(): void;
}

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
});

const AppBar = styled(MuiAppBar)({
  flex: '0 0 auto',
});

const MenuButton = styled(IconButton)(({ theme }) => ({
  marginRight: theme.spacing(0.5),
}));

const Content = styled('div')({
  flex: '1 1 auto',
  display: 'flex',
  flexDirection: 'column',
});

const Footer = styled('footer')(({ theme }) => ({
  flex: '0 0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 56,
  background: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  borderTop: `1px solid ${theme.palette.divider}`,

  '& a, & strong': {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
  },
}));

const TopbarLayout: FunctionComponent<PropsWithChildren<TopbarLayoutProps>> = ({
  title = 'Steganography Toolkit',
  topbarContent,
  onMenuButtonClick,
  children,
}) => {
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.up('md'));

  const handleMenuButtonClick = useCallback(() => {
    onMenuButtonClick?.();
  }, [onMenuButtonClick]);

  return (
    <Root>
      <AppBar position="static">
        <Toolbar>
          {!isNarrow && (
            <MenuButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuButtonClick}
            >
              <MenuIcon />
            </MenuButton>
          )}
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        </Toolbar>
        {topbarContent}
      </AppBar>
      <Content>{children}</Content>
      <Footer>
        <div>
          Brought to you with <strong>❤</strong> by{' '}
          <Link href="https://github.com/Dabolus" target="my-github">
            Dabolus
          </Link>
        </div>
      </Footer>
    </Root>
  );
};
export default TopbarLayout;
