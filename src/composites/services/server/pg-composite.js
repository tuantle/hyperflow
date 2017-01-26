/**
 * Copyright 2015-present Tuan Le.
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
 * @module PGComposite
 * @description - A node postgres composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../../../hyperflow';

/**
* @description - Node postgres composite module.
*
* @module PGComposite
* @return {object}
*/
export default Hf.Composite({
    enclosure: {
        PGComposite: function PGComposite () {
            /* ----- Private Variables ------------- */
            /* ----- Public Functions -------------- */
            /**
             * @description - Get service provider.
             *
             * @method getProvider
             * @return void
             */
            this.getProvider = function getProvider () {
                Hf.log(`error`, `PGComposite.getProvider - Method is not implemented by default.`);
            };
        }
    },
    template: {
        /**
         * @description - Initialized and check that service is valid for this composite.
         *
         * @method $initPGComposite
         * @return void
         */
        $initPGComposite: function $initPGComposite () {
            const service = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    dbServer: {
                        name: `string`
                    },
                    dbServerUrl: `string`
                }).of(service)) {
                    Hf.log(`error`, `PGComposite.$init - Service is invalid. Cannot apply composite.`);
                }
            }
        },
        /**
         * @description - Do query from database.
         *
         * @method query
         * @param {string} tableName
         * @return {object}
         */
        query: function query (tableName) {
            const service = this;
            if (!Hf.isString(tableName)) {
                Hf.log(`error`, `PGComposite.query - Input table name is invalid.`);
            } else {
                const {
                    dbServer,
                    dbServerUrl,
                    getProvider
                } = service;
                const dbName = dbServer.name;
                const {
                    pg,
                    sql
                } = getProvider();
                if (!Hf.isObject(pg) || !Hf.isObject(sql)) {
                    Hf.log(`error`, `PGComposite.query - Postgres driver or squel builder provider is not unsupported.`);
                } else {
                    const sqlPostgres = sql.useFlavour(`postgres`);
                    return {
                        /**
                         * @description - Do select query on data base.
                         *
                         * @param {function} sqlCreate
                         * @method query.select
                         */
                        select: function select (sqlCreate) {
                            if (!Hf.isFunction(sqlCreate)) {
                                Hf.log(`error`, `PGComposite.query.select - Input squel function is invalid.`);
                            } else {
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
                                            if (!Hf.isObject(statementSQL)) {
                                                reject(new Error(`ERROR: SQL statement object is invalid.`));
                                            } else {
                                                const selectQuery = client.query(statementSQL.toParam());
                                                Hf.log(`info`, `Submitted query statement:${statementSQL.toString()}.`);
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
                            }
                        },
                        /**
                         * @description - Do insert query on data base.
                         *
                         * @param {function} sqlCreate
                         * @method query.update
                         */
                        update: function update (sqlCreate) {
                            if (!Hf.isFunction(sqlCreate)) {
                                Hf.log(`error`, `PGComposite.query.update - Input squel function is invalid.`);
                            } else {
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
                                            if (!Hf.isObject(statementSQL)) {
                                                reject(new Error(`ERROR: SQL statement object is invalid.`));
                                            } else {
                                                const updateQuery = client.query(statementSQL.returning(`*`).toParam());
                                                Hf.log(`info`, `Submitted query statement:${statementSQL.toString()}.`);

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
                            }
                        },
                        /**
                         * @description - Do insert query on data base.
                         *
                         * @param {function} sqlCreate
                         * @method query.insert
                         */
                        insert: function insert (sqlCreate) {
                            if (!Hf.isFunction(sqlCreate)) {
                                Hf.log(`error`, `PGComposite.query.insert - Input squel function is invalid.`);
                            } else {
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
                                            if (!Hf.isObject(statementSQL)) {
                                                reject(new Error(`ERROR: SQL statement object is invalid.`));
                                            } else {
                                                const insertQuery = client.query(statementSQL.returning(`*`).toParam());
                                                Hf.log(`info`, `Submitted query statement:${statementSQL.toString()}.`);

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
                            }
                        },
                        /**
                         * @description - Do delete query on data base.
                         *
                         * @param {function} sqlCreate
                         * @method query.delete
                         */
                        delete: function _delete (sqlCreate) {
                            if (!Hf.isFunction(sqlCreate)) {
                                Hf.log(`error`, `PGComposite.query.delete - Input squel function is invalid.`);
                            } else {
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
                                            if (!Hf.isObject(statementSQL)) {
                                                reject(new Error(`ERROR: SQL statement object is invalid.`));
                                            } else {
                                                const deleteQuery = client.query(statementSQL.returning(`*`).toParam());
                                                Hf.log(`info`, `Submitted query statement:${statementSQL.toString()}.`);

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
                        }
                    };
                }
            }
        }
    }
});
