import React, {
  FunctionComponent,
  BlockquoteHTMLAttributes,
  PropsWithChildren,
} from 'react';
import { Typography, TypographyProps, styled } from '@mui/material';

interface QuoteTextProps extends BlockquoteHTMLAttributes<HTMLQuoteElement> {
  variant: 'quote';
}

interface ParagraphTextProps extends Omit<TypographyProps, 'variant'> {
  variant: 'paragraph';
}

export type TextProps = TypographyProps | QuoteTextProps | ParagraphTextProps;

const Quote = styled('blockquote')(({ theme }) => ({
  fontStyle: 'italic',
  border: `0.02rem solid ${theme.palette.divider}`,
  borderLeft: `0.2rem solid ${theme.palette.primary.main}`,
  margin: '0.25rem 0 0.75rem 0',
  padding: '1rem 2rem',
  textAlign: 'justify',
  background: theme.palette.background.default,
  borderRadius: '0 0.5rem 0.5rem 0',
}));

const Paragraph = styled(Typography)({
  textAlign: 'justify',
  margin: '0.75rem 0',
});

const Text: FunctionComponent<PropsWithChildren<TextProps>> = props => {
  switch (props.variant) {
    case 'quote':
      return <Quote {...props} />;
    case 'paragraph':
    case undefined:
      const { variant, ...typographyProps } = props;

      return <Paragraph {...typographyProps} />;
    default:
      return <Typography {...props} />;
  }
};

export default Text;
