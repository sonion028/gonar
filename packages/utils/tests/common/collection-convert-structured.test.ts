import { describe, expect, it, vi } from 'vitest';

import { singleton } from '../../src/common/class/class-singleton';
import { RecordTypedMap } from '../../src/common/collection/record-typed-map';
import {
  convertCamel2Pascal,
  convertCamel2Snake,
  convertPascal2Camel,
  convertSnake2Camel,
} from '../../src/common/convert/json-convert';
import {
  deepClone,
  getObjectType,
} from '../../src/common/structured/deep-copy';
import {
  isMap,
  isNil,
  isObject,
  isPlainObject,
  isSet,
} from '../../src/common/structured/helpers';
import { isStructuredEqual } from '../../src/common/structured/is-structured-equal';

describe('RecordTypedMap', () => {
  it('initializes from records and supports typed get/set behavior', () => {
    const map = new RecordTypedMap<{ name: string; count: number }>({
      name: 'tonar',
      count: 1,
    });

    expect(map.get('name')).toBe('tonar');
    expect(map.get('count')).toBe(1);

    map.set('count', 2);
    expect(map.get('count')).toBe(2);
  });
});

describe('json converters', () => {
  it('converts snake case keys to camel case deeply', () => {
    expect(
      convertSnake2Camel({
        user_id: 1,
        profile_info: { first_name: 'Ada' },
        item_list: [{ item_id: 2 }],
      })
    ).toEqual({
      userId: 1,
      profileInfo: { firstName: 'Ada' },
      itemList: [{ itemId: 2 }],
    });
  });

  it('converts camel case keys to snake case deeply and honors ignored keys', () => {
    expect(
      convertCamel2Snake(
        {
          userId: 1,
          profileInfo: { firstName: 'Ada' },
          keepMe: { childName: 'still converted' },
        },
        ['keepMe'] as const
      )
    ).toEqual({
      user_id: 1,
      profile_info: { first_name: 'Ada' },
      keepMe: { child_name: 'still converted' },
    });
  });

  it('converts between camel and pascal keys', () => {
    expect(convertCamel2Pascal({ userName: 'Ada' })).toEqual({
      UserName: 'Ada',
    });
    expect(convertPascal2Camel({ UserName: 'Ada' })).toEqual({
      userName: 'Ada',
    });
  });
});

describe('singleton', () => {
  it('returns the first instance for later constructor calls', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    class Service {
      readonly name: string;

      constructor(name: string) {
        this.name = name;
      }
    }
    const SingletonService = singleton(Service);

    const first = new SingletonService('first');
    const second = new SingletonService('second');

    expect(second).toBe(first);
    expect(second.name).toBe('first');
    expect(second).toBeInstanceOf(Service);
    expect(consoleWarn).toHaveBeenCalledWith(
      'Service为单例构造函数，只能有一个实例'
    );
  });
});

describe('deepClone', () => {
  it('clones arrays, objects, symbol keys and circular references', () => {
    const symbolKey = Symbol('secret');
    const source: Record<string | symbol, unknown> = {
      nested: { value: 1 },
      [symbolKey]: 'symbol-value',
    };
    source.self = source;

    const cloned = deepClone<typeof source, typeof source>(source);

    expect(cloned).not.toBe(source);
    expect(cloned.nested).not.toBe(source.nested);
    expect(cloned[symbolKey]).toBe('symbol-value');
    expect(cloned.self).toBe(cloned);
  });

  it('clones Map, Set, Date and RegExp values', () => {
    const key = { id: 1 };
    const source = {
      date: new Date('2024-01-01T00:00:00.000Z'),
      reg: /abc/g,
      set: new Set([{ value: 1 }]),
      map: new Map([[key, { value: 2 }]]),
    };

    const cloned = deepClone<typeof source, typeof source>(source);

    expect(cloned.date).not.toBe(source.date);
    expect(cloned.date.getTime()).toBe(source.date.getTime());
    expect(cloned.reg.source).toBe(source.reg.source);
    expect([...cloned.set][0]).not.toBe([...source.set][0]);
    expect([...cloned.map.keys()][0]).not.toBe(key);
    expect([...cloned.map.values()][0]).toEqual({ value: 2 });
  });
});

describe('structured helpers', () => {
  it('detects nil, object, plain object, set and map values', () => {
    expect(isNil(null)).toBe(true);
    expect(isNil(undefined)).toBe(true);
    expect(isObject(() => {})).toBe(true);
    expect(isObject(null)).toBe(false);
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
    expect(isSet(new Set())).toBe(true);
    expect(isMap(new Map())).toBe(true);
    expect(getObjectType(new Date())).toBe('Date');
  });
});

describe('isStructuredEqual', () => {
  it('compares primitives, arrays, sets, maps, objects and cycles', () => {
    expect(isStructuredEqual(NaN, NaN)).toBe(true);
    expect(isStructuredEqual([1, 2, 2], [2, 1, 2])).toBe(true);
    expect(isStructuredEqual([1, 2], [2, 1], { ignoreArrayOrder: false })).toBe(
      false
    );
    expect(isStructuredEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true);
    expect(
      isStructuredEqual(new Map([['a', { b: 1 }]]), new Map([['a', { b: 1 }]]))
    ).toBe(true);

    const a: { self?: unknown; value: number } = { value: 1 };
    const b: { self?: unknown; value: number } = { value: 1 };
    a.self = a;
    b.self = b;
    expect(isStructuredEqual(a, b)).toBe(true);
  });

  it('throws for unsupported structured comparison values', () => {
    expect(() =>
      isStructuredEqual(
        () => {},
        () => {}
      )
    ).toThrow(/Functions/);
    expect(() => isStructuredEqual(Symbol('a'), Symbol('a'))).toThrow(
      /Symbols/
    );
    expect(() => isStructuredEqual(new Date(), new Date())).toThrow(
      /plain objects/
    );
  });
});
