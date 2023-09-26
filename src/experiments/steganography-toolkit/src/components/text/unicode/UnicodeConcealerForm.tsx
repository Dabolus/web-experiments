import React, { FunctionComponent } from 'react';
import Form, { FormProps } from '../../forms/Form';
import TextField from '../../forms/TextField';
import TextOrFileField from '../../forms/TextOrFileField';
import EncryptionField, {
  EncryptionFieldValue,
} from '../../forms/EncryptionField';

export interface UnicodeConcealerFormValue {
  carrier: string;
  payload: Uint8Array | undefined;
  encryption: EncryptionFieldValue;
}

type RawUnicodeConcealerFormValue = UnicodeConcealerFormValue;

const defaultUnicodeConcealerFormValue: RawUnicodeConcealerFormValue = {
  carrier: '',
  payload: undefined,
  encryption: {
    algorithm: 'none',
    password: '',
  },
};

export interface UnicodeConcealerFormProps
  extends Omit<
    FormProps<UnicodeConcealerFormValue>,
    'defaultValue' | 'children'
  > {
  disabled?: boolean;
}

const UnicodeConcealerForm: FunctionComponent<UnicodeConcealerFormProps> = ({
  disabled,
  ...props
}) => (
  <Form<RawUnicodeConcealerFormValue>
    defaultValue={defaultUnicodeConcealerFormValue}
    {...props}
  >
    <TextField
      multiline
      required
      rows={8}
      disabled={disabled}
      name="carrier"
      label="Text in which to hide the message"
      showLength
    />
    <TextOrFileField
      required
      disabled={disabled}
      name="payload"
      label="Text to hide"
      showLength
    />
    <EncryptionField disabled={disabled} name="encryption" />
  </Form>
);

export default UnicodeConcealerForm;
