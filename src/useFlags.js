// import

import constate from 'constate';
import {useMemo} from 'react';

import {parseFlags} from './parseFlags';
import {parseQuery} from './parseQuery';

// context

function FlagsContext({flags, session, query}) {
  return useMemo(() => (
    parseFlags(flags, session, parseQuery(query))
  ), [flags, session, query]);
}

export const [
  FlagsProvider,
  useFlags,
] = constate(FlagsContext);
