import React, { FunctionComponent, useRef, useState } from 'react';
import { loadImage, readFile } from '../../../helpers';
import Form, { ChangeHandlerInfo, FormProps } from '../../forms/Form';
import TextField from '../../forms/TextField';
import FileField from '../../forms/FileField';
import SelectField from '../../forms/SelectField';
import EncryptionField, {
  EncryptionFieldValue,
} from '../../forms/EncryptionField';
import { AutoFittingCanvas } from '../../forms/common';

export interface LSBRevealerFormValue {
  carrierWithPayload: HTMLCanvasElement | undefined;
  bitsPerChannel: number;
  useAlphaChannel: boolean | 'auto';
  encryption: EncryptionFieldValue;
}

type RawLSBRevealerFormValue = Omit<LSBRevealerFormValue, 'carrier'> & {
  carrierWithPayload: File | undefined;
};

const defaultLSBRevealerFormValue: RawLSBRevealerFormValue = {
  carrierWithPayload: undefined,
  bitsPerChannel: 1,
  useAlphaChannel: 'auto',
  encryption: {
    algorithm: 'none',
    password: '',
  },
};

export type LSBRevealerFormProps = Omit<
  FormProps<LSBRevealerFormValue>,
  'defaultValue' | 'children'
>;

const LSBRevealerForm: FunctionComponent<LSBRevealerFormProps> = ({
  onChange,
  onSubmit,
  ...props
}) => {
  const [hasCarrierWithPayload, setHasCarrierWithPayload] = useState(false);
  const carrierWithPayloadCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const transformRawValues = async (
    values: RawLSBRevealerFormValue,
  ): Promise<LSBRevealerFormValue> => {
    if (!values.carrierWithPayload) {
      return values as LSBRevealerFormValue;
    }
    const carrierWithPayloadContext =
      carrierWithPayloadCanvasRef.current?.getContext('2d', {
        willReadFrequently: true,
      });
    if (!carrierWithPayloadCanvasRef.current || !carrierWithPayloadContext) {
      return { ...values, carrierWithPayload: undefined };
    }
    const carrierSrc = await readFile(values.carrierWithPayload, 'dataURL');
    const carrierImage = await loadImage(carrierSrc);
    carrierWithPayloadCanvasRef.current.width = carrierImage.width;
    carrierWithPayloadCanvasRef.current.height = carrierImage.height;
    carrierWithPayloadContext.drawImage(carrierImage, 0, 0);
    return {
      ...values,
      carrierWithPayload: carrierWithPayloadCanvasRef.current,
    };
  };

  return (
    <Form<RawLSBRevealerFormValue>
      defaultValue={defaultLSBRevealerFormValue}
      onChange={async (values, info) => {
        if (values.carrierWithPayload && !carrierWithPayloadCanvasRef.current) {
          return;
        }
        setHasCarrierWithPayload(!!values.carrierWithPayload);
        const transformedValues = await transformRawValues(values);
        onChange?.(transformedValues, info as ChangeHandlerInfo);
      }}
      onSubmit={async (values, event) => {
        if (values.carrierWithPayload && !carrierWithPayloadCanvasRef.current) {
          return;
        }
        setHasCarrierWithPayload(!!values.carrierWithPayload);
        const transformedValues = await transformRawValues(values);
        onSubmit?.(transformedValues, event);
      }}
      {...props}
    >
      <FileField
        name="carrierWithPayload"
        label="Image with hidden message"
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
        wideScreenCols={12}
        height={219.5}
      >
        <AutoFittingCanvas
          hidden={!hasCarrierWithPayload}
          ref={carrierWithPayloadCanvasRef}
        />
        {!hasCarrierWithPayload &&
          'Drop an image here, or click to select image'}
      </FileField>
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

export default LSBRevealerForm;
