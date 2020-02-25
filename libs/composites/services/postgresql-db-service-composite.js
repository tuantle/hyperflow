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
 * @module PostgreSQLDBServiceComposite
 * @description - A postgresql db service composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

/* load node postgres driver */
import pg from 'pg';

/* load query string builder */
import sql from 'squel';

import {
    ENV,
    isString,
    isDefined,
    isFunction,
    isObject,
    isSchema,
    log
} from '../../utils/common-util';

import Composite from '../../../src/composite';

export default Composite({
    template: {
        /**
         * @description - Initialized and check that service is valid for this composite.
         *
         * @method $initPostgreSQLDBServiceComposite
         * @return void
         */
        $initPostgreSQLDBServiceComposite () {
            const service = this;
            if (ENV.DEVELOPMENT) {
                if (!isSchema({
                    name: `string`,
                    type: `string`,
                    dbServer: {
                        name: `string`
                    },
                    dbServerUrl: `string`
                }).of(service) || service.type !== `service`) {
                    log(`error`, `PostgreSQLDBServiceComposite.$init - Service is invalid. Cannot apply composite.`);
                }
            }
        },

        /**
         * @description - From database, do query.
         *
         * @method from
         * @param {string} tableName
         * @return {object}
         */
        from (tableName) {
            const service = this;

            if (ENV.DEVELOPMENT) {
                if (!isString(tableName)) {
                    log(`error`, `PostgreSQLDBServiceComposite.from - Input table name is invalid.`);
                }
            }

            const {
                dbServer,
                dbServerUrl
            } = service;
            const dbName = dbServer.name;
            const sqlPostgres = sql.useFlavour(`postgres`);

            if (ENV.DEVELOPMENT) {
                if (!isDefined(sqlPostgres)) {
                    log(`error`, `PostgreSQLDBServiceComposite.from - Postgres driver or squel builder provider is invalid.`);
                }
            }

            return {
                /**
                 * @description - Do select query on data base.
                 *
                 * @param {function} sqlCreate
                 * @method from.select
                 */
                select (sqlCreate) {
                    if (ENV.DEVELOPMENT) {
                        if (!isFunction(sqlCreate)) {
                            log(`error`, `PostgreSQLDBServiceComposite.from.select - Input squel function is invalid.`);
                        }
                    }
                    return new Promise((resolve, reject) => {
                        pg.connect(dbServerUrl, (error, client, done) => {
                            if (error) {
                                reject(new Error(`ERROR: Unable to connect to database:${dbName}, ${error.message}`));
                            } else {
                                const results = [];
                                /* do sql query select */
                                const statementSQL = sqlCreate(sqlPostgres.select({
                                    separator: `\n`,
                                    autoQuoteFieldNames: true,
                                    nameQuoteCharacter: `"`,
                                    tableAliasQuoteCharacter: `|`,
                                    fieldAliasQuoteCharacter: `~`
                                }).from(tableName));
                                if (!isObject(statementSQL)) {
                                    reject(new Error(`ERROR: SQL statement object is invalid.`));
                                } else {
                                    const selectQuery = client.query(statementSQL.toParam());
                                    log(`info0`, `Submitted query statement:${statementSQL.toString()}.`);
                                    /* stream results back one row at a time */
                                    selectQuery.on(`row`, (row) => results.push(row));

                                    /* after all data is returned, close connection and resolve results */
                                    selectQuery.on(`end`, () => {
                                        // client.end();
                                        resolve(results);
                                        /* call `done()` to release the client back to the pool */
                                        done();
                                    });

                                    selectQuery.on(`error`, (_error) => {
                                        reject(new Error(`ERROR: Unable to query table:${dbName}.${tableName}, ${_error.message}`));
                                    });
                                }
                            }
                        });
                    });
                },
                /**
                 * @description - Do insert query on data base.
                 *
                 * @param {function} sqlCreate
                 * @method from.update
                 */
                update (sqlCreate) {
                    if (ENV.DEVELOPMENT) {
                        if (!isFunction(sqlCreate)) {
                            log(`error`, `PostgreSQLDBServiceComposite.from.update - Input squel function is invalid.`);
                        }
                    }

                    return new Promise((resolve, reject) => {
                        pg.connect(dbServerUrl, (error, client, done) => {
                            if (error) {
                                reject(new Error(`ERROR: Unable to connect to database:${dbName}, ${error.message}`));
                            } else {
                                const results = [];
                                /* do sql query update */
                                const statementSQL = sqlCreate(sqlPostgres.update({
                                    separator: `\n`,
                                    autoQuoteFieldNames: true,
                                    nameQuoteCharacter: `"`,
                                    tableAliasQuoteCharacter: `|`,
                                    fieldAliasQuoteCharacter: `~`
                                }).table(tableName));
                                if (!isObject(statementSQL)) {
                                    reject(new Error(`ERROR: SQL statement object is invalid.`));
                                } else {
                                    const updateQuery = client.query(statementSQL.returning(`*`).toParam());
                                    log(`info0`, `Submitted query statement:${statementSQL.toString()}.`);

                                    updateQuery.on(`row`, (row) => results.push(row));

                                    /* after data is updated, close connection and resolve the Id */
                                    updateQuery.on(`end`, () => {
                                        // client.end();
                                        resolve(results);
                                        /* call `done()` to release the client back to the pool */
                                        done();
                                    });

                                    updateQuery.on(`error`, (_error) => {
                                        reject(new Error(`ERROR: Unable to query table:${dbName}.${tableName}, ${_error.message}`));
                                    });
                                }
                            }
                        });
                    });
                },
                /**
                 * @description - Do insert query on data base.
                 *
                 * @param {function} sqlCreate
                 * @method from.insert
                 */
                insert (sqlCreate) {
                    if (ENV.DEVELOPMENT) {
                        if (!isFunction(sqlCreate)) {
                            log(`error`, `PostgreSQLDBServiceComposite.from.insert - Input squel function is invalid.`);
                        }
                    }

                    return new Promise((resolve, reject) => {
                        pg.connect(dbServerUrl, (error, client, done) => {
                            if (error) {
                                reject(new Error(`ERROR: Unable to connect to database:${dbName}, ${error.message}`));
                            } else {
                                const results = [];
                                /* do sql query insert */
                                const statementSQL = sqlCreate(sqlPostgres.insert({
                                    separator: `\n`,
                                    autoQuoteFieldNames: true,
                                    nameQuoteCharacter: `"`,
                                    tableAliasQuoteCharacter: `|`,
                                    fieldAliasQuoteCharacter: `~`
                                }).into(tableName));
                                if (!isObject(statementSQL)) {
                                    reject(new Error(`ERROR: SQL statement object is invalid.`));
                                } else {
                                    const insertQuery = client.query(statementSQL.returning(`*`).toParam());
                                    log(`info0`, `Submitted query statement:${statementSQL.toString()}.`);

                                    insertQuery.on(`row`, (row) => results.push(row));

                                    /* after data is inserted, close connection and resolve the Id */
                                    insertQuery.on(`end`, () => {
                                        // client.end();
                                        resolve(results);
                                        /* call done to release the client back to the pool */
                                        done();
                                    });

                                    insertQuery.on(`error`, (_error) => {
                                        reject(new Error(`ERROR: Unable to query table:${dbName}.${tableName}, ${_error.message}`));
                                    });
                                }
                            }
                        });
                    });
                },
                /**
                 * @description - Do delete query on data base.
                 *
                 * @param {function} sqlCreate
                 * @method from.delete
                 */
                delete (sqlCreate) {
                    if (ENV.DEVELOPMENT) {
                        if (!isFunction(sqlCreate)) {
                            log(`error`, `PostgreSQLDBServiceComposite.from.delete - Input squel function is invalid.`);
                        }
                    }

                    return new Promise((resolve, reject) => {
                        pg.connect(dbServerUrl, (error, client, done) => {
                            if (error) {
                                reject(new Error(`ERROR: Unable to connect to database:${dbName}, ${error.message}`));
                            } else {
                                const results = [];
                                /* do sql query delete */
                                const statementSQL = sqlCreate(sqlPostgres.delete({
                                    separator: `\n`,
                                    autoQuoteFieldNames: true,
                                    nameQuoteCharacter: `"`,
                                    tableAliasQuoteCharacter: `|`,
                                    fieldAliasQuoteCharacter: `~`
                                }).from(tableName));
                                if (!isObject(statementSQL)) {
                                    reject(new Error(`ERROR: SQL statement object is invalid.`));
                                } else {
                                    const deleteQuery = client.query(statementSQL.returning(`*`).toParam());
                                    log(`info0`, `Submitted query statement:${statementSQL.toString()}.`);

                                    deleteQuery.on(`row`, (row) => results.push(row));

                                    /* after data is deleted, close connection and resolve the Id */
                                    deleteQuery.on(`end`, () => {
                                        // client.end();
                                        resolve(results);
                                        /* call done to release the client back to the pool */
                                        done();
                                    });

                                    deleteQuery.on(`error`, (_error) => {
                                        reject(new Error(`ERROR: Unable to query table:${dbName}.${tableName}, ${_error.message}`));
                                    });
                                }
                            }
                        });
                    });
                }
            };
        }
    }
});
