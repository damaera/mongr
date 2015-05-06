var mongo = require('mongoskin');
var _ = require('lodash');

var vertexName = {};
var ret = {};
var doc;


module.exports = function(url, docName){
	var db = mongo.db(url, {native_parser:true});
	doc = db.bind(docName);

	ret.delete = function(data, callback){
		doc
			.remove(data, function(err, result){
				callback(err, result);
			});
	}

	ret.update = function(data, update, callback){
		doc
			.update(data, { $set : update }, { multi : true }, function(err, row){
				callback(err, row)
			})
	}

	ret.insert = function(data, callback){
		doc
			.insert(data, function(err, result){
				callback(err, result);
			});
	}

	ret.search = function(dataSearch, callback){
		vertexName = {}
		var dataLen = dataSearch.length;

		var dataArr = [];

		for (var i = dataLen - 1; i >= 0; i--) {
			dataArr.push(dataSearch[i])
		};
		traverse(dataLen, dataArr, callback)
	}

	return ret;
}

function traverse(iRecursive, data, callback){
	iRecursive--;

	var subj = data[iRecursive].subj;
	var pred = data[iRecursive].pred;
	var obj = data[iRecursive].obj;

	if (subj == undefined) {
		subj = '';
		delete data[iRecursive].subj
	};
	if (pred == undefined) {
		pred = '';
		delete data[iRecursive].pred
	};
	if (obj == undefined) {
		obj = '';
		delete data[iRecursive].obj
	};

	var nulledProp = 0;

	var subjName, predName, objName;

	if (subj[0] == '$') {
		nulledProp += 1;
		subjName = subj.substring(1);
		if (vertexName[subjName]) {
			data[iRecursive].subj = { $in : vertexName[subjName] }
		}
		else{
			vertexName[subjName] = []
			delete data[iRecursive].subj
		}
	}
	else if(subj[0] == '!' && subj[1] == '$'){
		nulledProp += 1;
		subjName = subj.substring(2);
		if (vertexName[subjName]) {
			data[iRecursive].subj = { $nin : vertexName[subjName] }
		}
		else{
			vertexName[subjName] = []
			delete data[iRecursive].subj
		}
	}
	if (pred[0] == '$') {
		nulledProp += 2;
		predName = pred.substring(1);
		if (vertexName[predName]) {
			data[iRecursive].pred = { $in : vertexName[predName] }
		}
		else{
			vertexName[predName] = []
			delete data[iRecursive].pred
		}
	}
	else if(pred[0] == '!' && pred[1] == '$'){
		nulledProp += 2;
		predName = pred.substring(2);
		if (vertexName[predName]) {
			data[iRecursive].pred = { $nin : vertexName[predName] }
		}
		else{
			vertexName[predName] = []
			delete data[iRecursive].pred
		}
	}
	if (obj[0] == '$') {
		objName = obj.substring(1);
		nulledProp += 4;
		if (vertexName[objName]) {
			data[iRecursive].obj = { $in : vertexName[objName] }
		}
		else{
			vertexName[objName] = []
			delete data[iRecursive].obj
		}
	}
	else if(obj[0] == '!' && obj[1] == '$'){
		nulledProp += 4;
		objName = obj.substring(2);
		if (vertexName[objName]) {
			data[iRecursive].obj = { $nin : vertexName[objName] }
		}
		else{
			vertexName[objName] = []
			delete data[iRecursive].obj
		}
	}
	doc
		.find(data[iRecursive])
		.toArray(function(err, result){
			if(nulledProp & 1){
				vertexName[subjName] = _.uniq(_.pluck(result, 'subj'));
			}
			if(nulledProp & 2){
				vertexName[predName] = _.uniq(_.pluck(result, 'pred'));
			}
			if(nulledProp & 4){
				vertexName[objName] = _.uniq(_.pluck(result, 'obj'));
			}
			if (iRecursive === 0) {
				vertexName.value = result;
				callback(err, vertexName)
			}
			else{
				traverse(iRecursive, data, callback)
			}
		})
}