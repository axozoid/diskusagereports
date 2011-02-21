;(function($){

$.extend(Controller.prototype, {
	
	_populateReport: function() {
		if (this._data) {
			$('#Path').empty();
			for (var i = 0; i < this._data.parents.length; i++) {
				$('#Path').append($('<a>').attr('href', '#' + this._createLocation({ hash: this._data.parents[i].hash })).text(this._data.parents[i].name)).append(' ' + this.settings.ds.htmlencode() + ' ');
			}
			$('#Path').append(this._data.name.htmlencode());
			
			$('#Bytes').text(FormatBytes(this._data.bytes));
			$('#TotalBytes').text(FormatBytes(this._data.totalbytes));
			$('#Num').text(AddCommas(this._data.num));
			$('#TotalNum').text(AddCommas(this._data.totalnum));
			
			$('#Section_Message').hide().text('');
			
			$('#Sections')
				.removeClass('totals-sortedby-label totals-sortedby-byte totals-sortedby-num files-sortedby-name files-sortedby-type files-sortedby-size files-sortedby-modified top100-sortedby-name top100-sortedby-type top100-sortedby-size top100-sortedby-modified top100-sortedby-path')
				.addClass('totals-sortedby-' + this.options.totalsSortBy + ' files-sortedby-' + this.options.filesSortBy + ' top100-sortedby-' + this.options.top100SortBy)
				[(this.options.totalsSortRev ? 'add' : 'remove') + 'Class']('totals-sortrev')
				[(this.options.filesSortRev ? 'add' : 'remove') + 'Class']('files-sortrev')
				[(this.options.top100SortRev ? 'add' : 'remove') + 'Class']('top100-sortrev');
			
			if (this._lastSectionOptions != ''.concat(this.options.section, this.options.totalsSortBy, this.options.totalsSortRev, this.options.filesSortBy, this.options.filesSortRev, this.options.top100SortBy, this.options.top100SortRev)) {
				this._lastSectionOptions = ''.concat(this.options.section, this.options.totalsSortBy, this.options.totalsSortRev, this.options.filesSortBy, this.options.filesSortRev, this.options.top100SortBy, this.options.top100SortRev)
				
				switch (this.options.section) {
					case 'modified':
						this._displayModified();
						break;
					case 'types':
						this._displayTypes();
						break;
					case 'sizes':
						this._displaySizes();
						break;
					case 'files':
						this._displayFiles();
						break;
					case 'top100':
						this._displayTop100();
						break;
					default:
						this._displaySubDirs();
				}
			}
			
			// Scroll to the top of the section if it changed.
			if (this._lastSection != this.options.section) {
				this._lastSection = this.options.section;
				$('#Report').get(0).scrollTop = 0;
			}
		}
		
		$('#LeftColumn')
			.removeClass('tree-sortedby-label tree-sortedby-byte tree-sortedby-num')
			.addClass('tree-sortedby-' + this.options.treeSortBy)
			[(this.options.treeSortRev ? 'add' : 'remove') + 'Class']('tree-sortrev');
		
		if (this.directories && this._lastTreeOptions != ''.concat(this.options.treeSortBy, this.options.treeSortRev)) {
			this._lastTreeOptions = ''.concat(this.options.treeSortBy, this.options.treeSortRev);
			this._tree.tree('resort');
		}
	},
	
	_displaySubDirs: function() {
		var self = this;
		
		$('> div', this._sections).hide();
		
		var subdirs = this._data.subdirs.slice(0);
		subdirs.push({ isfiles: true, totalbytes: this._data.bytes, totalnum: this._data.num });
		
		if (this._data.totalnum == 0 && this._data.subdirs.length == 0) {
			$('#Section_Message').text('Neither this directory nor its sub directories contain files.').show();
		}
		else {
			this._displayTotalsTable($('#SubDirs'), subdirs, function(data, field) {
				switch (field) {
					case 'label':
						if (data.isfiles) return '<i>Files in this directory</i>';
						return '<a href="#' + self._createLocation({ hash: data.hash }).htmlencode() + '">' + data.name.htmlencode() + '</a>';
					case 'sortlabel':
						if (data.isfiles) return '';
						return data.name.toLowerCase();
					case 'bytes':
						return data.totalbytes;
					case 'num':
						return data.totalnum;
				}
			}, true);
			this._subdirsSection.show();
		}
		
		$('#Tabs li').removeClass('selected');
		$('#Tab_SubDirs').addClass('selected');
	},
	
	_displayModified: function() {
		var self = this;
		
		$('> div', this._sections).hide();
		
		if (!this._data.modified) {
			$('#Section_Message').text('This information is not available at this directory depth.').show();
		}
		else if (this._data.modified.length == 0) {
			$('#Section_Message').text('Neither this directory nor its sub directories contain files.').show();
		}
		else {
			this._displayTotalsTable($('#Modified'), this._data.modified, function(data, field, key) {
				switch (field) {
					case 'label':
						return self.settings.modified[key].label;
					case 'sortlabel':
						return parseInt(key);
					case 'bytes':
						return data[0];
					case 'num':
						return data[1];
				}
			});
			this._modifiedSection.show();
		}
		
		$('#Tabs li').removeClass('selected');
		$('#Tab_Modified').addClass('selected');
	},
	
	_displayTypes: function() {
		var self = this;
		
		$('> div', this._sections).hide();
		
		if (!this._data.types) {
			$('#Section_Message').text('This information is not available at this directory depth.').show();
		}
		else if (this._data.types.length == 0) {
			$('#Section_Message').text('Neither this directory nor its sub directories contain files.').show();
		}
		else {
			this._displayTotalsTable($('#Types'), this._data.types, function(data, field, key) {
				switch (field) {
					case 'label':
						return key == '' ? '<i>Unknown</i>' : key.htmlencode();
					case 'sortlabel':
						return key.toLowerCase();
					case 'bytes':
						return data[0];
					case 'num':
						return data[1];
				}
			}, true);
			this._typesSection.show();
		}
		
		$('#Tabs li').removeClass('selected');
		$('#Tab_Types').addClass('selected');
	},
	
	_displaySizes: function() {
		var self = this;
		
		$('> div', this._sections).hide();
		
		if (!this._data.types) {
			$('#Section_Message').text('This information is not available at this directory depth.').show();
		}
		else if (this._data.sizes.length == 0) {
			$('#Section_Message').text('Neither this directory nor its sub directories contain files.').show();
		}
		else {
			this._displayTotalsTable($('#Sizes'), this._data.sizes, function(data, field, key) {
				switch (field) {
					case 'label':
						return self.settings.sizes[parseInt(key)].label;
					case 'sortlabel':
						return parseInt(key);
					case 'bytes':
						return data[0];
					case 'num':
						return data[1];
				}
			});
			this._sizesSection.show();
		}
		
		$('#Tabs li').removeClass('selected');
		$('#Tab_Sizes').addClass('selected');
	},
	
	_displayTotalsTable: function(table, data, getValue, htmlLabel) {
		
		var self = this;
		var tbody = $('> tbody', table);
		var tfoot = $('> tfoot', table);
		
		tbody.empty();
		
		var totalBytes = 0;
		var totalNum = 0;
		
		var rows = [];
		
		for (var key in data) {
			var label = getValue(data[key], 'label', key);
			var sortValue = sortLabel = getValue(data[key], 'sortlabel', key);
			var bytes = getValue(data[key], 'bytes', key);
			var num = getValue(data[key], 'num', key);
			
			totalBytes += parseInt(bytes);
			totalNum += parseInt(num);
			
			switch (this.options.totalsSortBy) {
				case 'byte':
					sortValue = parseInt(bytes);
					break;
				case 'num':
					sortValue = parseInt(num);
					break;
			}
			
			var html = '';
			
			html += '<td class="totals-col-label">' + (htmlLabel ? label : label.htmlencode()) + '</td>';
			
			var bytePerCent = parseInt(10000 * parseInt(bytes) / Math.max(1, parseInt(this._data.totalbytes))) / 100;
			var byteColorIndex = Math.max(1, Math.floor(this.gradient.length * bytePerCent / 100)) - 1;
			html += '<td class="totals-col-byte" align="right">' + FormatBytes(bytes) + '</td>';
			html += '<td class="totals-col-byte" align="right">' + bytePerCent.toFixed(2) + '%' + '</td>';
			html += '<td class="totals-col-byte"><div class="percentbar"><div style="width: '+ bytePerCent +'%; background-color: #' + this.gradient[byteColorIndex] + ';">&nbsp;</div></div></td>';
			
			var numPerCent = parseInt(10000 * parseInt(num) / Math.max(1, parseInt(this._data.totalnum))) / 100;
			var numColorIndex = Math.max(1, Math.floor(this.gradient.length * numPerCent / 100)) - 1;
			html += '<td class="totals-col-num" align="right">' + AddCommas(num) + '</td>';
			html += '<td class="totals-col-num" align="right">' + numPerCent.toFixed(2) + '%' + '</td>';
			html += '<td class="totals-col-num"><div class="percentbar"><div style="width: '+ numPerCent +'%; background-color: #' + this.gradient[numColorIndex] + ';">&nbsp;</div></div></td>';
			
			var index = BinarySearch(rows, [ sortValue, sortLabel ], function(needle, item, index) {
				var modifier = self.options.totalsSortRev ? -1 : 1;
				
				if (needle[0] < item[0]) return -1 * modifier;
				if (needle[0] > item[0]) return 1 * modifier;
				
				if (needle[1] < item[1]) return -1;
				if (needle[1] > item[1]) return 1;
				
				return 0;
			});
			
			if (index < 0) {
				rows.splice(Math.abs(index)-1, 0, [sortValue, sortLabel, html]);
			}
			else {
				rows.splice(index, 0, [sortValue, sortLabel, html]);
			}
		}
		
		var finalHTML = '';
		for (var i = 0; i < rows.length; i++) {
			finalHTML += '<tr class="' + (i % 2 == 0 ? 'odd' : 'even') + '">' + rows[i][2] + '</tr>';
		}
		
		tbody.html(finalHTML);
		
		$('td:eq(1)', tfoot).text(FormatBytes(totalBytes) + ' (' + AddCommas(totalBytes) + ')');
		$('td:eq(2)', tfoot).text(AddCommas(totalNum));
	},
	
	_displayFiles: function() {
		var self = this;
		
		$('> div', this._sections).hide();
		
		if (this._data.files.length == 0) {
			$('#Section_Message').text('This directory does not contain files.').show();
		}
		else {
			var tbody = $('#Files > tbody').empty();
			
			var totalBytes = 0;
			var totalNum = 0;
			var data = this._data.files;
			
			var rows = [];
			
			for (var key in data) {
				
				var extData = '', ext = data[key].name.toLowerCase().split('.');
				if (ext.length > 1) ext = (extData = ext[ext.length-1]).htmlencode();
				else ext = "<i>Unknown</i>";
				
				var sortValue = data[key].name.toLowerCase();
				switch (this.options.filesSortBy) {
					case 'type':
						sortValue = extData;
						break;
					case 'size':
						sortValue = parseInt(data[key].size);
						break;
					case 'modified':
						sortValue = data[key].date + ' ' + data[key].time;
						break;
				}
				
				var html = '';
				
				html += '<td>' + data[key].name.htmlencode() + '</td>';
				html += '<td align="center">' + ext + '</td>';
				html += '<td align="right">' + FormatBytes(data[key].size) + '</td>';
				html += '<td>' + data[key].date + ' ' + data[key].time + '</td>';
				
				var index = BinarySearch(rows, [ sortValue, data[key].name.toLowerCase() ], function(needle, item, index) {
					var modifier = self.options.filesSortRev ? -1 : 1;
					
					if (needle[0] < item[0]) return -1 * modifier;
					if (needle[0] > item[0]) return 1 * modifier;
					
					if (needle[1] < item[1]) return -1;
					if (needle[1] > item[1]) return 1;
					
					return 0;
				});
				
				if (index < 0) {
					rows.splice(Math.abs(index)-1, 0, [sortValue, data[key].name.toLowerCase(), html]);
				}
				else {
					rows.splice(index, 0, [sortValue, data[key].name.toLowerCase(), html]);
				}
			}
			
			var finalHTML = '';
			for (var i = 0; i < rows.length; i++) {
				finalHTML += '<tr class="' + (i % 2 == 0 ? 'odd' : 'even') + '">' + rows[i][2] + '</tr>';
			}
			
			tbody.html(finalHTML);
			
			this._filesSection.show();
		}
		
		$('#Tabs li').removeClass('selected');
		$('#Tab_Files').addClass('selected');
	},
	
	_displayTop100: function() {
		var self = this;
		
		$('> div', this._sections).hide();
		
		if (!this._data.top100) {
			$('#Section_Message').text('This information is not available at this directory depth.').show();
		}
		else if (this._data.top100.length == 0) {
			$('#Section_Message').text('Neither this directory nor its sub directories contain files.').show();
		}
		else {
			var tbody = $('#Top100 > tbody').empty();
			
			var totalBytes = 0;
			var totalNum = 0;
			var data = this._data.top100;
			
			var rows = [];
			
			for (var key in data) {
				
				var extData = '', ext = data[key].name.toLowerCase().split('.');
				if (ext.length > 1) ext = (extData = ext[ext.length-1]).htmlencode();
				else ext = "<i>Unknown</i>";
				
				var sortValue = data[key].name.toLowerCase();
				switch (this.options.top100SortBy) {
					case 'type':
						sortValue = extData;
						break;
					case 'size':
						sortValue = parseInt(data[key].size);
						break;
					case 'modified':
						sortValue = data[key].date + ' ' + data[key].time;
						break;
					case 'path':
						sortValue = data[key].path;
						break;
				}
				
				var html = '';
				html += '<td>' + data[key].name.htmlencode() + '</td>';
				html += '<td align="center">' + ext + '</td>';
				html += '<td align="right">' + FormatBytes(data[key].size) + '</td>';
				html += '<td>' + data[key].date + ' ' + data[key].time + '</td>';
				html += '<td><a href="#' + this._createLocation({ hash: data[key].hash, section: 'files' }).htmlencode() + '">' + data[key].path.replace(new RegExp(RegExp.escape(this.settings.ds), 'g'), this.settings.ds+' ').htmlencode() + '</a></td>';
				
				var index = BinarySearch(rows, [ sortValue, data[key].name ], function(needle, item, index) {
					var modifier = self.options.top100SortRev ? -1 : 1;
					
					if (needle[0] < item[0]) return -1 * modifier;
					if (needle[0] > item[0]) return 1 * modifier;
					
					if (needle[1] < item[1]) return -1 * modifier;
					if (needle[1] > item[1]) return 1 * modifier;
					
					return 0;
				});
				
				if (index < 0) {
					rows.splice(Math.abs(index)-1, 0, [sortValue, data[key].name, html]);
				}
				else {
					rows.splice(index, 0, [sortValue, data[key].name, html]);
				}
			}
			
			var finalHTML = '';
			for (var i = 0; i < rows.length; i++) {
				finalHTML += '<tr class="' + (i % 2 == 0 ? 'odd' : 'even') + '">' + rows[i][2] + '</tr>';
			}
			
			tbody.html(finalHTML);
			
			this._top100Section.show();
		}
		
		$('#Tabs li').removeClass('selected');
		$('#Tab_Top100').addClass('selected');
	}
	
});

})(jQuery);