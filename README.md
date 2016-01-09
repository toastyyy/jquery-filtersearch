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

### Filter objects
Filter Objects are plain Javascript Objects that have a title, a compare function and a value function.

The compare function is used to check if the selected values of the filter are matching on an item. If this function returns `true`, the item will be part of the newly rendered result list. Thus, a filter needs to know wether its values are fitting on an item or not.

The value function returns a list of objects or a string that determine which values an item actually has. This is used for rendering the filter column as you need to provide a label, a value and a priority for rendering.

The title will be rendered over the list of values for the filter.

Example for a filter (taken from demo):
```
{
	title: "Genre",
	compareFunction: function (obj, selectedValues) {
		var match = false;
		if(selectedValues.length === 0) { return true; }
			for(var sv in selectedValues) {
				if(obj.genres.indexOf(selectedValues[sv]) > -1) {
					match = true;
					break;
				}
			}
		return match;
	},
	getValueFunction: function (obj) {
		if(obj.genres.length === 0) {
		return false;
		}
		return obj.genres;
	}
}
```
