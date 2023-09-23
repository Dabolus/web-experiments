import React, {
  Children,
  Fragment,
  FunctionComponent,
  ReactElement,
  ReactNode,
  isValidElement,
} from 'react';
import {
  FormHelperText,
  FormHelperTextProps,
  Stack,
  styled,
} from '@mui/material';
import {
  SvgIconComponent,
  InfoOutlined as InfoOutlinedIcon,
  WarningAmberOutlined as WarningAmberOutlinedIcon,
  ReportOutlined as ReportOutlinedIcon,
  CheckCircleOutlined as CheckCircleOutlinedIcon,
} from '@mui/icons-material';

export type HelperTextSeverity =
  | 'default'
  | 'info'
  | 'warning'
  | 'error'
  | 'success';

export interface HelperTextProps
  extends Omit<FormHelperTextProps, 'error' | 'children'> {
  severity?: HelperTextSeverity;
  children: ReactNode | ReactNode[];
}

const severityToIconMap: Partial<Record<HelperTextSeverity, SvgIconComponent>> =
  {
    info: InfoOutlinedIcon,
    warning: WarningAmberOutlinedIcon,
    error: ReportOutlinedIcon,
    success: CheckCircleOutlinedIcon,
  };

const ColoredFormHelperText = styled(FormHelperText)<
  Pick<HelperTextProps, 'severity'>
>(({ theme, severity = 'default' }) => ({
  ...(severity !== 'default' && {
    color: theme.palette[severity].main,
  }),
}));

const ExtraLineContainer = styled('div')(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

const getChildrenArray = (children: ReactNode | ReactNode[]) => {
  if (Array.isArray(children)) {
    return children;
  }
  const childrenToTransform =
    isValidElement(children) && children.type === Fragment
      ? children.props.children
      : children;
  return Children.toArray(childrenToTransform);
};

const HelperText: FunctionComponent<HelperTextProps> = ({
  severity = 'default',
  children,
  ...props
}) => {
  const childrenArray = getChildrenArray(children);
  const Icon = severityToIconMap[severity];

  return (
    <ColoredFormHelperText
      severity={severity}
      error={severity === 'error'}
      {...props}
    >
      {severity === 'default' &&
        childrenArray.map((child, index) => <div key={index}>{child}</div>)}
      {severity !== 'default' && (
        <>
          <Stack direction="row" alignItems="center" gap={0.5}>
            {Icon && <Icon fontSize="inherit" />}
            <div>{childrenArray[0]}</div>
          </Stack>
          {childrenArray.slice(1).map((child, index) => (
            <ExtraLineContainer key={index}>{child}</ExtraLineContainer>
          ))}
        </>
      )}
    </ColoredFormHelperText>
  );
};

export default HelperText;
