// import

import type {FlagRules, SessionMeta, Flags} from './parseFlags';
import type {ParsedUrlQuery} from 'querystring';

import constate from 'constate';
import {useMemo} from 'react';

import {parseFlags} from './parseFlags';
import {parseQuery} from './parseQuery';

// types

type FlagProps = {
  flags?: Flags;
  rules?: FlagRules;
  session?: SessionMeta;
  query?: ParsedUrlQuery;
};

// context

function FlagsContext(props: FlagProps) {
  const {flags, rules, session, query} = props;

  return useMemo(() => (
    flags ?? parseFlags(rules, session, parseQuery(query))
  ), [flags, rules, session]);
}

export const useFlagRules = FlagsContext;
export const [FlagsProvider, useFlags] = constate(FlagsContext);
