# jquery-filtersearch

This jQuery plugin provides a basic functionality to view and manipulate a search result list.

## Functionalities

- Filtering search results
- Pagination
- Sorting

## Installation

Install via bower:

```
bower install toastyyy/jquery-filtersearch
```

## Documentation

A basic instance of this plugins should consist of a list of filters, sorters and of course a list of data as Javascript Objects.
To enable filtersearch for your page, simply call the filtersearch method on your jQuery object:

```
$("#search-results").filtersearch({
			sortContainer: "#sorter-column",
			paginationContainer: "#pagination-column",
			filterContainer: "#filter-column",
			data: data,
			renderItem: renderItem,
			pagination: 5,
			filterList: filters,
			sorterList: [],
			preRender: function(opts) {},
			postRender: function(opts) {}
		});
```

- `sortContainer` is the wrapper that should contain sorter markup
- `paginationContainer` is the wrapper that should contain pagination markup
- `filterContainer` is the wrapper that should contain filter markup
- `data` is the list of javascript objects that represent the search result (model)
- `renderItem` is a custom rendering method for search results
- `pagination` represents the number of search results per page. If set to 0, no pagination will be used
- `filterList` is a list of filter objects
- `sorterList` is a list of sorter objects
- `preRender` will be called *before* the result list is rendered
- `postRender` will be called *after* the result list is rendered
