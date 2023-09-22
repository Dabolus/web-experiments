import React, { FunctionComponent, useRef, useState } from 'react';
import { loadImage, readFile } from '../../../helpers';
import Form, { ChangeHandlerInfo, FormProps } from '../../forms/Form';
import TextField from '../../forms/TextField';
import FileField from '../../forms/FileField';
import SelectField from '../../forms/SelectField';
import EncryptionField, {
  EncryptionFieldValue,
} from '../../forms/EncryptionField';
import TextOrFileField from '../../forms/TextOrFileField';
import { AutoFittingCanvas } from '../../forms/common';

export interface LSBConcealerFormValue {
  carrier: HTMLCanvasElement | undefined;
  payload: Uint8Array | undefined;
  bitsPerChannel: number;
  useAlphaChannel: boolean | 'auto';
  encryption: EncryptionFieldValue;
}

type RawLSBConcealerFormValue = Omit<LSBConcealerFormValue, 'carrier'> & {
  carrier: File | undefined;
};

const defaultLSBConcealerFormValue: RawLSBConcealerFormValue = {
  carrier: undefined,
  payload: undefined,
  bitsPerChannel: 1,
  useAlphaChannel: 'auto',
  encryption: {
    algorithm: 'none',
    password: '',
  },
};

export type LSBConcealerFormProps = Omit<
  FormProps<LSBConcealerFormValue>,
  'defaultValue' | 'children'
>;

const LSBConcealerForm: FunctionComponent<LSBConcealerFormProps> = ({
  onChange,
  onSubmit,
  ...props
}) => {
  const [hasCarrier, setHasCarrier] = useState(false);
  const carrierCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const transformRawValues = async (
    values: RawLSBConcealerFormValue,
  ): Promise<LSBConcealerFormValue> => {
    if (!values.carrier) {
      return values as LSBConcealerFormValue;
    }
    const carrierContext = carrierCanvasRef.current?.getContext('2d', {
      willReadFrequently: true,
    });
    if (!carrierCanvasRef.current || !carrierContext) {
      return { ...values, carrier: undefined };
    }
    const carrierSrc = await readFile(values.carrier, 'dataURL');
    const carrierImage = await loadImage(carrierSrc);
    carrierCanvasRef.current.width = carrierImage.width;
    carrierCanvasRef.current.height = carrierImage.height;
    carrierContext.drawImage(carrierImage, 0, 0);
    return {
      ...values,
      carrier: carrierCanvasRef.current,
    };
  };

  return (
    <Form<RawLSBConcealerFormValue>
      defaultValue={defaultLSBConcealerFormValue}
      onChange={async (values, info) => {
        if (values.carrier && !carrierCanvasRef.current) {
          return;
        }
        setHasCarrier(!!values.carrier);
        const transformedValues = await transformRawValues(values);
        onChange?.(transformedValues, info as ChangeHandlerInfo);
      }}
      onSubmit={async (values, event) => {
        if (values.carrier && !carrierCanvasRef.current) {
          return;
        }
        setHasCarrier(!!values.carrier);
        const transformedValues = await transformRawValues(values);
        onSubmit?.(transformedValues, event);
      }}
      {...props}
    >
      <FileField
        name="carrier"
        label="Carrier image"
        accept={{
          'image/*': [
            '.png',
            '.gif',
            '.jpeg',
            '.jpg',
            '.bmp',
            '.webp',
            '.avif',
            '.svg',
          ],
        }}
      >
        <AutoFittingCanvas
          pixelated
          hidden={!hasCarrier}
          ref={carrierCanvasRef}
        />
        {!hasCarrier && 'Drop an image here, or click to select image'}
      </FileField>
      <TextOrFileField name="payload" label="Text to hide" />
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
          { name: 'Auto', value: 'auto' },
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ]}
      />
      <EncryptionField name="encryption" />
    </Form>
  );
};

export default LSBConcealerForm;
