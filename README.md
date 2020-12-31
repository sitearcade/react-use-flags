# @sitearcade/react-use-flags

> React support for feature flags.

## Installation

1. `npm i -D @sitearcade/react-use-flags`
2. See usage...

## Usage

First thing, install the FlagsProvider at the top of your app:

```js

import {useMemo} from 'react';
import {FlagsProvider} from '@sitearcade/react-use-flags';
import {useRouter} from 'next/router`;

const flags = {
  newHeader: new Date('2000-01-01'),
};

function App({userId}) {
  const router = useRouter();
  const session = useMemo(() => ({userId}), [userId]);

  return (
    <FlagsProvider 
      flags={flags} 
      session={session} 
      query={router.query}
    >
      <AllThatAppStuff/>
    </FlagsProvider>
  );
}
```

Then use the hook:

```js
import {useFlags} from '@sitearcade/react-use-flags';

function AppHeader({}) {
  const {newHeader} = useFlags();

  return newHeader ? <NewHeader/> : <OldHeader/>;
}
```

### Configuring Flags

Your flags object can be configured a lot of different ways. Here's the easy ones:

```js
const flags = {
  boolTrue: true,
  boolFalse: false,

  envTrue: 'testing',
  envFalse: 'production',

  dateTrue: new Date('2000-01-01'),
  dateFalse: new Date('3000-01-01'),

  funcTrue: () => true,
  funcFalse: () => false,
};
```

Functions accept the session object you pass to the FlagsProvider:

```js
const flags = {
  isLoggedIn: ({userId}) => !!userId,
  isEarlyUser: ({userId}) => userId < 1000,

  // with some additional props...
  isDev: ({env}) => env === 'development',
  // constant date so you don't end up with weird edge cases...
  aprilFool: ({date}) => date.toString().includes('04-01T'),

  // but the sky's the limit...
  coinToss: () => Math.random() < 0.5,
};
```

However the vanilla syntax supports a lot out of the box, so you can use other syntax to store your flags. Like YAML:

```yaml
# flags.yaml

# arrays are `or` gates
alwaysDevOrProdAfter:
  - development
  - 2000-01-01

# objects are `and` gates
serviceTier:
  userLoggedIn: 

# objects can sample based on unique id
onePercent:
  sample:
    key: userId
    size: 0.1

# and samples can grow over period of time
rollOutSlowly:
  sample:
    key: userId
    start: 2000-01-01
    until: 2000-01-31
```
