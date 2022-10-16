import React, {
  ReactNode,
  FunctionComponent,
  Fragment,
  useState,
  useCallback,
} from 'react';

import { NavLink, useLocation } from 'react-router-dom';

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Collapse,
} from '@material-ui/core';

import HomeIcon from '@material-ui/icons/Home';
import TitleIcon from '@material-ui/icons/Title';
import ImageIcon from '@material-ui/icons/Image';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

const useStyles = makeStyles((theme) => ({
  active: {
    '& *': {
      color: theme.palette.primary.main,
      fontWeight: theme.typography.fontWeightBold,
    },
  },
  nested: {
    background: theme.palette.background.default,
    paddingLeft: theme.spacing(4),
  },
}));

interface MenuItem {
  key: string;
  title: string;
  icon: ReactNode;
  link?: string;
  subitems?: Omit<MenuItem, 'icon' | 'subitems'>[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'home',
    title: 'Home',
    link: '/',
    icon: <HomeIcon />,
  },
  {
    key: 'text',
    title: 'Text',
    icon: <TitleIcon />,
    subitems: [
      {
        key: 'mlp',
        title: 'Missing Letter Puzzle',
      },
      {
        key: 'wordlist',
        title: 'Wordlist',
      },
      {
        key: 'Paragraph',
        title: 'Paragraph',
      },
    ],
  },
  {
    key: 'image',
    title: 'Image',
    icon: <ImageIcon />,
    subitems: [
      {
        key: 'lsb',
        title: 'Least Significant Bit',
      },
      {
        key: 'dct',
        title: 'Discrete Cosine Transform',
      },
    ],
  },
  {
    key: 'music',
    title: 'Music',
    icon: <MusicNoteIcon />,
    subitems: [
      {
        key: 'solresol',
        title: 'Solresol',
      },
      {
        key: 'cicada-3301',
        title: 'Cicada 3301',
      },
    ],
  },
];

interface OpenedTogglesState {
  text?: boolean;
  image?: boolean;
  music?: boolean;
}

interface SidebarMenuProps {
  onItemClick?(): void;
}

const isToggleablePage = (key: string): key is keyof OpenedTogglesState =>
  key === 'text' || key === 'image' || key === 'music';

const SidebarMenu: FunctionComponent<SidebarMenuProps> = ({ onItemClick }) => {
  const classes = useStyles();

  const { pathname } = useLocation();

  const [, pathnameKey] = pathname.split('/');

  const [openedToggles, setOpenedToggles] = useState<OpenedTogglesState>(
    isToggleablePage(pathnameKey)
      ? {
          [pathnameKey]: true,
        }
      : {},
  );

  const handleListItemClick = useCallback(() => {
    onItemClick?.();
  }, [onItemClick]);

  const createToggleableListItemClickHandler = useCallback(
    (key: keyof OpenedTogglesState) => () => {
      setOpenedToggles({
        ...openedToggles,
        [key]: !openedToggles[key],
      });
    },
    [openedToggles],
  );

  return (
    <List component="nav">
      {MENU_ITEMS.map(({ key, title, icon, link, subitems }) => (
        <Fragment key={key}>
          <ListItem
            button
            {...(subitems
              ? {
                  onClick: createToggleableListItemClickHandler(
                    key as keyof OpenedTogglesState,
                  ),
                }
              : {
                  component: NavLink,
                  exact: true,
                  to: link || `/${key}`,
                  activeClassName: classes.active,
                  onClick: handleListItemClick,
                })}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{title}</ListItemText>
            {subitems && (
              <>
                {openedToggles[key as keyof OpenedTogglesState] ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </>
            )}
          </ListItem>
          {subitems && (
            <Collapse
              in={openedToggles[key as keyof OpenedTogglesState]}
              timeout="auto"
              unmountOnExit
            >
              <List component="div" disablePadding>
                {subitems.map(
                  ({ key: subkey, title: subtitle, link: sublink }) => (
                    <ListItem
                      button
                      className={classes.nested}
                      key={`${key}-${subkey}`}
                      component={NavLink}
                      to={`${sublink || `/${key}/${subkey}`}`}
                      activeClassName={classes.active}
                      onClick={handleListItemClick}
                    >
                      <ListItemText>{subtitle}</ListItemText>
                    </ListItem>
                  ),
                )}
              </List>
            </Collapse>
          )}
        </Fragment>
      ))}
    </List>
  );
};

export default SidebarMenu;
