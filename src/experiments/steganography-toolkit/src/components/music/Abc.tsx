import React, {
  useEffect,
  useState,
  HTMLAttributes,
  forwardRef,
  memo,
} from 'react';

import { Box, styled } from '@mui/material';

import ABCJS from 'abcjs';

const Container = styled('div')<{ hidden?: boolean }>(({ hidden }) => ({
  minHeight: 26,
  ...(hidden && { display: 'none' }),
}));

export interface AbcProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  params?: any;
  onRender?(output: any): void;
  hidden?: boolean;
}

const Abc = forwardRef<HTMLDivElement, AbcProps>(
  (
    { src, params = { responsive: 'resize' }, onRender, hidden, ...props },
    ref,
  ) => {
    const [id, setId] = useState<string | null>(null);

    useEffect(() => {
      setId(`abc-result-${Date.now() + Math.random()}`);
    }, []);

    useEffect(() => {
      if (!id || !src) {
        return;
      }

      onRender?.(ABCJS.renderAbc(id, src, params));
    }, [id, src]);

    return (
      <Container ref={ref} hidden={hidden} {...props}>
        {id ? <Box id={id} width={1} /> : null}
      </Container>
    );
  },
);

export default memo(Abc);
