import React, {
  createElement,
  isValidElement,
  Children,
  ReactElement,
  ReactNode,
  useEffect,
  BaseSyntheticEvent,
} from 'react';
import { FieldValues, useForm, Control, EventType } from 'react-hook-form';
import { Unstable_Grid2 as Grid } from '@mui/material';
import { HelperTextSeverity } from './HelperText';

export type SubmitHandler<T extends FieldValues = FieldValues> = (
  data: T,
  event?: BaseSyntheticEvent,
) => unknown | Promise<unknown>;

export interface ChangeHandlerInfo<T extends FieldValues = FieldValues> {
  name?: keyof T;
  type?: EventType;
}

export type ChangeHandler<T extends FieldValues = FieldValues> = (
  data: T,
  info: ChangeHandlerInfo<T>,
) => unknown | Promise<unknown>;

export type FormChildProps<T extends FieldValues = FieldValues> = {
  name: Extract<keyof T, string>;
  control?: Control<T>;
  label?: ReactNode;
  description?: ReactNode | ReactNode[];
  descriptionSeverity?: HelperTextSeverity;
  showDescription?(value: T[keyof T]): boolean;
  cols?: number;
  wideScreenCols?: number;
  height?: number;
  children?:
    | ReactElement<FormChildProps<T>>
    | ReactElement<FormChildProps<T>>[];
};

export interface FormProps<T extends FieldValues = FieldValues> {
  spacing?: number;
  onSubmit?: SubmitHandler<T>;
  onChange?: ChangeHandler<T>;
  defaultValue?: Partial<T>;
  children: ReactElement<FormChildProps<T>> | ReactElement<FormChildProps<T>>[];
}

const registerChildrenFields = (
  control: Control<any>,
  children:
    | ReactElement<FormChildProps<any>>
    | ReactElement<FormChildProps<any>>[],
): ReactElement<FormChildProps<any>>[] =>
  Children.map(children, child => {
    if (!isValidElement(child)) {
      return child;
    }
    if (
      typeof child.type === 'function' &&
      child.type.name === 'FieldsStack' &&
      child.props.children
    ) {
      return createElement(child.type, {
        ...child.props,
        children: registerChildrenFields(control, child.props.children),
      });
    }
    return child.props.name
      ? createElement(child.type, {
          ...child.props,
          control,
          key: child.props.name,
        })
      : child;
  });

const Form = <T extends FieldValues = FieldValues>({
  spacing = 3,
  defaultValue,
  onSubmit,
  onChange,
  children,
}: FormProps<T>): ReactElement => {
  // We need to use any because types are too complex and VS Code gets stuck on it
  const { handleSubmit, control, getValues, watch } = useForm<any>({
    defaultValues: defaultValue,
  });

  useEffect(() => {
    const subscription = watch((value, info) =>
      onChange?.({ ...value, ...getValues() }, info),
    );
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <Grid
      container
      spacing={spacing}
      component="form"
      {...(onSubmit && { onSubmit: handleSubmit(onSubmit) })}
    >
      {registerChildrenFields(control, children)}
    </Grid>
  );
};

export default Form;
