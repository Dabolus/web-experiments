import React, { FunctionComponent, BlockquoteHTMLAttributes } from 'react';

import { Typography, TypographyProps, makeStyles } from '@material-ui/core';

interface QuoteTextProps extends BlockquoteHTMLAttributes<HTMLDivElement> {
  variant: 'quote';
}

interface ParagraphTextProps extends Omit<TypographyProps, 'variant'> {
  variant: 'paragraph';
}

export type TextProps = TypographyProps | QuoteTextProps | ParagraphTextProps;

const useStyles = makeStyles((theme) => ({
  quote: {
    fontStyle: 'italic',
    border: `0.02rem solid ${theme.palette.divider}`,
    borderLeft: `0.2rem solid ${theme.palette.primary.main}`,
    margin: '0.25rem 0 0.75rem 0',
    padding: '1rem 2rem',
    textAlign: 'justify',
    background: theme.palette.background.default,
    borderRadius: '0 0.5rem 0.5rem 0',
  },
  paragraph: {
    textAlign: 'justify',
    margin: '0.75rem 0',
  },
}));

const Text: FunctionComponent<TextProps> = (props) => {
  const classes = useStyles();

  switch (props.variant) {
    case 'quote':
      return <blockquote className={classes.quote} {...props} />;
    case 'paragraph':
    case undefined:
      const { variant, ...typographyProps } = props;

      return <Typography className={classes.paragraph} {...typographyProps} />;
    default:
      return <Typography {...props} />;
  }
};

export default Text;
