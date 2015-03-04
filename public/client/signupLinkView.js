Shortly.signupLinkView = Backbone.View.extend({
  className: 'signup',

  template: Templates['signup'],

  events: {
    'submit': 'newUser'
  },

  render: function() {
    this.$el.html( this.template() );
    return this;
  },

newUser: function(e){
    e.preventDefault();
    var $username = this.$el.find('form #username');
    var user = new Shortly.User({username: $username.val()});
    user.on('sync', this.success, this);
    user.on('error', this.failure, this);
    user.save({});
    console.log('new user submit button clicked');
  },

  success: function(user) {

    alert("<<< Sign up link view Success >>>");
    var view = new Shortly.User({ model: user });
    this.$el.find('.message').append(view.render().$el.hide().fadeIn());
  },

  failure: function(model, res) {
    this.$el.find('.message')
      .html('Sorry, this username is taken.')
      .addClass('error');
    return this;
  }


});
