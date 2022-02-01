'use strict';
var lib = require('./lib.js');

module.exports = function (RED) {
    function ThingsboardRestApiNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        node.on('input', function(msg) {
            msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });
    }

    RED.nodes.registerType('thingsboard-rest-api-auth', ThingsboardRestApiNode);

};
