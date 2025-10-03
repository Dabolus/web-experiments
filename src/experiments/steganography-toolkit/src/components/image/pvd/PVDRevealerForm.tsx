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

export interface PVDRevealerFormValue {
  carrierWithPayload: HTMLCanvasElement | undefined;
  bitsPerChannel: number;
  useAlphaChannel: boolean | 'auto';
  encryption: EncryptionFieldValue;
}

type RawPVDRevealerFormValue = Omit<PVDRevealerFormValue, 'carrier'> & {
  carrierWithPayload: File | undefined;
};

const defaultPVDRevealerFormValue: RawPVDRevealerFormValue = {
  carrierWithPayload: undefined,
  bitsPerChannel: 1,
  useAlphaChannel: 'auto',
  encryption: {
    algorithm: 'none',
    password: '',
  },
};

export type PVDRevealerFormProps = Omit<
  FormProps<PVDRevealerFormValue>,
  'defaultValue' | 'children'
>;

const PVDRevealerForm: FunctionComponent<PVDRevealerFormProps> = ({
  onChange,
  onSubmit,
  ...props
}) => {
  const [hasCarrierWithPayload, setHasCarrierWithPayload] = useState(false);
  const carrierWithPayloadCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const transformRawValues = async (
    values: RawPVDRevealerFormValue,
  ): Promise<PVDRevealerFormValue> => {
    if (!values.carrierWithPayload) {
      return values as PVDRevealerFormValue;
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
    <Form<RawPVDRevealerFormValue>
      defaultValue={defaultPVDRevealerFormValue}
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
          pixelated
          hidden={!hasCarrierWithPayload}
          ref={carrierWithPayloadCanvasRef}
        />
        {!hasCarrierWithPayload &&
          'Drop an image here, or click to select image'}
      </FileField>
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
          { name: 'Auto', value: 'auto' },
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ]}
      />
      <EncryptionField name="encryption" />
    </Form>
  );
};

export default PVDRevealerForm;
