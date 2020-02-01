"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hapi = require("@hapi/hapi");

var _index = require("./routes/index.js");

var _serverlessLog = _interopRequireDefault(require("../serverlessLog.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

class HttpServer {
  constructor(options, lambda) {
    Object.defineProperty(this, _lambda, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _options, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _server, {
      writable: true,
      value: null
    });
    _classPrivateFieldLooseBase(this, _lambda)[_lambda] = lambda;
    _classPrivateFieldLooseBase(this, _options)[_options] = options;
    const {
      host,
      lambdaPort
    } = options;
    const serverOptions = {
      host,
      port: lambdaPort
    };
    _classPrivateFieldLooseBase(this, _server)[_server] = new _hapi.Server(serverOptions);
  }

  async start() {
    // add routes
    const _invocationsRoute = (0, _index.invocationsRoute)(_classPrivateFieldLooseBase(this, _lambda)[_lambda]);

    const _invokeAsyncRoute = (0, _index.invokeAsyncRoute)(_classPrivateFieldLooseBase(this, _lambda)[_lambda]);

    _classPrivateFieldLooseBase(this, _server)[_server].route([_invokeAsyncRoute, _invocationsRoute]);

    const {
      host,
      httpsProtocol,
      lambdaPort
    } = _classPrivateFieldLooseBase(this, _options)[_options];

    try {
      await _classPrivateFieldLooseBase(this, _server)[_server].start();
    } catch (err) {
      console.error(`Unexpected error while starting serverless-offline lambda server on port ${lambdaPort}:`, err);
      process.exit(1);
    }

    (0, _serverlessLog.default)(`Offline [http for lambda] listening on http${httpsProtocol ? 's' : ''}://${host}:${lambdaPort}`);
  } // stops the server


  stop(timeout) {
    return _classPrivateFieldLooseBase(this, _server)[_server].stop({
      timeout
    });
  }

}

exports.default = HttpServer;

var _lambda = _classPrivateFieldLooseKey("lambda");

var _options = _classPrivateFieldLooseKey("options");

var _server = _classPrivateFieldLooseKey("server");