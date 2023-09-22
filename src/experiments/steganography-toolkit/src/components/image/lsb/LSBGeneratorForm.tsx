import React, { FunctionComponent } from 'react';
import Form, { ChangeHandlerInfo, FormProps } from '../../forms/Form';
import ColorField, { Color } from '../../forms/ColorField';
import TextField from '../../forms/TextField';
import SelectField from '../../forms/SelectField';
import EncryptionField, {
  EncryptionFieldValue,
} from '../../forms/EncryptionField';
import TextOrFileField from '../../forms/TextOrFileField';

export interface LSBGeneratorFormValue {
  payload: Uint8Array | undefined;
  backgroundColor: Color;
  aspectRatio: [number, number];
  bitsPerChannel: number;
  useAlphaChannel: boolean;
  encryption: EncryptionFieldValue;
}

type RawLSBGeneratorFormValue = Omit<LSBGeneratorFormValue, 'aspectRatio'> & {
  aspectRatio: string;
};

const defaultLSBGeneratorFormValue: RawLSBGeneratorFormValue = {
  payload: undefined,
  backgroundColor: {
    red: 255,
    green: 255,
    blue: 255,
  },
  aspectRatio: '1:1',
  bitsPerChannel: 8,
  useAlphaChannel: false,
  encryption: {
    algorithm: 'none',
    password: '',
  },
};

export type LSBGeneratorFormProps = Omit<
  FormProps<LSBGeneratorFormValue>,
  'defaultValue' | 'children'
>;

const LSBGeneratorForm: FunctionComponent<LSBGeneratorFormProps> = ({
  onChange,
  onSubmit,
  ...props
}) => {
  const transformRawValues = async (
    values: RawLSBGeneratorFormValue,
  ): Promise<LSBGeneratorFormValue> => {
    const [widthRatio, heightRatio] = values.aspectRatio.split(':');
    return {
      ...values,
      aspectRatio: [Number(widthRatio), Number(heightRatio)],
    };
  };

  return (
    <Form<RawLSBGeneratorFormValue>
      defaultValue={defaultLSBGeneratorFormValue}
      onChange={async (values, info) => {
        const transformedValues = await transformRawValues(values);
        onChange?.(transformedValues, info as ChangeHandlerInfo);
      }}
      onSubmit={async (values, event) => {
        const transformedValues = await transformRawValues(values);
        onSubmit?.(transformedValues, event);
      }}
      {...props}
    >
      <TextOrFileField
        name="payload"
        label="Text to hide"
        wideScreenCols={12}
      />
      <ColorField name="backgroundColor" label="Background color" />
      <SelectField
        name="aspectRatio"
        label="Aspect ratio"
        options={['1:1', '4:3', '16:9', '16:10', '21:9', '32:9']}
      />
      <TextField
        name="bitsPerChannel"
        label="Bits per channel"
        type="number"
        min={1}
        max={8}
      />
      <SelectField
        name="useAlphaChannel"
        label="Use alpha channel"
        options={[
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ]}
      />
      <EncryptionField name="encryption" />
    </Form>
  );
};

export default LSBGeneratorForm;
