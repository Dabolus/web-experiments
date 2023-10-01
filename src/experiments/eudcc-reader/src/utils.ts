import { h, FunctionalComponent, ComponentType } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

export const lazy = <P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback: ComponentType = () => null,
): FunctionalComponent<P> => {
  let loaded: ComponentType<P>;
  return props => {
    const [[component], setComponent] = useState<[ComponentType<P>]>([
      loaded || fallback,
    ]);
    const unmounted = useRef<boolean>(false);
    useEffect(() => {
      if (loaded) {
        return;
      }
      importFn().then(({ default: comp }) => {
        loaded = comp;
        if (!unmounted.current) {
          setComponent([comp]);
        }
      });
      return () => {
        unmounted.current = true;
      };
    }, []);
    return h(component, props);
  };
};
