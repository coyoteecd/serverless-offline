"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = invocationsRoute;

var _buffer = require("buffer");

var _nodeFetch = require("node-fetch");

var _InvocationsController = _interopRequireDefault(require("./InvocationsController.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  parse
} = JSON; // https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html

function invocationsRoute(lambda) {
  const invocationsController = new _InvocationsController.default(lambda);
  return {
    handler(request) {
      const {
        headers,
        params: {
          functionName
        },
        payload
      } = request;

      const _headers = new _nodeFetch.Headers(headers);

      const clientContextHeader = _headers.get('x-amz-client-context');

      const invocationType = _headers.get('x-amz-invocation-type'); // default is undefined


      let clientContext; // check client context header was set

      if (clientContextHeader) {
        const clientContextBuffer = _buffer.Buffer.from(clientContextHeader, 'base64');

        clientContext = parse(clientContextBuffer.toString('utf-8'));
      } // check if payload was set, if not, default event is an empty object


      const event = payload.length > 0 ? parse(payload.toString('utf-8')) : {};
      return invocationsController.invoke(functionName, invocationType, event, clientContext);
    },

    method: 'POST',
    options: {
      payload: {
        // allow: ['binary/octet-stream'],
        defaultContentType: 'binary/octet-stream',
        // request.payload will be a raw buffer
        parse: false
      },
      tags: ['api']
    },
    path: '/2015-03-31/functions/{functionName}/invocations'
  };
}