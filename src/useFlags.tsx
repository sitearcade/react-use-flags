// import

import type {ParsedUrlQuery} from 'querystring';

import {useMemo, createContext, useContext, PropsWithChildren} from 'react';

import {FlagRules, parseFlags, SessionMeta, Flags} from './parseFlags';
import {parseQuery} from './parseQuery';

// types

type FlagProps<T> = PropsWithChildren<{
  flags?: FlagRules<T>;
  session?: SessionMeta;
  query?: ParsedUrlQuery;
}>

// context

const FlagsContext = createContext<Flags>({});

// hooks

export function useFlags(): Flags {
  return useContext(FlagsContext);
}

// component

export function FlagsProvider<T>({flags, session, query, ...rest}: FlagProps<T>) {
  return (
    <FlagsContext.Provider
      {...rest}
      value={useMemo(() => (
        parseFlags(flags, session, parseQuery(query))
      ), [flags, session])}
    />
  );
}
