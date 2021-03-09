// import

import {parseQuery} from './parseQuery';

// test

describe('parseQuery()', () => {
  it('fails gracefully', () => {
    expect(parseQuery({})).toMatchInlineSnapshot('Object {}');
  });

  it('supports `flag` and `flags` keys', () => {
    expect(
      parseQuery({
        skip: 'this',
        flag: 'one, two ,three',
        flags: ['four', 'five', 'six'],
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "five": true,
        "four": true,
        "one": true,
        "six": true,
        "three": true,
        "two": true,
      }
    `);
  });

  it('supports `flag:` and `flags:` prefixes', () => {
    expect(
      parseQuery({
        'skip': 'this',
        'flag:false': 'false',
        'flag:string': 'string',
        'flag:true': 'true',
        'flags:float': '1.23',
        'flags:int': '4',
        'flags:null': '',
      }),
    ).toMatchInlineSnapshot(`
      Object {
        "false": false,
        "float": 1.23,
        "int": 4,
        "null": false,
        "string": "string",
        "true": true,
      }
    `);
  });
});
