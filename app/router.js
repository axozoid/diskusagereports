/*
 * Disk Usage Reports
 * http://diskusagereports.com/
 *
 * Copyright (c) 2013 André Mekkawi <diskusage@andremekkawi.com>
 * This source file is subject to the MIT license in the file LICENSE.txt.
 * The license is also available at http://diskusagereports.com/license.html
 */
define([
	'backbone'
], function(Backbone) {

	return Backbone.Router.extend({
		routes: {
			'': 'directory',
			':hash(/:tab)(/:col)(/:page)': 'directory'
		}
	});

});