interface StructuredCloneOptions {
  transfer?: ArrayBuffer[];
}

// const buffer = new ArrayBuffer(16); // 16 字节的底层存储

// // —— TypedArray：按固定宽度解释字节，读写同一类型的元素 ——
// const u8 = new Uint8Array(buffer);              // 16 个元素，占满整个 buffer
// const i32 = new Int32Array(buffer);             // 4 个元素，每个 4 字节
// const f64 = new Float64Array(buffer, 8);        // 从第 8 字节开始（byteOffset=8）
// const u16 = new Uint16Array(buffer, 4, 3);      // 偏移 4 字节，只取 3 个元素

// // 也可以不传 buffer，直接按长度创建（内部自建 buffer）：
// const arr = new Uint8Array(10);                 // 自带 10 字节的 buffer

// // —— DataView：自由按任意宽度/偏移读写，适合混合类型 ——
// const view = new DataView(buffer, 0, 16);       // 可指定起始偏移和长度
// view.setInt32(0, 1234);                         // 在偏移 0 写一个 int32
// view.setUint8(4, 0xff);                         // 在偏移 4 写一个字节
// view.setFloat64(8, 3.14);                       // 在偏移 8 写一个 double
// view.getInt32(0);                               // 读回来 → 1234
// // 读取还可以指定字节序（默认大端）：
// view.getInt32(0, true);                         // little-endian 读取

/** structuredClone 的 transfer 支持：仅 ArrayBuffer，其余可转移对象不支持 */
export const createTransferClone = (options?: StructuredCloneOptions) => {
  const pending = new Set(options?.transfer ?? []);
  const moved = new Map<ArrayBuffer, ArrayBuffer>(); // 同一 buffer 多处引用只转移一次

  const isTransferable = (val: unknown): val is ArrayBuffer =>
    val instanceof ArrayBuffer;

  const walkTransferClone = (val: ArrayBuffer): ArrayBuffer => {
    if (pending.has(val)) {
      pending.delete(val);
      // @ts-ignore ArrayBuffer.transfer 是ES2024 新增的方法
      const next = val?.transfer?.() ?? val; // 原对象自动 detach
      moved.set(val, next);
      return next;
    }
    if (moved.has(val)) return moved.get(val) as ArrayBuffer; // 复用已转移结果

    if (val instanceof ArrayBuffer) return val.slice(0);
    if (ArrayBuffer.isView(val)) {
      const buffer = val.buffer.slice(0); // 先克隆整个底层 buffer
      return val instanceof DataView
        ? new DataView(buffer, val.byteOffset, val.byteLength)
        : new (val.constructor as any)(buffer, val.byteOffset, val.length);
    }
    // SharedArrayBuffer 不可克隆，原生会抛 DataCloneError，deepClone 里应原样返回或抛错
    return val;
  };

  const endCheck = () => {
    if (pending.size > 0) {
      throw new TypeError('transfer 数组中存在未出现在 value 里的对象'); // 对应原生 DataCloneError
    }
  };
  return {
    isTransferable,
    walkTransferClone,
    endCheck,
  };
};
