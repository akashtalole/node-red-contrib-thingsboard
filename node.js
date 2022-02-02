'use strict';
var lib = require('./lib.js');

module.exports = function (RED) {
    function ThingsboardRestApiNode(config) {
        RED.nodes.createNode(this, config);
        this.method = config.method;
        this.loginPost_body = config.loginPost_body;

        this.getDevicesByIdsUsingGET_deviceIds = config.getDevicesByIdsUsingGET_deviceIds;
        this.getDevicesByIdsUsingGET_deviceIdsType = config.getDevicesByIdsUsingGET_deviceIdsType || 'str';

        var node = this;

        node.on('input', function(msg) {
            var errorFlag = false;
            var client = new lib.ThingsboardRestApi();
            if (!errorFlag && this.service && this.service.credentials && this.service.credentials.secureTokenValue) {
                if (this.service.secureTokenIsQuery) {
                    client.setToken(this.service.credentials.secureTokenValue,
                                    this.service.secureTokenHeaderOrQueryName, true);
                } else {
                    client.setToken(this.service.credentials.secureTokenValue,
                                    this.service.secureTokenHeaderOrQueryName, false);
                }
            }
            if (!errorFlag && this.service && this.service.credentials && this.service.credentials.secureApiKeyValue) {
                if (this.service.secureApiKeyIsQuery) {
                    client.setApiKey(this.service.credentials.secureApiKeyValue,
                                     this.service.secureApiKeyHeaderOrQueryName, true);
                } else {
                    client.setApiKey(this.service.credentials.secureApiKeyValue,
                                     this.service.secureApiKeyHeaderOrQueryName, false);
                }
            }
            if (!errorFlag) {
                client.body = msg.payload;
            }

            var result;
            if (!errorFlag && node.method === 'loginPost') {
                var loginPost_parameters = [];
                var loginPost_nodeParam;
                var loginPost_nodeParamType;

                if (typeof msg.payload === 'object') {
                    loginPost_parameters.body = msg.payload;
                } else {
                    node.error('Unsupported type: \'' + (typeof msg.payload) + '\', ' + 'msg.payload must be JSON object or buffer.', msg);
                    errorFlag = true;
                }
                                result = client.loginPost(loginPost_parameters);
            }
            if (!errorFlag && result === undefined) {
                node.error('Method is not specified.', msg);
                errorFlag = true;
            }
            var setData = function (msg, data) {
                if (data) {
                    if (data.response) {
                        if (data.response.statusCode) {
                            msg.statusCode = data.response.statusCode;
                        }
                        if (data.response.headers) {
                            msg.headers = data.response.headers;
                        }
                        if (data.response.request && data.response.request.uri && data.response.request.uri.href) {
                            msg.responseUrl = data.response.request.uri.href;
                        }
                    }
                    if (data.body) {
                        msg.payload = data.body;
                    }
                }
                return msg;
            };
            if (!errorFlag) {
                node.status({ fill: 'blue', shape: 'dot', text: 'ThingsboardRestApi.status.requesting' });
                result.then(function (data) {
                    node.send(setData(msg, data));
                    node.status({});
                }).catch(function (error) {
                    var message = null;
                    if (error && error.body && error.body.message) {
                        message = error.body.message;
                    }
                    node.error(message, setData(msg, error));
                    node.status({ fill: 'red', shape: 'ring', text: 'node-red:common.status.error' });
                });
            }
        });
    }

    RED.nodes.registerType('thingsboard-rest-api-auth', ThingsboardRestApiNode);
    function ThingsboardRestApiServiceNode(n) {
        RED.nodes.createNode(this, n);

        this.secureTokenValue = n.secureTokenValue;
        this.secureTokenHeaderOrQueryName = n.secureTokenHeaderOrQueryName;
        this.secureTokenIsQuery = n.secureTokenIsQuery;
        this.secureApiKeyValue = n.secureApiKeyValue;
        this.secureApiKeyHeaderOrQueryName = n.secureApiKeyHeaderOrQueryName;
        this.secureApiKeyIsQuery = n.secureApiKeyIsQuery;
    }

    RED.nodes.registerType('thingsboard-rest-api-service', ThingsboardRestApiServiceNode, {
        credentials: {
            secureTokenValue: { type: 'password' },
            secureApiKeyValue: { type: 'password' },
            temp: { type: 'text' }
        }
    });

};
