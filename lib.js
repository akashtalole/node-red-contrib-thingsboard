/*jshint -W069 */
/**
 *  ThingsBoard open-source IoT platform REST API documentation.
 * @class ThingsboardRestApi
 * @param {(string|object)} [domainOrOptions] - The project domain or options object. If object, see the object's optional properties.
 * @param {string} [domainOrOptions.domain] - The project domain
 * @param {object} [domainOrOptions.token] - auth token - object with value property and optional headerOrQueryName and isQuery properties
 */
var ThingsboardRestApi = (function(){
    'use strict';

    var request = require('request');
    var Q = require('q');
    var fileType = require('file-type');

    function ThingsboardRestApi(options){
        var domain = (typeof options === 'object') ? options.domain : options;
        this.domain = domain ? domain : 'https://demo.thingsboard.io:443';
        if(this.domain.length === 0) {
            throw new Error('Domain parameter must be specified as a string.');
        }
            this.token = (typeof options === 'object') ? (options.token ? options.token : {}) : {};
            this.apiKey = (typeof options === 'object') ? (options.apiKey ? options.apiKey : {}) : {};
    }

    function mergeQueryParams(parameters, queryParameters) {
        if (parameters.$queryParameters) {
            Object.keys(parameters.$queryParameters)
                  .forEach(function(parameterName) {
                      var parameter = parameters.$queryParameters[parameterName];
                      queryParameters[parameterName] = parameter;
            });
        }
        return queryParameters;
    }

    /**
     * HTTP Request
     * @method
     * @name ThingsboardRestApi#request
     * @param {string} method - http method
     * @param {string} url - url to do request
     * @param {object} parameters
     * @param {object} body - body parameters / object
     * @param {object} headers - header parameters
     * @param {object} queryParameters - querystring parameters
     * @param {object} form - form data object
     * @param {object} deferred - promise object
     */
    ThingsboardRestApi.prototype.request = function(method, url, parameters, body, headers, queryParameters, form, deferred){
        var req = {
            method: method,
            uri: url,
            qs: queryParameters,
            headers: headers,
            body: body
        };
        if(Object.keys(form).length > 0) {
            if (req.headers['Content-Type'] && req.headers['Content-Type'][0] === 'multipart/form-data') {
                delete req.body;
                var keyName = Object.keys(form)[0]
                req.formData = {
                    [keyName]: {
                        value: form[keyName],
                        options: {
                            filename: (fileType(form[keyName]) != null ? `file.${ fileType(form[keyName]).ext }` : `file` )
                        }
                    }
                };
            } else {
                req.form = form;
            }
        }
        if(typeof(body) === 'object' && !(body instanceof Buffer)) {
            req.json = true;
        }
        request(req, function(error, response, body){
            if(error) {
                deferred.reject(error);
            } else {
                if(/^application\/(.*\\+)?json/.test(response.headers['content-type'])) {
                    try {
                        body = JSON.parse(body);
                    } catch(e) {}
                }
                if(response.statusCode === 204) {
                    deferred.resolve({ response: response });
                } else if(response.statusCode >= 200 && response.statusCode <= 299) {
                    deferred.resolve({ response: response, body: body });
                } else {
                    deferred.reject({ response: response, body: body });
                }
            }
        });
    };

           /**
            * Set Token
            * @method
            * @name SwaggerPetstore#setToken
            * @param {string} value - token's value
            * @param {string} headerOrQueryName - the header or query name to send the token at
            * @param {boolean} isQuery - true if send the token as query param, otherwise, send as header param
            */
            ThingsboardRestApi.prototype.setToken = function (value, headerOrQueryName, isQuery) {
                this.token.value = value;
                this.token.headerOrQueryName = headerOrQueryName;
                this.token.isQuery = isQuery;
                console.log(isQuery)
            };
            /**
            * Set Api Key
            * @method
            * @name SwaggerPetstore#setApiKey
            * @param {string} value - apiKey's value
            * @param {string} headerOrQueryName - the header or query name to send the apiKey at
            * @param {boolean} isQuery - true if send the apiKey as query param, otherwise, send as header param
            */
            ThingsboardRestApi.prototype.setApiKey = function (value, headerOrQueryName, isQuery) {
                this.apiKey.value = value;
                this.apiKey.headerOrQueryName = headerOrQueryName;
                this.apiKey.isQuery = isQuery;
            };
        /**
        * Set Auth headers
        * @method
        * @name ThingsboardRestApi#setAuthHeaders
        * @param {object} headerParams - headers object
        */

        
        ThingsboardRestApi.prototype.setAuthHeaders = function (headerParams) {
            var headers = headerParams ? headerParams : {};
            if (!this.token.isQuery) {
                if (this.token.headerOrQueryName) {
                    headers[this.token.headerOrQueryName] = this.token.value;
                } else if (this.token.value) {
                    headers['Authorization'] = 'Bearer ' + this.token.value;
                }
            }
            if (!this.apiKey.isQuery && this.apiKey.headerOrQueryName) {
                //headers[this.apiKey.headerOrQueryName] = this.apiKey.value;
                headers['Authorization'] = 'Bearer ' + this.apiKey.value;
            }
            return headers;
        };
        
/**
 * Login method used to authenticate user and get JWT token data.

Value of the response **token** field can be used as **X-Authorization** header value:

`X-Authorization: Bearer $JWT_TOKEN_VALUE`.
 * @method
 * @name ThingsboardRestApi#loginPost
 * @param {object} parameters - method options and parameters
     * @param {} parameters.body -  ThingsBoard open-source IoT platform REST API documentation.
 */
 ThingsboardRestApi.prototype.loginPost = function(parameters){
    if(parameters === undefined) {
        parameters = {};
    }
    var deferred = Q.defer();
    var domain = this.domain,  path = '/api/auth/login';
    var body = {}, queryParameters = {}, headers = {}, form = {};

        headers['Accept'] = ['application/json'];
        headers['Content-Type'] = ['application/json'];

        
        
        
            if(parameters['body'] !== undefined){
                body = parameters['body'];
            }


 
    queryParameters = mergeQueryParams(parameters, queryParameters);

    this.request('POST', domain + path, parameters, body, headers, queryParameters, form, deferred);

    return deferred.promise;
 };

    return ThingsboardRestApi;
})();

exports.ThingsboardRestApi = ThingsboardRestApi;
