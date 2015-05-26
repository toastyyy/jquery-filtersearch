(function ( $ ) {
	$.fn.filtersearch = function( options ) {
		var source = options.source || 'ajax';
		var url = options.url || '';
		var data = options.data || [];
		var filtered_data = options.data || []; 
		
		var resultContainer = this; // Container for rendered results
		var renderItem = options.renderItem || $.fn.filtersearch.renderItem; // render function for an item
		
		var sortColumns = options.sortColumns || []; // columns that allow sorting
		var sortContainer = options.sortContainer || "#jqfs-sort-columns"; // container for sort list
		var sortMethod = options.sortMethod || $.fn.filtersearch.sortMethod; // default sorting method
		
		var filterColumns = options.filterColumns || []; // columns that allow filtering
		var filterContainer = options.filterContainer || "#jqfs-filter-columns"; // container for filter list
		var renderFilter = options.renderFilter || $.fn.filtersearch.renderFilter; // rendering for filter list
		
		var pagination = options.pagination || 0;
		var maxPagination = options.maxPagination || 0;
		var paginationContainer = options.paginationContainer || "#jqfs-pagination";
		var curpage = 1;
		
		this.renderResults = function() {
			if(pagination > 0) {
				var pagenum = parseInt(filtered_data.length / pagination);
				var p = '<ul class="pagination">';
				for(var i = 1; i <= pagenum; i++) {
					if(curpage == i) {
						p += '<li data-page="'+i+'" class="active">'+i+'</li>';
					} else {
						p += '<li data-page="'+i+'">'+i+'</li>';
					}
					
				}
				p += '</ul>';
				$(paginationContainer).html(p);
				$("ul.pagination>li[data-page]").click(function() {
					curpage = $(this).data("page");
					renderList();
				});
			}
			var markup = "";
			if(pagination > 0) {
				for(var i = (curpage - 1) * pagination; i <= Math.min(curpage * pagination - 1, filtered_data.length); i++) {
					markup += renderItem(filtered_data[i]);
				}
			} else {
				for(var i = 0; i <= filtered_data.length; i++) {
					markup += renderItem(filtered_data[i]);
				}
			}
			
			
			resultContainer.html(markup);
		};
		
		var renderList = this.renderResults; // for usage in internal functions.
		
		
		/* sorts elements in data-list by property-data-attributeusing sortMethod function */
		this.sorting = function() {
			filtered_data.sort($.fn.filtersearch.sortMethod($(this).data("property")));
			if($(this).hasClass("asc")) {
				$(sortContainer + " li").removeClass("asc");
				$(sortContainer + " li").removeClass("desc");
				$(this).addClass("desc");
				filtered_data.reverse();
			} else if($(this).hasClass("desc")) {
				$(sortContainer + " li").removeClass("asc");
				$(sortContainer + " li").removeClass("desc");
				$(this).addClass("asc");
			} else {
				$(sortContainer + " li").removeClass("asc");
				$(sortContainer + " li").removeClass("desc");
				$(this).addClass("asc");
			}
			renderList();
		};
		
		var sorting = this.sorting;
		
		this.renderSortContainer = function() {
			// sorting columns
			var sortlist = $("<ul>");
			sortlist.addClass("jqfs-sort");
			$(sortContainer).html(sortlist);
			for(var s in sortColumns) {
				var sortentry = $("<li>");
				sortentry.data("property", sortColumns[s].property);
				sortentry.text(sortColumns[s].label || sortColumns[s].property);
				sortentry.appendTo(sortlist);
				sortentry.on("click", sorting);
			}
		};
		
		var renderSort = this.renderSortContainer;
		
		this.renderFilterContainer = function() {
			/* get count of all filter attributes and characteristics */
			var attrs = {};
			for(var f in filterColumns) {
				filter = filterColumns[f];
				attrs[filter.property] = { label : filter.label, logic : filter.logic, characteristics : {} };
				for(var i in data) {
					var item = data[i]
					if(filter.property in item) { // item has filter property
						var val = item[filter.property];
						if(typeof val == "string") {
							if(val in attrs[filter.property].characteristics) {
								attrs[filter.property].characteristics[val]++;
							} else {
								attrs[filter.property].characteristics[val] = 1;
							}
						} else if (typeof val == "object"){
							for (var j in val) {
								if(val[j] in attrs[filter.property].characteristics) {
									attrs[filter.property].characteristics[val[j]]++;
								} else {
									attrs[filter.property].characteristics[val[j]] = 1;
								}
							}
						}
						
					}
				}
			}
			
			var markup = renderFilter(attrs);
			var filters = {};
			$(filterContainer).html(markup);
			
			$('[data-filter-property]').each(function() {
				var property = $(this).data("filter-property");
				$(this).children('[data-filter-value]').each(function() {
					$(this).click(function() {
						$(this).toggleClass("active");
						if($(this).hasClass("active")) {
							if(property in filters) {
								filters[property].values.push($(this).data("filter-value"));
							} else {
								filters[property] = { logic : attrs[property].logic, values : [$(this).data("filter-value")] };
							}
						} else {
							for(var i in filters[property].values) {
								if(filters[property].values[i] == $(this).data("filter-value")) {
									filters[property].values.splice(i, 1); // remove it
								}
							}
						}
						filtered_data = $.fn.filtersearch.applyFilterList(filters, data);
						curpage = 1;
						renderList();
					});
				});
			});
		};
		
		var renderFilterContainer = this.renderFilterContainer;
		
		renderList();
		renderSort();
		renderFilterContainer();
	}
	
	/*
	Renders a single item into html. Expected to return a string that contains markup.
	*/
	$.fn.filtersearch.renderItem = function(item) {
		var markup = "";
		markup += "<h2>"+item.name+"</h2>";
		markup += "<p>" + item.description + "</p>";
		markup += "<em>" + item.price + "</em>";
		return markup;
	};
	
	/*
	Default behaviour for sorting elements. Returns a sorting function that compares 2 items.
	*/
	$.fn.filtersearch.sortMethod = function(key) {
		return function(a,b) {
			if(a[key] > b[key]) {
				return 1;
			} else if(a[key] < b[key]) {
				return -1;
			} else {
				return 0;
			}
		};
	}
	
	$.fn.filtersearch.renderFilter = function(propertyList) {
		var markup = "<ul>";
		for(var property in propertyList) {
			var filterentry = "<li>";
			filterentry += "<strong>" + propertyList[property].label + "</strong>";
			filterentry += '<ul data-filter-property="'+property+'">';
			for(var c in propertyList[property].characteristics) {
				filterentry += '<li data-filter-value="'+c+'"><a>'+c+' ('+propertyList[property].characteristics[c]+')</a></li>';
			}
			filterentry += "</ul>";
			filterentry += "</li>";
			markup += filterentry;
		}
		markup += "</ul>";
		return markup;
	}
	
	/* 
		Applies all filters on all items and returns the new list. 
		filters is an array of objects containing information of the filtered property, the values and the logic (and, or, xor)
	*/
	$.fn.filtersearch.applyFilterList = function(filters, items) {
		var newlist = [];
		
		for(var i in items) {
			var itm = items[i];
			var addme = true;
			
			for(var property in filters) {
				var filter = filters[property];
				
				if(filter.logic == "or") { // any of the filter must match
					if(typeof itm[property] == "string") {
						if(filter.values.indexOf(itm[property]) == -1) { addme = false; }
					} else if (typeof itm[property] == "object") {
						var match = false;
						for(var j in itm[property]) {
							if(filter.values.indexOf(itm[property][j]) > -1) {
								match = true;
								break;
							}
						}
						if(!match) { addme = false; }
					}
				} else if (filter.logic == "and") { // all crits must match
					if(typeof itm[property] == "string") { // strange case, matches "val" = ["val", "val", ...]
						var match = true;
						for(var j in filter.values) {
							if(filter.values[j] != itm["property"]) { match = false; break; }
						}
						if(!match) { addme = false; }
					} else if(typeof itm[property] == "object") { // all list entries of filter are in the items list
						var match = true;
						for(var j in filter.values) {
							if(itm[property].indexOf(filter.values[j]) == -1) {
								match = false;
							}
						}
						if(!match) { addme = false; }
					}
				} else if (filter.logic == "xor") { // only one can match and only one selectable
					
				}
			}
			
			if(addme) { newlist.push(itm); }
		}

		return newlist;
	}
}( jQuery ));