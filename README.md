# jquery-filtersearch

This jQuery plugin provides a basic functionality to view and manipulate a search result list.

## Functionalities

- Filtering search results
- Pagination
- Sorting

## Basic Usage

- Create DOM-elements for the different functionalities
- Activate filtersearch

```html
<div id="sort-columns"></div>
<div id="search-results"></div>
<div id="filter-container"></div>
<div id="pagination-container"></div>
<script>
  var options = {};
  options.data = [...];
  options.sortContainer = "#sort-columns";
  options.filterContainer = "#filter-container";
  options.paginationContainer = "#pagination-container";
  
  $("#search-results").filtersearch(options);
</script>
```

## Options
- `data` contains all search results as an array of javascript objects
- `renderItem` is a function with the parameter item, that allows custom rendering for a search result
- `sortColumns` list of javascript objects that list properties that are sortable. Each list entry is a javascript object having the following attributes: property (the property of the item), label (label of the control for sorting)
- `sortContainer` is the CSS-selector on which to add markup for the sort controls
- `filterColumns` list of javascript objects that list properties that a user may filter. See section *filtering* for more info on that.
- `filterContainer` is the CSS-selector on which to add markup for the filter controls
- `pagination` number of search results per page. If 0, no pagination will be used. Default: 0
- `paginationContainer` is the CSS-selector on which to add markup for the pagination control


### Filtering
You can pass filter columns via the `filterColumns` option during initialization.
Each Filter object consists of 3 properties:

- `property` the name of the property to filter
- `label` Label for the filter category
- `Logic` determines the filter behaviour

Filtering works even on attributes that are arrays! But only with depth 1.

#### Property
The property to filter. This plugin automatically aggregates all possible value for this attribute and even displays the amount of matches next to the filter-value.

#### Label
A label for the filter category

#### Logic
A method that describes how the filter matches. Can be "or", "and" or "xor".
Or means that an item matches a filter, if one or more condition fits.
And means that an item matches a filter, if all condition fit.
Xor means that only one filter value can be selected and an item has to fit on it to match [not supported yet].

## Customizing this plugin

### Custom rendering for search results
In `option`, provide: `renderItem: function(item) { ... }` and return a string that contains the full markup.

### Custom sorting method
In `option`, provide: `sortMethod: function(property) { ... }` that returns a function with two parameters `a`, `b` that compares two items on the given property.

### Custom filter rendering
In `option` provide: `renderFilter: function(propertyList) { ... }` that returns full markup as string for filter rendering
`propertyList` is a javascript object, that looks like the following schema:

```javascript
propertyList = {
  propertyname : { 
    label : "label", 
    characteristics : { valueA : 1, valueB : 5, valueC : 3 } /* value is the number of matches */
  }
}
```

# Bugs
Please report any bug you see or fix it yourself and contribute :-)
