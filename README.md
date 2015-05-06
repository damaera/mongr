# Mongr
**Mongr** is graph database built on the document-stored MongoDB and its for Node.js!. **Mongr** using subj-pred-obj triplestores for storing graph data.

example data
```javascript
{
	subj : 'ali',
	pred : 'follow',
	obj : 'buddy'
}
```

## Install

on Node.js

```
npm install mongr --save
```

## Usage

Initializing database

```javascript
var mongr = require('mongr')

var db = mongr('your/mongodb/url/', 'graph-name')
// example
// var db = mongr('mongodb://localhost:27017/graphdb', 'mongr')
```

## Insert

Data which inserted is must be an **Array**. Insert single or multiple data.

```javascript
var insertData = [{
	subj : 'ali',
	pred : 'follow',
	obj : 'ando'
}, {
	subj : 'ando',
	pred : 'follow',
	obj : 'eddy'
}]

db.insert(insertData, function(err, result) {
	// do something when inserting done
})
```

## Properties

Triplestore can also adding with properties.

```javascript
var insertData = [{
	subj : 'ali',
	pred : 'follow',
	obj : 'ando',
	time : new Date(),
	cost : 10
}]

db.insert(insertData, function(err, result) {
	// do something when inserting done
})
```

## Search

Searching graph data. Data must be array.

```
(subj) -: (pred) -> (obj)

example data

a -: follow -> b
a -: follow -> c
b -: follow -> c
b -: follow -> a
c -: follow -> d
```

Search who 'a' follows.

```javascript
var searchData = [{
	subj : 'a',
	pred : 'follow',
	obj : '$following'
}]

db.search(searchData, function(err, result) {
	console.log(result)
	// result is something like this
	// {
	// 	following: ['b', 'c'],
	//	value: [ {...} ]
	// }
})
```

Another example, Search who 'a' follows and following back to 'a'.

```javascript
var searchData = [{
	subj : 'a',
	pred : 'follow',
	obj : '$following'
}, {
	subj : '$following',
	pred : 'follow',
	obj : 'a'
}]

db.search(searchData, function(err, result) {
	console.log(result)
	// result is something like this
	// {
	// 	following: ['b'],
	//	value: [ {...} ]
	// }
})

Another example, Search follow of follow from 'a'.

```javascript
var searchData = [{
	subj : 'a',
	pred : 'follow',
	obj : '$following'
}, {
	subj : '$following',
	pred : 'follow',
	obj : '$followOfFollow'
}]

db.search(searchData, function(err, result) {
	console.log(result)
	// result is something like this
	// {
	// 	following: ['b', 'c'],
	// 	followOfFollow: ['a', 'b', 'c', 'd'],
	//	value: [ {...} ]
	// }
})
```

## Update

Updating multiple data.

```javascript
db.update(
	{
		pred : 'follow'
	},
	{
		pred : 'flw'
	},
	function(err, rowAffected) {
	// do something when updating done
	}
)
```

## Delete

Deleting

```javascript
db.delete({
		pred : 'follow'
	}, function(err, rowAffected) {
		// do something when updating done
})
```

