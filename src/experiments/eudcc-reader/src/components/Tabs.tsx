import {
  h,
  Fragment,
  FunctionalComponent,
  ComponentChild,
  ComponentChildren,
} from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import commonClasses from '../common/styles.module.scss';
import classes from './Tabs.module.scss';

export interface Tab {
  id: string;
  title?: string;
  content: ComponentChild | ComponentChildren;
}

export interface TabsProps {
  tabs: Tab[];
  value: string;
  onChange?(newValue: string): void;
}

const Tabs: FunctionalComponent<TabsProps> = ({ tabs, value, onChange }) => {
  const tabListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tabList = tabListRef.current;

    if (!tabList) {
      return;
    }

    const listener = (event: KeyboardEvent): void => {
      if (event.code !== 'ArrowRight' && event.code !== 'ArrowLeft') {
        return;
      }

      const currentTabIndex = tabs.findIndex(tab => tab.id === value);
      if (currentTabIndex < 0) {
        return;
      }

      if (event.code === 'ArrowRight') {
        onChange?.(tabs[(currentTabIndex + 1) % tabs.length].id);
      } else if (event.code === 'ArrowLeft') {
        onChange?.(
          tabs[currentTabIndex < 1 ? tabs.length - 1 : currentTabIndex - 1].id,
        );
      }
    };

    tabList.addEventListener('keydown', listener);
    return (): void => tabList.removeEventListener('keydown', listener);
  }, [onChange, tabs, value]);

  return (
    <>
      <div role="tablist" ref={tabListRef}>
        {tabs.map(({ id, title = id }) => (
          <button
            key={id}
            id={id}
            role="tab"
            aria-selected={value === id ? 'true' : 'false'}
            aria-controls={`${id}-tab`}
            onClick={(): void => onChange?.(id)}
            className={classes.tab}
          >
            {title}
          </button>
        ))}
      </div>
      {tabs.map(({ id, content }) => (
        <div
          key={id}
          tabIndex={0}
          role="tabpanel"
          id={`${id}-tab`}
          aria-labelledby={id}
          hidden={value !== id}
          className={`${commonClasses.card} ${classes.tabContent}`}
        >
          {content}
        </div>
      ))}
    </>
  );
};
export default Tabs;
