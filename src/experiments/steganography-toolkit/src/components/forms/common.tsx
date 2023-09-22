import {
  Fab,
  FormControl,
  FormLabel,
  IconButton,
  Typography,
  alpha,
  styled,
} from '@mui/material';

export const Label = styled(FormLabel)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

export const FileName = styled(Typography)<{ hasFile?: boolean }>(
  ({ theme, hasFile }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginRight: hasFile ? theme.spacing(4.75) : 0,
  }),
);

export const ClearFileButton = styled(Fab)({
  position: 'absolute',
  top: 16,
  right: 12.5,
  padding: 5,
  width: 26,
  height: 26,
  minHeight: 'unset',
});

export interface FileContainerProps {
  isDragActive?: boolean;
  disabled?: boolean;
  height?: number;
}

export const FileContainer = styled('div')<FileContainerProps>(
  ({ theme, isDragActive, height }) => ({
    position: 'relative',
    padding: '16.5px 14px',
    margin: theme.spacing(0.875, 0, 0),
    fontSize: '1rem',
    borderRadius: '4px',
    color: theme.palette.text.primary,
    border: `1px solid ${alpha(theme.palette.divider, 0.23)}`,
    height: height ?? 'calc(100% - 31px)',
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
  }),
);

const fullHeightStyles = { height: '100%' };

export const FullHeightFormControl = styled(FormControl)(fullHeightStyles);

export const InputContainer = styled('div')(fullHeightStyles);

export const AutoFittingCanvas = styled('canvas')<{ pixelated?: boolean }>(
  ({ pixelated }) => ({
    display: 'block',
    position: 'absolute',
    top: 16.5,
    left: 14,
    width: 'calc(100% - 28px)',
    height: 'calc(100% - 33px)',
    objectFit: 'contain',
    ...(pixelated && {
      imageRendering: ['crisp-edges', 'pixelated', '-webkit-optimize-contrast'],
    }),

    '&[hidden]': {
      display: 'none',
    },
  }),
);
