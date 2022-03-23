const menuLabel = document.querySelector<HTMLParagraphElement>('#menu-label')!;
const menu = document.querySelector<HTMLElement>(
  '[aria-labelledby="menu-label"]',
)!;
const menuList = document.querySelector<HTMLUListElement>('#menu-list')!;

export interface BaseMenuItem {
  name: string;
}

export interface LinkMenuItem extends BaseMenuItem {
  url: string;
}

export interface ButtonMenuItem extends BaseMenuItem {
  onClick: () => void;
}

export type MenuItem = LinkMenuItem | ButtonMenuItem;

export const showMenu = (title: string | null, items: MenuItem[]) => {
  menuLabel.hidden = !title;
  menuLabel.textContent = title || '';
  menu.hidden = false;

  if (title) {
    menu.setAttribute('aria-labelledby', 'menu-label');
  } else {
    menu.removeAttribute('aria-labelledby');
  }

  menuList.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    if ('url' in item) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.name;
      li.appendChild(a);
    } else {
      const button = document.createElement('button');
      button.textContent = item.name;
      button.onclick = item.onClick;
      li.appendChild(button);
    }
    menuList.appendChild(li);
  });
};

export const hideMenu = () => {
  menuLabel.hidden = true;
  menu.hidden = true;
  menuList.textContent = '';
  menuList.innerHTML = '';
};
