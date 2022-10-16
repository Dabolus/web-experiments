import React, {
  useEffect,
  useState,
  HTMLAttributes,
  forwardRef,
  memo,
} from 'react';

import { Box } from '@material-ui/core';

import ABCJS from 'abcjs';

export interface AbcProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  params?: any;
  onRender?(output: any): void;
}

const Abc = forwardRef<HTMLDivElement, AbcProps>(
  ({ src, params = { responsive: 'resize' }, onRender, ...props }, ref) => {
    const [id, setId] = useState<string | null>(null);

    useEffect(() => {
      setId(`abc-result-${Date.now() + Math.random()}`);
    }, []);

    useEffect(() => {
      if (!id || !src) {
        return;
      }

      onRender?.(ABCJS.renderAbc(id, src, params));
    }, [id, onRender, params, src]);

    return (
      <div ref={ref} {...props}>
        {id ? <Box id={id} width={1} /> : null}
      </div>
    );
  },
);

export default memo(Abc);
