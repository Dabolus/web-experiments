import React, {
  Children,
  FunctionComponent,
  MouseEvent,
  ReactElement,
  ReactNode,
  createElement,
  isValidElement,
  useId,
  useRef,
  useState,
} from 'react';
import { Button, ButtonProps, Menu, MenuItemProps } from '@mui/material';
import {
  ArrowDropUp as ArrowDropUpIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';

export interface MenuButtonProps
  extends Omit<ButtonProps, 'endIcon' | 'onClick' | 'children'> {
  label: ReactNode;
  children: ReactElement<MenuItemProps> | ReactElement<MenuItemProps>[];
}

const MenuButton: FunctionComponent<MenuButtonProps> = ({
  label,
  children,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  return (
    <>
      <Button
        ref={buttonRef}
        aria-controls={menuId}
        aria-haspopup="true"
        endIcon={menuOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        onClick={() => setMenuOpen(prev => !prev)}
        {...props}
      >
        {label}
      </Button>
      <Menu
        id={menuId}
        anchorEl={buttonRef.current}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
        keepMounted
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        {Children.map(children, child =>
          isValidElement(child)
            ? createElement(child.type, {
                ...child.props,
                onClick: (event: MouseEvent<HTMLLIElement>) => {
                  setMenuOpen(false);
                  child.props.onClick?.(event);
                },
              })
            : child,
        )}
      </Menu>
    </>
  );
};

export default MenuButton;
