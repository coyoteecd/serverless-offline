"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _os = require("os");

var _execa = _interopRequireDefault(require("execa"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _DockerImage = _interopRequireDefault(require("./DockerImage.js"));

var _DockerPort = _interopRequireDefault(require("./DockerPort.js"));

var _debugLog = _interopRequireDefault(require("../../../debugLog.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const {
  stringify
} = JSON;
const {
  entries
} = Object;

class DockerContainer {
  constructor(env, functionKey, handler, runtime) {
    Object.defineProperty(this, _containerId, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _env, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _functionKey, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _handler, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _imageNameTag, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _image, {
      writable: true,
      value: null
    });
    Object.defineProperty(this, _port, {
      writable: true,
      value: null
    });
    _classPrivateFieldLooseBase(this, _env)[_env] = env;
    _classPrivateFieldLooseBase(this, _functionKey)[_functionKey] = functionKey;
    _classPrivateFieldLooseBase(this, _handler)[_handler] = handler;
    _classPrivateFieldLooseBase(this, _imageNameTag)[_imageNameTag] = this._baseImage(runtime);
    _classPrivateFieldLooseBase(this, _image)[_image] = new _DockerImage.default(_classPrivateFieldLooseBase(this, _imageNameTag)[_imageNameTag]);
  }

  _baseImage(runtime) {
    return `lambci/lambda:${runtime}`;
  }

  async start(codeDir) {
    const [, port] = await Promise.all([_classPrivateFieldLooseBase(this, _image)[_image].pull(), _classPrivateFieldLooseBase(DockerContainer, _dockerPort)[_dockerPort].get()]);
    (0, _debugLog.default)('Run Docker container...'); // TODO: support layer
    // https://github.com/serverless/serverless/blob/v1.57.0/lib/plugins/aws/invokeLocal/index.js#L291-L293

    const dockerArgs = ['-v', `${codeDir}:/var/task:ro,delegated`, '-p', `${port}:9001`, '-e', 'DOCKER_LAMBDA_STAY_OPEN=1' // API mode
    ];
    entries(_classPrivateFieldLooseBase(this, _env)[_env]).forEach(([key, value]) => {
      dockerArgs.push('-e', `${key}=${value}`);
    });

    if ((0, _os.platform)() === 'linux') {
      // Add `host.docker.internal` DNS name to access host from inside the container
      // https://github.com/docker/for-linux/issues/264
      const gatewayIp = await this._getBridgeGatewayIp();
      dockerArgs.push('--add-host', `host.docker.internal:${gatewayIp}`);
    }

    const {
      stdout: containerId
    } = await (0, _execa.default)('docker', ['create', ...dockerArgs, _classPrivateFieldLooseBase(this, _imageNameTag)[_imageNameTag], _classPrivateFieldLooseBase(this, _handler)[_handler]]);
    const dockerStart = (0, _execa.default)('docker', ['start', '-a', containerId], {
      all: true
    });
    await new Promise((resolve, reject) => {
      dockerStart.all.on('data', data => {
        const str = data.toString();
        console.log(str);

        if (str.includes('Lambda API listening on port')) {
          resolve();
        }
      });
      dockerStart.on('error', err => {
        reject(err);
      });
    });
    _classPrivateFieldLooseBase(this, _containerId)[_containerId] = containerId;
    _classPrivateFieldLooseBase(this, _port)[_port] = port;
  }

  async _getBridgeGatewayIp() {
    let gateway;

    try {
      ;
      ({
        stdout: gateway
      } = await (0, _execa.default)('docker', ['network', 'inspect', 'bridge', '--format', '{{(index .IPAM.Config 0).Gateway}}']));
    } catch (err) {
      console.error(err.stderr);
      throw err;
    }

    return gateway.split('/')[0];
  }

  async request(event) {
    const url = `http://localhost:${_classPrivateFieldLooseBase(this, _port)[_port]}/2015-03-31/functions/${_classPrivateFieldLooseBase(this, _functionKey)[_functionKey]}/invocations`;
    const res = await (0, _nodeFetch.default)(url, {
      body: stringify(event),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'post'
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from ${url} with ${res.statusText}`);
    }

    return res.json();
  }

  async stop() {
    if (_classPrivateFieldLooseBase(this, _containerId)[_containerId]) {
      try {
        await (0, _execa.default)('docker', ['stop', _classPrivateFieldLooseBase(this, _containerId)[_containerId]]);
        await (0, _execa.default)('docker', ['rm', _classPrivateFieldLooseBase(this, _containerId)[_containerId]]);
      } catch (err) {
        console.error(err.stderr);
        throw err;
      }
    }
  }

  get isRunning() {
    return _classPrivateFieldLooseBase(this, _containerId)[_containerId] !== null && _classPrivateFieldLooseBase(this, _port)[_port] !== null;
  }

}

exports.default = DockerContainer;

var _dockerPort = _classPrivateFieldLooseKey("dockerPort");

var _containerId = _classPrivateFieldLooseKey("containerId");

var _env = _classPrivateFieldLooseKey("env");

var _functionKey = _classPrivateFieldLooseKey("functionKey");

var _handler = _classPrivateFieldLooseKey("handler");

var _imageNameTag = _classPrivateFieldLooseKey("imageNameTag");

var _image = _classPrivateFieldLooseKey("image");

var _port = _classPrivateFieldLooseKey("port");

Object.defineProperty(DockerContainer, _dockerPort, {
  writable: true,
  value: new _DockerPort.default()
});