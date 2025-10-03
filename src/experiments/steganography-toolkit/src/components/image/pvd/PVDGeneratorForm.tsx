import React, { FunctionComponent } from 'react';
import Form, { ChangeHandlerInfo, FormProps } from '../../forms/Form';
import ColorField, { Color } from '../../forms/ColorField';
import TextField from '../../forms/TextField';
import SelectField from '../../forms/SelectField';
import EncryptionField, {
  EncryptionFieldValue,
} from '../../forms/EncryptionField';
import TextOrFileField from '../../forms/TextOrFileField';

export interface PVDGeneratorFormValue {
  payload: Uint8Array | undefined;
  backgroundColor: Color;
  aspectRatio: [number, number];
  bitsPerChannel: number;
  useAlphaChannel: boolean;
  encryption: EncryptionFieldValue;
}

type RawPVDGeneratorFormValue = Omit<PVDGeneratorFormValue, 'aspectRatio'> & {
  aspectRatio: string;
};

const defaultPVDGeneratorFormValue: RawPVDGeneratorFormValue = {
  payload: undefined,
  backgroundColor: {
    red: 255,
    green: 255,
    blue: 255,
  },
  aspectRatio: '1:1',
  bitsPerChannel: 1,
  useAlphaChannel: false,
  encryption: {
    algorithm: 'none',
    password: '',
  },
};

export type PVDGeneratorFormProps = Omit<
  FormProps<PVDGeneratorFormValue>,
  'defaultValue' | 'children'
>;

const PVDGeneratorForm: FunctionComponent<PVDGeneratorFormProps> = ({
  onChange,
  onSubmit,
  ...props
}) => {
  const transformRawValues = async (
    values: RawPVDGeneratorFormValue,
  ): Promise<PVDGeneratorFormValue> => {
    const [widthRatio, heightRatio] = values.aspectRatio.split(':');
    return {
      ...values,
      aspectRatio: [Number(widthRatio), Number(heightRatio)],
    };
  };

  return (
    <Form<RawPVDGeneratorFormValue>
      defaultValue={defaultPVDGeneratorFormValue}
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
        label="Max bits per pair"
        type="number"
        min={1}
        max={7}
        description="PVD auto-selects bits per pair from pixel differences (up to 7). This setting caps the maximum used per pair."
        slotProps={{
          input: {
            title:
              'PVD auto-selects bits per pair from pixel differences (up to 7). This setting caps the maximum used per pair.',
          },
        }}
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

export default PVDGeneratorForm;
