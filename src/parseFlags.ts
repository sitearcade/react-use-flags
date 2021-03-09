// import

import {hash} from '@sitearcade/uid';
import {isBefore, isAfter, differenceInMilliseconds as diffMs, isValid as isDate} from 'date-fns';
import * as R from 'ramda';

import {ParsedQuery} from './parseQuery';

// types

type Sample = {
  key?: string;
  size?: number;
  start?: Date;
  until?: Date;
};

type FuncRule<T = any> = (sess: Session & T) => FlagValue;
type PlainRule<T = any> = FuncRule<T> | string | number | Date | boolean | null;
type OrRule = Array<FlagRule>;
type AndRule = {
  [index: string]: unknown;
  rule?: FlagRule;
  value?: FlagValue;
  sample?: Sample | number;
};

export type Flags = Record<FlagName, FlagValue>;
export type FlagRules<T = any> = Record<FlagName, FlagRule<T>>;
export type FlagName = string;
export type FlagRule<T = any> = PlainRule<T> | AndRule | OrRule;
export type FlagValue = string | number | boolean;

export type SessionMeta = Record<string, unknown>;
export type Session = {date: number; env: string;};

// vars

const env = process.env.NODE_ENV || 'development';

// fns

const ensureArray = (val: unknown) => (
  Array.isArray(val) ? val : [val]
);

const parseMatch = (match: SessionMeta, sess: Session) =>
  Object.keys(match).every((k) => (
    sess[k] ? R.intersection(
      ensureArray(match[k]),
      ensureArray(sess[k]),
    ).length : false
  ));

const hashPerc = (str: string) =>
  hash(str) % 1000000 / 1000000;

const timeSize = (start: Date, until: Date, now: Date | number) =>
  diffMs(now, start) / diffMs(until, start);

const cleanSample = (sample: Sample | number) => (
  typeof sample === 'number' ? {size: sample} : sample
);

const parseSample = (
  {key, size, start, until}: Sample,
  sess: Session,
  name: FlagName,
) => {
  if (key && !sess[key]) {
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

  return hashPerc(key ? `${name}-${sess[key]}` : name) <= size;
};

// export

export function parseFlags(
  flagRules: FlagRules = {},
  sessionMeta: SessionMeta = {},
  query: ParsedQuery = {},
): Flags {
  const session: Session = {env, date: Date.now(), ...sessionMeta};

  const parseRule = (rule: FlagRule, name: FlagName): FlagValue => {
    if (name && query[name]) {
      return query[name];
    }

    if (R.isNil(rule)) {
      return false;
    } else if (typeof rule === 'boolean') {
      return rule;
    } else if (typeof rule === 'string') {
      return env === rule;
    } else if (typeof rule === 'function') {
      return rule(session);
    } else if (isDate(rule)) {
      return isAfter(session.date, rule as Date);
    } else if (Array.isArray(rule)) {
      return parseOrRule(rule, name);
    } else if (typeof rule === 'object') {
      return parseAndRule(rule as AndRule, name);
    }

    return false;
  };

  const parseAndRule = (
    {value, rule, sample, ...match}: AndRule,
    name: FlagName,
  ): FlagValue => (
    (R.isNil(rule) ? true : parseRule(rule, name)) &&
    (R.isNil(sample) ? true : parseSample(cleanSample(sample), session, name)) &&
    (R.isEmpty(match) ? true : parseMatch(match, session)) &&
    (value ?? true)
  );

  const parseOrRule = (rules: OrRule, name: FlagName): FlagValue =>
    rules.reduce((acc: FlagValue, rule) => (
      acc === false ? parseRule(rule, name) : acc
    ), false);

  return Object.keys(flagRules).reduce((acc, name) => {
    acc[name] = parseRule(flagRules[name], name);

    return acc;
  }, {});
}
