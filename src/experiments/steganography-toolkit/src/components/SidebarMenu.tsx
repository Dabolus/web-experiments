import React, {
  ReactNode,
  FunctionComponent,
  Fragment,
  useState,
  useCallback,
} from 'react';
import { useLocation } from 'react-router-dom';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  styled,
} from '@mui/material';

import {
  Home as HomeIcon,
  Title as TitleIcon,
  Image as ImageIcon,
  MusicNote as MusicNoteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { ListItemLink } from './ListItemLink';

const NestedListItemLink = styled(ListItemLink)<{ available?: boolean }>(
  ({ theme, available }) => ({
    background: theme.palette.background.paper,
    paddingLeft: theme.spacing(4),
    ...(available
      ? {}
      : {
          opacity: 0.5,
          pointerEvents: 'none',
        }),
  }),
);

interface MenuItem {
  key: string;
  title: string;
  icon: ReactNode;
  link?: string;
  available?: boolean;
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
        key: 'unicode',
        title: 'Unicode',
      },
      {
        key: 'mlp',
        title: 'Missing Letter Puzzle',
        available: false,
      },
      {
        key: 'wordlist',
        title: 'Wordlist',
        available: false,
      },
      {
        key: 'Paragraph',
        title: 'Paragraph',
        available: false,
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
        available: false,
      },
      {
        key: 'dct',
        title: 'Discrete Cosine Transform',
        available: false,
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
        key: 'cicada-3301-dyads',
        title: 'Cicada 3301 Dyads',
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
    <List>
      {MENU_ITEMS.map(({ key, title, icon, link, subitems }) => {
        const ListItem = (
          subitems ? ListItemButton : ListItemLink
        ) as typeof ListItemButton;
        return (
          <Fragment key={key}>
            <ListItem
              {...(subitems
                ? {
                    onClick: createToggleableListItemClickHandler(
                      key as keyof OpenedTogglesState,
                    ),
                  }
                : {
                    exact: true,
                    to: link || `/${key}`,
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
                <List disablePadding>
                  {subitems.map(
                    ({
                      key: subkey,
                      title: subtitle,
                      link: sublink = `/${key}/${subkey}/info`,
                      available = true,
                    }) => (
                      <NestedListItemLink
                        key={`${key}-${subkey}`}
                        available={available}
                        to={sublink}
                        onClick={handleListItemClick}
                        tabIndex={available ? 0 : -1}
                      >
                        <ListItemText>
                          {subtitle} {available ? null : <sup>Coming Soon</sup>}
                        </ListItemText>
                      </NestedListItemLink>
                    ),
                  )}
                </List>
              </Collapse>
            )}
          </Fragment>
        );
      })}
    </List>
  );
};

export default SidebarMenu;
