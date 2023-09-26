import React, { FunctionComponent } from 'react';
import Form, { FormProps } from '../../forms/Form';
import TextField from '../../forms/TextField';
import TextOrFileField from '../../forms/TextOrFileField';
import EncryptionField, {
  EncryptionFieldValue,
} from '../../forms/EncryptionField';

export interface UnicodeRevealerFormValue {
  carrierWithPayload: Uint8Array | undefined;
  encryption: EncryptionFieldValue;
}

type RawUnicodeRevealerFormValue = UnicodeRevealerFormValue;

const defaultUnicodeRevealerFormValue: RawUnicodeRevealerFormValue = {
  carrierWithPayload: undefined,
  encryption: {
    algorithm: 'none',
    password: '',
  },
};

export interface UnicodeRevealerFormProps
  extends Omit<
    FormProps<UnicodeRevealerFormValue>,
    'defaultValue' | 'children'
  > {
  disabled?: boolean;
}

const UnicodeRevealerForm: FunctionComponent<UnicodeRevealerFormProps> = ({
  disabled,
  ...props
}) => (
  <Form<RawUnicodeRevealerFormValue>
    defaultValue={defaultUnicodeRevealerFormValue}
    {...props}
  >
    <TextOrFileField
      required
      disabled={disabled}
      name="carrierWithPayload"
      label="Text with hidden message"
      accept={{ 'text/plain': ['.txt'] }}
      showLength
      wideScreenCols={12}
    />
    <EncryptionField disabled={disabled} name="encryption" />
  </Form>
);

export default UnicodeRevealerForm;
