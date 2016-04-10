'use strict';
let _ = require('lodash');
module.exports = function(sails) {
  return {
    initialize: function(cb) {
      let eventsToWaitFor = [];

      eventsToWaitFor.push('router:after');

      if (sails.hooks.policies) {
        eventsToWaitFor.push('hook:policies:bound');
      }

      if (sails.hooks.controllers) {
        eventsToWaitFor.push('hook:controllers:loaded');
      }

      sails.after(eventsToWaitFor, function(){
        _.each(sails.middleware.controllers, function (controller, controllerId) {
          if (!_.isObject(controller) || _.isArray(controller)) {
            return;
          }

          let globalId  = sails.controllers[controllerId].globalId;
          let actions   = Object.keys(sails.controllers[controllerId]);

          if (controller.index) {
            sails.router.bind(`GET /${globalId}`, controller.index, null, {
              action:     'index',
              controller: globalId
            });
          }

          if (controller.find) {
            sails.router.bind(`GET /${globalId}`, controller.find, null, {
              action:     'find',
              controller: globalId
            });
          }

          if (controller.findOne) {
            sails.router.bind(`GET /${globalId}/:id`, controller.findOne, null, {
              action:     'fineOne',
              controller: globalId
            });
          }

          if (controller.create) {
            sails.router.bind(`POST /${globalId}`, controller.create, null, {
              action:     'create',
              controller: globalId
            });
          }

          if (controller.update) {
            sails.router.bind(`PUT /${globalId}/:id`, controller.update, null, {
              action:     'update',
              controller: globalId
            });
          }

          if (controller.destroy) {
            sails.router.bind(`DELETE /${globalId}/:id`, controller.destroy, null, {
              action:     'destroy',
              controller: globalId
            });
          }

          _.each(actions, function eachActionID (actionId) {
            let action = controller[actionId.toLowerCase()];

            if(actionId !== 'index' && actionId !== 'identity' && actionId !== 'globalId' && actionId !== 'sails') {
              sails.router.bind(`/${globalId}/${actionId}/:id?`, action, null, {
                action:     actionId,
                controller: globalId
              });
            }
          });
        });
      });

      cb();
    }
  };
};
