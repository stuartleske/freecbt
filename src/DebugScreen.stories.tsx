import React from 'react';
import { storiesOf } from '@storybook/react-native';
import DebugScreen from './DebugScreen'

storiesOf('DebugScreen', module)
.add('default view', () => (
  <DebugScreen version={{timestamp: 1591172459, date: 'Wed, 03 Jun 2020 04:20:59 -0400', hash: '2.2.0-51-g22c6ffd-dirty'}} />
))
