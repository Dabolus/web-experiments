import { FunctionalComponent, h } from 'preact';
import { useMemo } from 'preact/hooks';
import qr from 'qr.js';
import { EUDCCDataOutput } from '../utils/extractor';
import { stringify } from '../utils/helpers';
import classes from './EUDCCRawTab.module.scss';

export interface EUDCCRawTabProps {
  value: EUDCCDataOutput;
}

const EUDCCRawTab: FunctionalComponent<EUDCCRawTabProps> = ({
  value: { raw, base45, compressed, cose, cbor, content },
}) => {
  const qrCode = useMemo(() => {
    const { modules } = qr(raw);

    return (
      <svg
        viewBox={`0 0 ${modules.length} ${modules.length}`}
        aria-labelledby="qrcode-label"
        aria-describedby="qrcode-diff-explanation"
      >
        {modules.map((row, y) =>
          row.map((cell, x) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={cell ? '#000' : '#fff'}
            />
          )),
        )}
      </svg>
    );
  }, [raw]);

  return (
    <div className={classes.rawData}>
      <label id="qrcode-label">QR Code</label>
      {qrCode}
      <p id="qrcode-diff-explanation">
        Note that the QR Code is intrinsically non-deterministic, so it might
        look slightly different from the one you read. However, the data
        contained in it is exactly the same.
      </p>
      <label id="raw-label">Raw</label>
      <pre aria-labelledby="raw-label">{raw}</pre>
      <label id="base45-label">Base45</label>
      <pre aria-labelledby="base45-label">{base45}</pre>
      <label id="compressed-label">Compressed</label>
      <pre aria-labelledby="compressed-label">{stringify(compressed)}</pre>
      <label id="cose-label">COSE</label>
      <pre aria-labelledby="cose-label">{stringify(cose)}</pre>
      <label id="cbor-label">CBOR</label>
      <pre aria-labelledby="cbor-label">{stringify(cbor)}</pre>
      <label id="content-label">Content</label>
      <pre aria-labelledby="content-label">{stringify(content)}</pre>
    </div>
  );
};

export default EUDCCRawTab;
