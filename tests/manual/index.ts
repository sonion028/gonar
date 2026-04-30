import {
  convertCamel2Pascal,
  convertPascal2Camel,
  convertCamel2Snake,
  convertSnake2Camel,
} from '../src/utils';

const testObj = {
  camelCaseKey: 'value',
  PascalCaseKey: 'value',
  snake_case_key: 'value',
  nestedObj: {
    camelCaseKey2: 'value',
    PascalCaseKe5y2: 'value',
    snake_ca6se_key2: 'value',
    nextArray: [
      {
        camelCaseKey: 'value',
        PascalCaseKey: 'value',
        snake_case_key: 'value',
      },
    ],
  },
};

const testObjSnake = convertCamel2Snake([testObj, testObj.nestedObj]);
const ignoreKeys = ['pascal_case_ke5y2', 'deep_key'] as const;
const testObjCamel = convertSnake2Camel(testObjSnake, ignoreKeys);
const testObjPascal = convertCamel2Pascal(testObj);
const testObjCamel2 = convertPascal2Camel(testObjPascal);

console.clog('testObjSnake:', testObjSnake);
console.clog('testObjCamel:', testObjCamel);
console.clog('testObjPascal:', testObjPascal);
console.clog('testObjCamel2:', testObjCamel2);
