import React, {
  ReactElement,
  ReactNode,
  useEffect,
  BaseSyntheticEvent,
} from 'react';
import { FieldValues, useForm, EventType, FormProvider } from 'react-hook-form';
import { Grid2 as Grid } from '@mui/material';
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
  disabled?: boolean;
  defaultValue?: Partial<T>;
  children: ReactElement<FormChildProps<T>> | ReactElement<FormChildProps<T>>[];
}

const Form = <T extends FieldValues = FieldValues>({
  spacing = 3,
  defaultValue,
  onSubmit,
  onChange,
  children,
}: FormProps<T>): ReactElement => {
  // We need to use any because types are too complex and VS Code gets stuck on it
  const formMethods = useForm<any>({
    defaultValues: defaultValue,
  });

  useEffect(() => {
    const subscription = formMethods.watch((value, info) =>
      onChange?.({ ...value, ...formMethods.getValues() }, info),
    );
    return () => subscription.unsubscribe();
  }, [formMethods.watch]);

  return (
    <Grid
      container
      spacing={spacing}
      component="form"
      {...(onSubmit && { onSubmit: formMethods.handleSubmit(onSubmit) })}
    >
      <FormProvider {...formMethods}>{children}</FormProvider>
    </Grid>
  );
};

export default Form;
