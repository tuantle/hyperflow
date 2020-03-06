/**
 * Copyright 2018-present Tuan Le.
 *
 * Licensed under the MIT License.
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://opensource.org/licenses/mit-license.html
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *------------------------------------------------------------------------
 *
 * @module Hyperflow (Hf)
 * @description - A javascript state flow and mutation management toolkit & library for developing universal app.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV
} from '../libs/utils/common-util';

import Composer from './composer';
import Composite from './composite';

import Domain from './factories/domain-factory';
import Store from './factories/store-factory';
import Interface from './factories/interface-factory';
import Service from './factories/service-factory';
import TestAgent from './factories/test-agent-factory';

const Hf = {
    ENV,
    VERSION: `0.3.0-rc2`,

    Composer,
    Composite,

    Domain,
    Store,
    Interface,
    Service,
    TestAgent
};

export default Hf;
