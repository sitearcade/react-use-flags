// import

import type {ParsedUrlQuery} from 'querystring';

import {useMemo, createContext, useContext, PropsWithChildren} from 'react';

import {FlagRules, parseFlags, RawSession} from './parseFlags';
import {parseQuery} from './parseQuery';

// types

type FlagProps = PropsWithChildren<{
  flags: FlagRules;
  session: RawSession;
  query: ParsedUrlQuery;
}>

// context

const FlagsContext = createContext({});

// hooks

export function useFlags() {
  return useContext(FlagsContext);
}

// component

export function FlagsProvider({flags, session, query, ...rest}: FlagProps) {
  return (
    <FlagsContext.Provider
      {...rest}
      value={useMemo(() => (
        parseFlags(flags, session, parseQuery(query))
      ), [flags, session])}
    />
  );
}
