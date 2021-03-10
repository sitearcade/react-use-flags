// import

import type {ParsedUrlQuery} from 'querystring';

import constate from 'constate';
import {useMemo} from 'react';

import {FlagRules, parseFlags, SessionMeta, Flags} from './parseFlags';
import {parseQuery} from './parseQuery';

// types

type FlagProps = {
  flags?: Flags;
  rules?: FlagRules;
  session?: SessionMeta;
  query?: ParsedUrlQuery;
}

// context

function FlagsContext({flags, rules, session, query}: FlagProps) {
  return useMemo(() => (
    flags ?? parseFlags(rules, session, parseQuery(query))
  ), [flags, rules, session]);
}

export const useFlagRules = FlagsContext;
export const [FlagsProvider, useFlags] = constate(FlagsContext);
