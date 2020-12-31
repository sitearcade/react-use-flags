// vars

const keyRx = /^flags?$/;
const preRx = /^flags?:/;
const intRx = /^\d+$/;
const floatRx = /^\d*\.\d+$/;
const commaRx = /[\s,]+/g;

// fns

const flagNameReducer = (agg, k) => ({...agg, [k]: true});

const splitQueryFlags = (val) => (
  (
    Array.isArray(val) ?
      val.map((v) => v.trim()) :
      val.trim().split(commaRx)
  ).reduce(flagNameReducer, {})
);

const parseVal = (val) => {
  val = val.trim();

  return val.toLowerCase() === 'true' ? true :
    val.toLowerCase() === 'false' ? false :
    intRx.test(val) ? parseInt(val) :
    floatRx.test(val) ? parseFloat(val) :
    val.length ? val : null;
};

// export

export function parseQuery(query = {}) {
  return Object.keys(query).reduce((acc, k) => (
    keyRx.test(k) ? {...acc, ...splitQueryFlags(query[k])} :
    preRx.test(k) ? {...acc, [k.replace(preRx, '')]: parseVal(query[k])} :
    acc
  ), {});
}
