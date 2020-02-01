"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

class InvocationsController {
  constructor(lambda) {
    Object.defineProperty(this, _lambda, {
      writable: true,
      value: null
    });
    _classPrivateFieldLooseBase(this, _lambda)[_lambda] = lambda;
  }

  async invoke(functionName, invocationType, event, clientContext) {
    const lambdaFunction = _classPrivateFieldLooseBase(this, _lambda)[_lambda].getByFunctionName(functionName);

    lambdaFunction.setClientContext(clientContext);
    lambdaFunction.setEvent(event);

    if (invocationType === 'Event') {
      // don't await result!
      lambdaFunction.runHandler().catch(err => {
        // TODO handle error
        console.log(err);
        throw err;
      });
      return {
        Payload: '',
        StatusCode: 202
      };
    }

    if (invocationType === 'RequestResponse') {
      let result;

      try {
        result = await lambdaFunction.runHandler();
      } catch (err) {
        // TODO handle error
        console.log(err);
        throw err;
      }

      return result;
    } // TODO FIXME


    console.log(`invocationType: '${invocationType}' not supported by serverless-offline`);
    return undefined;
  }

}

exports.default = InvocationsController;

var _lambda = _classPrivateFieldLooseKey("lambda");