/* eslint-disable ramda/prefer-ramda-boolean */

// import

import {dateMock} from '@sitearcade/jest-preset/tools';

import {parseFlags} from './parseFlags';

// fns

const alwaysTrue = () => true;
const alwaysFalse = () => false;
const past = new Date('1000-01-01');
const future = new Date('3000-01-01');

// test

beforeAll(() => dateMock.advanceTo(new Date('2000-01-01')));

describe('parseFlags(flags, session, force)', () => {
  it('fails gracefully', () => {
    expect(parseFlags()).toMatchInlineSnapshot('Object {}');
  });

  it('supports basic functionality', () => {
    expect(
      parseFlags({
        boolTrue: true,
        boolFalse: false,

        envTrue: 'testing',
        envFalse: 'production',

        dateTrue: past,
        dateFalse: future,

        funcTrue: alwaysTrue,
        funcFalse: alwaysFalse,

        invalid: null,
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "boolFalse": false,
        "boolTrue": true,
        "dateFalse": false,
        "dateTrue": true,
        "envFalse": false,
        "envTrue": true,
        "funcFalse": false,
        "funcTrue": true,
        "invalid": false,
      }
    `);
  });

  it('supports forced overrides', () => {
    expect(
      parseFlags(
        {
          boolTrue: true,
          boolFalse: false,

          envTrue: 'testing',
          envFalse: 'production',

          dateTrue: past,
          dateFalse: future,

          funcTrue: alwaysTrue,
          funcFalse: alwaysFalse,

          invalid: null,
        },
        {},
        {invalid: true, boolFalse: true, envFalse: 'string'},
      ),
    ).toMatchInlineSnapshot(`
      Object {
        "boolFalse": true,
        "boolTrue": true,
        "dateFalse": false,
        "dateTrue": true,
        "envFalse": "string",
        "envTrue": true,
        "funcFalse": false,
        "funcTrue": true,
        "invalid": true,
      }
    `);
  });

  it('supports array rules as `or` gates', () => {
    expect(
      parseFlags(
        {
          bools: [true, false],
          dates: [past, future],
          envs: ['testing', 'production'],
          funcs: [alwaysFalse, alwaysTrue],
          invalid: [null, undefined],

          flags: [{flag: true}, {flag: 'production'}],
          sessions: [{unreal: 'any value'}, {tier: 'debut'}],
        },
        {tier: 'debut'},
      ),
    ).toMatchInlineSnapshot(`
      Object {
        "bools": true,
        "dates": true,
        "envs": true,
        "flags": true,
        "funcs": true,
        "invalid": false,
        "sessions": true,
      }
    `);
  });

  it('supports object rules as `and` gates', () => {
    expect(
      parseFlags(
        {
          flagTrue: {flag: true},
          flagEnvFalse: {flag: 'production'},
          flagDateFalse: {flag: past},
          flagFuncTrue: {flag: alwaysTrue},

          sessStrStrTrue: {tier: 'debut'},
          sessArrStrTrue: {tier: ['debut', 'midlist']},
          sessStrArrTrue: {env: 'testing'},
          sessArrArrTrue: {env: ['testing', 'production']},

          sessAndTrue: {tier: 'debut', env: 'testing'},
          sessAndFalse: {tier: 'debut', env: 'development'},

          sessMissing: {unreal: 'any value'},
        },
        {
          tier: 'debut',
          env: ['testing', 'production'],
        },
      ),
    ).toMatchInlineSnapshot(`
      Object {
        "flagDateFalse": true,
        "flagEnvFalse": false,
        "flagFuncTrue": true,
        "flagTrue": true,
        "sessAndFalse": false,
        "sessAndTrue": true,
        "sessArrArrTrue": true,
        "sessArrStrTrue": true,
        "sessMissing": false,
        "sessStrArrTrue": true,
        "sessStrStrTrue": true,
      }
    `);
  });

  it('allows `value` in place of boolean state', () => {
    expect(
      parseFlags({
        withValueTrue: {flag: true, value: 'value'},
        withValueFalse: {flag: false, value: 'value'},
        arrayFirst: [
          {flag: true, value: 'first'},
          {flag: true, value: 'second'},
        ],
        arraySecond: [
          {flag: false, value: 'first'},
          {flag: true, value: 'second'},
        ],
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "arrayFirst": "first",
        "arraySecond": "second",
        "withValueFalse": false,
        "withValueTrue": "value",
      }
    `);
  });

  it('supports sampling by `key` with `size`, `start`, and/or `until`', () => {
    const flags = {
      empty: {sample: {}},
      onlyKey: {sample: {key: 'userId'}},

      keySize0: {sample: {key: 'userId', size: 0}},
      keySize05: {sample: {key: 'userId', size: 0.5}},
      keySize1: {sample: {key: 'userId', size: 1}},

      keyStartPast: {sample: {key: 'userId', size: 1, start: past}},
      keyStartFuture: {sample: {key: 'userId', size: 1, start: future}},

      keyUntilPast: {sample: {key: 'userId', size: 0, until: past}},
      keyUntilFuture: {sample: {key: 'userId', size: 0, until: future}},

      keyRange: {sample: {key: 'userId', start: past, until: future}},
      keyRangeSizeIgnored: {
        sample: {key: 'userId', size: 0, start: past, until: future},
      },
    };

    expect(parseFlags(flags)).toMatchInlineSnapshot(`
      Object {
        "empty": false,
        "keyRange": false,
        "keyRangeSizeIgnored": false,
        "keySize0": false,
        "keySize05": false,
        "keySize1": false,
        "keyStartFuture": false,
        "keyStartPast": false,
        "keyUntilFuture": false,
        "keyUntilPast": false,
        "onlyKey": false,
      }
    `);

    expect(parseFlags(flags, {userId: 'q7MCcx3PrsDR'}))
      .toMatchInlineSnapshot(`
      Object {
        "empty": false,
        "keyRange": true,
        "keyRangeSizeIgnored": false,
        "keySize0": false,
        "keySize05": true,
        "keySize1": true,
        "keyStartFuture": false,
        "keyStartPast": true,
        "keyUntilFuture": false,
        "keyUntilPast": true,
        "onlyKey": false,
      }
    `);

    expect(parseFlags(flags, {userId: 'EvS3ZkD87nCG'}))
      .toMatchInlineSnapshot(`
      Object {
        "empty": false,
        "keyRange": true,
        "keyRangeSizeIgnored": true,
        "keySize0": false,
        "keySize05": true,
        "keySize1": true,
        "keyStartFuture": false,
        "keyStartPast": true,
        "keyUntilFuture": false,
        "keyUntilPast": true,
        "onlyKey": false,
      }
    `);

    expect(parseFlags(flags, {userId: 'kzwsV6mPiNPx'}))
      .toMatchInlineSnapshot(`
      Object {
        "empty": false,
        "keyRange": false,
        "keyRangeSizeIgnored": false,
        "keySize0": false,
        "keySize05": true,
        "keySize1": true,
        "keyStartFuture": false,
        "keyStartPast": true,
        "keyUntilFuture": false,
        "keyUntilPast": true,
        "onlyKey": false,
      }
    `);

    expect(parseFlags(flags, {userId: 'SeEy0CDOqAhb'}))
      .toMatchInlineSnapshot(`
      Object {
        "empty": false,
        "keyRange": true,
        "keyRangeSizeIgnored": true,
        "keySize0": false,
        "keySize05": true,
        "keySize1": true,
        "keyStartFuture": false,
        "keyStartPast": true,
        "keyUntilFuture": false,
        "keyUntilPast": true,
        "onlyKey": false,
      }
    `);
  });
});
