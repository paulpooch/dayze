///////////////////////////////////////////////////////////////////////////////
// NOTIFICATION VIEW
///////////////////////////////////////////////////////////////////////////////
define([
  'jquery',
  'underscore',
  'backbone'
], function(
  jQuery,
  _,
  Backbone
) {

  var that;
  
  var _notification;

  var NotificationView = Backbone.View.extend({

    events: {
      'click #enableNotifications': 'onEnableNotificationsClick', 
    },

    initialize: function() {
      that = this;
      that.model.set('isSupported', true);
      if (window.webkitNotifications === undefined) {
        console.log('Notifications not supported!');
        that.model.set('isSupported', false);
      }
    },

    onEnableNotificationsClick: function() {
      if (that.model.get('isSupported')) {
        if (window.webkitNotifications.checkPermission() === 0) {
          _notification = window.webkitNotifications.createNotification(
            that.model.get('icon'),
            that.model.get('title'),
            that.model.get('body')
          );
          _notification.ondisplay = that.model.get('onDisplay');
          _notification.onclose = that.model.get('onClose');
          _notification.show();
          console.log('show')
        } else {
          window.webkitNotifications.requestPermission(that.onEnableNotificationsClick);
        }
      }
    },

    render: function() {

    }

  });

  return NotificationView;

});