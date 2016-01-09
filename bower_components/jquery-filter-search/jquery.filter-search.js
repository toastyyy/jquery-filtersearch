(function ($) {
    $.fn.filtersearch = function (options) {
        options.resultContainer = this;
        for (var f in options.filterList) {
            options.filterList[f].logic = options.filterList[f].logic || "any";
            options.filterList[f].labelMapping = options.filterList[f].labelMapping || {};
            options.filterList[f].selectedValues = [];
        }
        for (var i = 0; i < options.sorterList.length; i++) {
            options.sorterList[i].active = false;
            options.sorterList[i].direction = "asc";
        }
        var opts = $.extend({}, $.fn.filtersearch.defaults, options);
        opts.filteredData = opts.data;
        $.fn.filtersearch.renderFilterWrapper(opts);
        $.fn.filtersearch.renderResults(opts.data, 1, opts);
        var updateFilterSearchData = function(data) {
            opts.data = data;
            opts.filteredData = data;
            $.fn.filtersearch.renderResults(opts.data, 1, opts);
            for (var f in opts.filterList) {
                opts.filterList[f].logic = options.filterList[f].logic || "any";
                opts.filterList[f].labelMapping = options.filterList[f].labelMapping || {};
                opts.filterList[f].selectedValues = [];
            }
            opts.renderFilterWrapper(opts);
        };
        $.fn.updateFilterSearchData = updateFilterSearchData;
    };

    $.fn.filtersearch.applyFilters = function (filters, items, opts) {
        if (Array !== filters.constructor) {
            filters = [filters];
        }
        if (filters.length === 0) {
            return items;
        }
        var newlist = [];
        for (var i in items) {
            var itm = items[i];
            var addme = 0; // -1: failed, 0: init, 1: add
            for (var f in filters) {
                if (typeof filters[f].applyFilter === 'function') {
                    itm = filters[f].applyFilter(itm, filters[f]);
                } else {
                    itm = opts.applyFilter(itm, filters[f]);
                }

                if (itm === false) {
                    addme = -1;
                } else {
                    addme = 1;
                }
            }
            if (addme === 1) {
                newlist.push(itm);
            }
        }
        return newlist;
    };

    $.fn.filtersearch.applyFilter = function (item, filter) {
        var result = false;
        if (filter.compareFunction(item, filter.selectedValues)) {
            result = item;
        }
        return result;
    }

    $.fn.filtersearch.renderResults = function (items, page, opts) {
        opts.preRender(opts);
        $.fn.filtersearch.renderPagination(items, page, opts);
        $.fn.filtersearch.renderSortList(opts.sorterList, opts);
        // TODO: sortieren
        for(var s in opts.sorterList) {
            if(opts.sorterList[s].active) {
                items = items.sort(opts.sorterList[s].compareFunction);
                if(opts.sorterList[s].direction === "desc") {
                    items = items.reverse();
                }
                break;
            }
        }
        var markup = "";
        if (opts.pagination > 0) {
            for (var i = (page - 1) * opts.pagination; i <= Math.min(page * opts.pagination - 1, items.length - 1); i++) {
                markup += opts.renderItem(items[i], opts);
            }
        } else {
            for (var i = 0; i < items.length; i++) {
                markup += opts.renderItem(items[i], opts);
            }
        }
        $(opts.resultContainer).html(markup);
        opts.postRender(opts);
    };

    /*
     * Calculates values for rendering the filters (count etc.)
     */
    $.fn.filtersearch.renderFilterWrapper = function (opts) {
        /**
         * Get possible values for the attribute in the data.
         */
        var attrs = [];
        var filterMarkup = $("<ul>");
        for (var f in opts.filterList) {
            attrs = [];
            // First apply OTHER filters that are active ...
            var filteredData = opts.data;
            for (var i in opts.filterList) {
                if (opts.filterList[i].title !== opts.filterList[f].title) { // not the same filter, apply!
                    filteredData = $.fn.filtersearch.applyFilters(opts.filterList[i], filteredData, opts);
                }
            }

            var filter = opts.filterList[f];
            for (var d in filteredData) {
                var alreadyInList = false;
                var val = filter.getValueFunction(filteredData[d]);
                if (val !== false) {
                    if (typeof val === 'string') {
                        for(var a in attrs) {
                            if(attrs[a].label == val) {
                                attrs[a].count++;
                                alreadyInList = true;
                            }
                        }
                        if(!alreadyInList) {
                            attrs.push({ label : val, count : 1, order : 1, value: val });
                        }
                    } else {
                        for (var v in val) {
                            if(typeof val[v] === 'string') {
                                for(var a in attrs) {
                                    if(attrs[a].label == val[v]) {
                                        attrs[a].count++;
                                        alreadyInList = true;
                                    }
                                }
                                if(!alreadyInList) {
                                    attrs.push({ label : val[v], count : 1, order : 1, value: val[v] });
                                }
                            } else {
                                for(var a in attrs) {
                                    if(attrs[a].label == val[v].label) {
                                        attrs[a].count++;
                                        alreadyInList = true;
                                    }
                                }
                                if(!alreadyInList) {
                                    val[v].count = 1;
                                    attrs.push(val[v]);
                                }
                            }
                            
                        }
                    }
                }     
            }
            attrs.sort(function(a,b) { if(a.order < b.order) { return 1; } else { return -1; }});
            if (attrs.length > 0) {
                if (typeof opts.filterList[f].renderFilter === 'function') {
                    filterMarkup.append(opts.filterList[f].renderFilter(opts.filterList[f], attrs, opts));
                } else {
                    filterMarkup.append(opts.renderFilter(opts.filterList[f], attrs, opts));
                }
            }
        }
        $(opts.filterContainer).html(filterMarkup);
    };

    $.fn.filtersearch.renderFilter = function (filter, propertyList, opts) {
        var filterentry = $("<li>").data("filtername", filter.title);
        filterentry.append("<strong>" + filter.title + "</strong>");
        var valuelist = $("<ul>");
        for (var property in propertyList) {
            var propertyName = propertyList[property].label || propertyList[property].value;
            var obj = $("<li>").data("value", propertyList[property].value);
            if (filter.selectedValues.indexOf(propertyList[property].value) > -1) {
                obj.addClass("active");
            }
            $("<a>").text(propertyName + ' (' + propertyList[property].count + ')').appendTo(obj);

            obj.click(function () {
                if (filter.selectedValues.indexOf($(this).data("value")) > -1) {
                    filter.selectedValues.splice(filter.selectedValues.indexOf($(this).data("value")), 1);
                } else {
                    if(filter.logic === "exclusive") {
                        filter.selectedValues = [];
                    }
                    filter.selectedValues.push($(this).data("value"));
                }
                opts.renderFilterWrapper(opts);
                opts.filteredData = $.fn.filtersearch.applyFilters(opts.filterList, opts.data, opts);
                $.fn.filtersearch.renderResults(opts.filteredData, 1, opts);
            });
            obj.appendTo(valuelist);
            
        }
        valuelist.appendTo(filterentry);
        return filterentry;
    };

    $.fn.filtersearch.renderSortList = function (sorters, opts) {
        var sortMarkup = $("<ul>");
        for (var s in sorters) {
            var sorter = sorters[s];
            var entry = $("<li>").text(sorter.title);
            if(sorter.active) {
                entry.addClass("active");
                entry.addClass(sorter.direction);
                if(sorter.direction === "asc") {
                    entry.append($("<span>").addClass("glyphicon glyphicon-chevron-up"));
                } else {
                    entry.append($("<span>").addClass("glyphicon glyphicon-chevron-down"));
                }
            } else {
                entry.append($("<span>").addClass("glyphicon glyphicon-sort"));
            }
            
            entry.click(function (e) {
                for(var s in opts.sorterList) {
                    opts.sorterList[s].active = false;
                    if(opts.sorterList[s].title === $(this).text()) {
                        sorter = opts.sorterList[s];
                        sorter.active = true;
                    }
                }
                $(this).parent().children().removeClass("active");
                if (sorter.active) {
                    if (sorter.direction === "asc") {
                        sorter.direction = "desc";  
                    } else {
                        sorter.direction = "asc"; 
                    }
                }
                sorter.active = true;
                $(this).addClass("active");
                if(sorter.direction === "asc") {
                    $(this).removeClass("desc");
                    $(this).addClass("asc");
                } else {
                    $(this).removeClass("asc");
                    $(this).addClass("desc");
                }
                $.fn.filtersearch.renderResults(opts.filteredData, opts.curPage, opts);
            });
            sortMarkup.append(entry);
        }
        $(opts.sortContainer).html("");
        sortMarkup.appendTo($(opts.sortContainer));
    }


    $.fn.filtersearch.renderPagination = function (items, page, opts) {
        var pagination = opts.pagination;

        if (pagination > 0) {
            var pagenum = Math.ceil(parseFloat(items.length) / pagination);
            var p = '<ul class="pagination">';
            for (var i = 1; i <= pagenum; i++) {
                if (page === i) {
                    p += '<li data-page="' + i + '" class="active">' + i + '</li>';
                } else {
                    p += '<li data-page="' + i + '">' + i + '</li>';
                }
            }
            p += '</ul>';
            $(opts.paginationContainer).html(p);
            $("ul.pagination>li[data-page]").click(function () {
                opts.curPage = $(this).data("page");
                $.fn.filtersearch.renderResults(items, opts.curPage, opts);
            });
        }
    }

    $.fn.filtersearch.defaults = {
        source: 'json',
        url: '',
        data: [],
        filteredData: [],
        resultContainer: null,
        renderItem: $.fn.filtersearch.renderItem,
        sorterList: [],
        sortContainer: "#jqfs-sort-columns",
        sortMethod: $.fn.filtersearch.sortMethod,
        filterList: [],
        applyFilter: $.fn.filtersearch.applyFilter,
        filterContainer: "#jqfs-filter-columns",
        renderFilterWrapper: $.fn.filtersearch.renderFilterWrapper,
        renderFilter: $.fn.filtersearch.renderFilter,
        pagination: 0,
        paginationContainer: "#jqfs-pagination",
        curPage: 1,
        preRender: function(opts) { },
        postRender: function (opts) { }
    };
})(jQuery);
