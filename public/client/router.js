Shortly.Router = Backbone.Router.extend({
  initialize: function(options){
    this.$el = options.el;
  },

  routes: {
    '':       'index',
    'create': 'create',
    'login': 'login',
    'signup': 'signup'
  },

  swapView: function(view){
    this.$el.html(view.render().el);
  },

  index: function(){
    var links = new Shortly.Links();
    var linksView = new Shortly.LinksView({ collection: links });
    this.swapView(linksView);
  },

  create: function(){
    this.swapView(new Shortly.createLinkView());
  },

  login: function(){
    console.log("Login routered");
    this.swapView(new Shortly.loginLinkView());
  },

  signup: function() {
    console.log("Sign Up routered");
    this.swapView(new Shortly.signupLinkView());
  }
});
