// import

import type {ParsedUrlQuery} from 'querystring';

// vars

const keyRx = /^flags?$/;
const preRx = /^flags?:/;
const intRx = /^\d+$/;
const floatRx = /^\d*\.\d+$/;
const commaRx = /[\s,]+/g;

// types

type ParsedValue = boolean | number | string;
export type ParsedQuery = Record<string, ParsedValue>

// fns

const flagNameReducer = (
  acc: ParsedQuery,
  k: string,
): ParsedQuery => ({...acc, [k]: true});

const splitQueryFlags = (val: string | string[] | undefined) => (
  Array.isArray(val) ?
    val.map((v) => v.trim()) :
    val?.trim().split(commaRx) ?? []
).reduce(flagNameReducer, {} as ParsedQuery);

const parseVal = (val: string | string[] | undefined): ParsedValue => {
  val = (Array.isArray(val) ? val[0] : val)?.trim();

  // eslint-disable-next-line no-negated-condition
  return !val ? false :
    val.toLowerCase() === 'true' ? true :
    val.toLowerCase() === 'false' ? false :
    intRx.test(val) ? parseInt(val) :
    floatRx.test(val) ? parseFloat(val) :
    val;
};

// export

export function parseQuery(query: ParsedUrlQuery): ParsedQuery {
  return Object.keys(query).reduce((acc, k) => (
    keyRx.test(k) ? {...acc, ...splitQueryFlags(query[k])} :
    preRx.test(k) ? {...acc, [k.replace(preRx, '')]: parseVal(query[k])} :
    acc
  ), {});
}
