import { alpha, styled } from '@mui/material';

export interface UserFile<T = Uint8Array> {
  name: string;
  content: T;
}

const FileContainer = styled('div')<{
  isDragActive?: boolean;
  disabled?: boolean;
}>(({ theme, isDragActive }) => ({
  position: 'relative',
  padding: '16.5px 14px',
  margin: theme.spacing(0.875, 0, 0),
  fontSize: '1rem',
  borderRadius: '4px',
  color: theme.palette.text.primary,
  border: `1px solid ${alpha(theme.palette.divider, 0.23)}`,
  height: 'calc(100% - 31px)',
  lineHeight: 1.3125,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  '&[disabled]': {
    color: theme.palette.text.disabled,
    pointerEvents: 'none',
  },
  '&:hover': {
    borderColor: theme.palette.text.primary,
  },
  '&:active, &:focus': {
    borderColor: theme.palette.text.primary,
    borderWidth: '2px',
  },
  ...(isDragActive && {
    borderColor: theme.palette.text.primary,
    borderWidth: '2px',
  }),
}));

export default FileContainer;
