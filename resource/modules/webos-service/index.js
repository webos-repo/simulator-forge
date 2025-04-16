const EventEmitter = require("events");
// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const fs = require("fs");
// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const path = require("path");
// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const os = require("os");

let tokenCnt = 0;
const generateToken = (id) => {
  tokenCnt += 1;
  return id + "." + tokenCnt;
};

class ActivityManager {
  create = () => {};
}

class Subscription extends EventEmitter {
  constructor(uri, args) {
    super();
    this.uri = uri;
    this.args = args;
  }

  cancel = () => {
    this.emit("subscription-cancel");
  };
}

class Message {
  constructor(msg) {
    this.category = msg.category;
    this.method = msg.method;
    this.isSubscription = msg.isSubscription;
    this.sender = msg.sender;
    this.uniqueToken = msg.uniqueToken;
    this.payload = msg.payload;
  }

  respond = (response) => {
    process.send({
      cmd: "service-send",
      isSubscription: this.isSubscription,
      ret: JSON.stringify(response),
      uniqueToken: this.uniqueToken,
      isCancel: false,
    });
  };

  cancel = (response) => {
    process.send({
      cmd: "service-send",
      isSubscription: false,
      ret: JSON.stringify(response),
      uniqueToken: this.uniqueToken,
      isCancel: true,
    });
  };
}

class Method extends EventEmitter {
  constructor(methodName) {
    super();
    this.methodName = methodName;
  }
}

class WebosService {
  constructor(busId) {
    this.busId = busId;
    this.activityManager = new ActivityManager();
    this.subscriptions = {};
  }

  register = (methodName, request, cancel) => {
    const method = new Method(methodName);

    process.on("message", (data) => {
      const { cmd, msg, isCancel } = data;
      if (cmd !== "called-" + methodName) return;

      const message = new Message(msg);
      if (isCancel) {
        if (cancel) cancel(message);
        else method.emit("cancel", message);
      } else {
        if (request) request(message);
        else method.emit("request", message);
      }
    });

    process.send({
      cmd: "register",
      busId: this.busId,
      methodName,
    });

    return method;
  };

  call = (uri, args, callback) => {
    const token = generateToken(this.busId);
    const callResponseHandler = (data) => {
      const { cmd, res, subscribe } = data;
      if (cmd !== "call-response-" + token) return;
      if (subscribe) process.removeListener("message", callResponseHandler);
      callback(res);
    };
    process.on("message", callResponseHandler);

    process.send({
      cmd: "call",
      token,
      uri,
      args: JSON.stringify(args),
      isCancel: false,
    });
  };

  subscribe = (uri, args) => {
    const subscription = new Subscription(uri, args);
    const token = generateToken(this.busId);

    const subscribeHandler = (data) => {
      const { cmd, res, subscribe: isSubscribe } = data;
      const channel = "subscribe-response-" + token;
      if (cmd !== channel) return;
      if (isSubscribe) {
        subscription.emit("response", res);
      } else {
        subscription.emit("cancel", res);
        process.removeListener("message", subscribeHandler);
      }
    };
    process.on("message", subscribeHandler);

    const subscribeSender = (isCancel) => {
      return {
        cmd: "subscribe",
        token,
        uri,
        args: JSON.stringify(args),
        isCancel,
      };
    };

    subscription.on("subscription-cancel", () => {
      process.removeListener("message", subscribeHandler);
      process.send(subscribeSender(true));
    });

    process.send(subscribeSender(false));

    return subscription;
  };
}

module.exports = WebosService;
