// import

import {hash} from '@sitearcade/uid';
import {isBefore, isAfter, differenceInMilliseconds as diffMs} from 'date-fns';
import * as R from 'ramda';

// vars

const env = process.env.NODE_ENV;

// fns

const ensureArray = (val) => (
  Array.isArray(val) ? val : [val]
);

const parseMatch = (match, sess) =>
  Object.keys(match).every((k) => (
    sess[k] ? R.intersection(
      ensureArray(match[k]),
      ensureArray(sess[k]),
    ).length : false
  ));

const hashPerc = (uid) => hash(uid) % 1000000 / 1000000;

const timeSize = (start, until, now) => (
  diffMs(now, start) / diffMs(until, start)
);

const parseSample = ({key, size, start, until}, sess, uid) => {
  if (!sess[key]) {
    return false;
  }

  if (start && isBefore(sess.date, start)) {
    return false;
  }

  if (until && isAfter(sess.date, until)) {
    return true;
  }

  size = (start && until ? timeSize(start, until, sess.date) : size) ?? 0;

  if (size <= 0) {
    return false;
  }

  return hashPerc(`${uid}-${sess[key]}`) <= size;
};

// export

export function parseFlags(flags = {}, session = {}, force = {}) {
  session = {env, date: Date.now(), ...session};

  const parseRule = (rule, flag) => {
    if (force[flag]) {
      return force[flag];
    }

    const type = R.type(rule);

    return type === 'Boolean' ? rule :
      type === 'String' ? env === rule :
      type === 'Date' ? isAfter(session.date, rule) :
      type === 'Function' ? rule(session) :
      type === 'Object' ? parseAndRule(rule, flag) :
      type === 'Array' ? parseOrRule(rule) :
      false;
  };

  const parseAndRule = ({value, flag, sample, ...match}, uid) => (
    (R.isNil(flag) ? true : parseRule(flag)) &&
    (sample ? parseSample(sample, session, uid) : true) &&
    (R.isEmpty(match) ? true : parseMatch(match, session)) &&
    (value ?? true)
  );

  const parseOrRule = R.reduce((acc, rule) => {
    rule = parseRule(rule);

    return rule === false ? false : R.reduced(rule);
  }, false);

  return R.mapObjIndexed(parseRule, flags);
}
