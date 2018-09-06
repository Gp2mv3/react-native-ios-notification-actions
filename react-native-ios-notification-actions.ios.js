import { NativeModules, NativeAppEventEmitter } from 'react-native';
const { RNNotificationActions } = NativeModules;

let actions = {};

function handleActionCompleted() {
  RNNotificationActions.callCompletionHandler();
};

export class Action {

  constructor(opts, onComplete) {
    // TODO - check options
    this.opts = opts;
    this.onComplete = onComplete;
    // When a notification is received, we'll call this action by it's identifier
    actions[opts.identifier] = this;
    NativeAppEventEmitter.addListener('notificationActionReceived', (body) => {
      if (body.identifier === opts.identifier) {
        onComplete(body, handleActionCompleted);
      }
    });
  }
}

export class Category {

  constructor(opts) {
    // TODO - check options
    this.opts = opts;
  }

}

export const updateCategories = (categories, shouldRequestPermission = true) => {
  let cats = categories.map((cat) => {
    return Object.assign({}, cat.opts, {
      actions: cat.opts.actions.map((action) => action.opts)
    });
  });

  RNNotificationActions.updateCategories(cats, shouldRequestPermission);
  // Re-update when permissions change
  if (shouldRequestPermission) {
    NativeAppEventEmitter.addListener('remoteNotificationsRegistered', () => {
      RNNotificationActions.updateCategories(cats, false);
    });
  }
};


export default {
  Action,
  Category,
  updateCategories
};
