// import

import type {ParsedUrlQuery} from 'querystring';

import constate from 'constate';
import {useMemo} from 'react';

import {FlagRules, parseFlags, SessionMeta} from './parseFlags';
import {parseQuery} from './parseQuery';

// types

type FlagProps = {
  flags?: FlagRules;
  session?: SessionMeta;
  query?: ParsedUrlQuery;
}

// context

function FlagsContext({flags, session, query}: FlagProps) {
  return useMemo(() => (
    parseFlags(flags, session, parseQuery(query))
  ), [flags, session]);
}

export const [FlagsProvider, useFlags] = constate(FlagsContext);
