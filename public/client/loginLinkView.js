Shortly.loginLinkView = Backbone.View.extend({
  className: 'login',

  template: Templates['login'],

  // events: {
  //   'submit': 'shortenUrl'
  // },

  render: function() {
    this.$el.html( this.template() );
    return this;
  },

  success: function(link) {
    this.stopSpinner();
    var view = new Shortly.LinkView({ model: link });
    this.$el.find('.message').append(view.render().$el.hide().fadeIn());
  },

  failure: function(model, res) {
    this.stopSpinner();
    this.$el.find('.message')
      .html('Please enter a valid URL')
      .addClass('error');
    return this;
  }
});
