/*
 * Disk Usage Reports
 * http://diskusagereports.com/
 *
 * Copyright (c) 2013 André Mekkawi <diskusage@andremekkawi.com>
 * This source file is subject to the MIT license in the file LICENSE.txt.
 * The license is also available at http://diskusagereports.com/license.html
 */
define([
	'backbone',
	'layout',
	'underscore',
	'text!templates/layout.directory.html',
	'views/view.summary',
	'views/view.tabs'
], function(Backbone, Layout, _, template, SummaryView, TabsView){
	return Layout.extend({

		template: _.template(template),
		tagName: 'div',
		className: 'du-directory du-loading',

		_models: null,

		initialize: function(options) {
			this._models = options && options.models || {};
			this.model = this._models.directory;

			this.setViews({
				'.du-directory-head': [
					new SummaryView({ models: this._models }),
					new TabsView({ models: this._models })
				]
			});
		},

		resize: function(maxWidth, maxHeight) {
			var $el = this.$el;

			this._lastMaxHeight = this._lastMaxHeight || maxHeight;
			maxHeight = maxHeight || this._lastMaxHeight || $el.height();

			if (!$el.is(':visible'))
				return;

			var diff = $el.outerHeight(true) - $el.height(),
				innerHeight = maxHeight - diff,

				$body = $el.find('>.du-directory-body'),
				bodyTop = $body.position().top,
				bodyDiff = $body.outerHeight(true) - $body.height();

			$el.find('>.du-directory-body').height(innerHeight - bodyDiff - bodyTop);
		},

		addListeners: function() {
			var self = this,
				$el = this.$el;

			this._models.report.on('change:hash', function(model, options) {
				if (model.isValid() && _.isString(model.attributes.hash)) {
					this.model.id = model.attributes.hash;
					this.model.fetch({
						success: function(model, response, options) {
							$el.removeClass('du-loading');
							self.resize();
						},
						error: function(model, response, options) {

						}
					});
				}
			}, this);

			this.getViews().each(function(view){
				view.addListeners();
			});
			return this;
		}
	});

});