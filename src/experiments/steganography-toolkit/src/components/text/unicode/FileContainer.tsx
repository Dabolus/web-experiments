import { alpha, styled } from '@mui/material';

const FileContainer = styled('p')<{ isDragActive?: boolean }>(
  ({ theme, isDragActive }) => ({
    padding: '16.5px 14px',
    margin: theme.spacing(1, 0, 0),
    fontSize: '1rem',
    borderRadius: '4px',
    border: `1px solid ${alpha(theme.palette.divider, 0.23)}`,
    height: '3.46rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
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
  }),
);

export default FileContainer;
