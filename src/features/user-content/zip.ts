/**
 * A tiny, dependency-free ZIP writer (#487). Produces a standard "stored"
 * (uncompressed, method 0) archive so we can package a portable export without
 * adding a zip dependency. Browser-safe: uses only Uint8Array/DataView/
 * TextEncoder, so it runs in the client download path.
 */

export type ZipEntry = { name: string; data: Uint8Array };

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** Build a stored (uncompressed) ZIP archive from the given entries. */
export function createStoreZip(entries: ZipEntry[]): Uint8Array<ArrayBuffer> {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); // local file header signature
    lv.setUint16(4, 20, true); // version needed to extract
    lv.setUint16(6, 0, true); // general purpose flags
    lv.setUint16(8, 0, true); // compression method: store
    lv.setUint16(10, 0, true); // last mod time
    lv.setUint16(12, 0, true); // last mod date
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true); // compressed size
    lv.setUint32(22, size, true); // uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra field length
    local.set(nameBytes, 30);
    chunks.push(local, entry.data);

    const cd = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true); // central directory header signature
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // extra length
    cv.setUint16(32, 0, true); // comment length
    cv.setUint16(34, 0, true); // disk number start
    cv.setUint16(36, 0, true); // internal attributes
    cv.setUint32(38, 0, true); // external attributes
    cv.setUint32(42, offset, true); // relative offset of local header
    cd.set(nameBytes, 46);
    central.push(cd);

    offset += local.length + entry.data.length;
  }

  const centralSize = central.reduce((n, c) => n + c.length, 0);
  const centralOffset = offset;

  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); // end of central directory signature
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, centralOffset, true);
  ev.setUint16(20, 0, true); // comment length

  const all = [...chunks, ...central, end];
  const total = all.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const part of all) {
    out.set(part, pos);
    pos += part.length;
  }
  return out;
}
