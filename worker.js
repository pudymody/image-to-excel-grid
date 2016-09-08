importScripts("xlsx.core.min.js");
function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return componentToHex(r) + componentToHex(g) + componentToHex(b);
}


self.onmessage = function(e){
	var data = e.data;
	var parsed = { height : data.height, width : data.width, data : [] };
	for( var i = 0, l = data.data.length; i < l; i+=4){
		parsed.data.push({
			r : data.data[i],
			g : data.data[i+1],
			b : data.data[i+2],
			a : data.data[i+3]
		});
	}

	var dataFile = parsed.data.reduce(function( prev, current, index ){
		var currentRow = Math.floor(index / parsed.width);
		var currentColumn = index % (parsed.width);

		var id = XLSX.utils.encode_cell({ c: currentColumn , r: currentRow});
		prev[id] = {
			t : 's',
			v : "",
			s : {
				fill : {
					patternType : "solid",
					fgColor : { rgb: rgbToHex(current.r, current.g, current.b) },
					width: 2,
					height : 2
				}
			}
		};

		return prev;
	}, {});

	dataFile["!ref"] = XLSX.utils.encode_range({
		s : { c: 0, r: 0},
		e : { c: data.width - 1, r: data.height - 1},
	});

	dataFile["!cols"] = [];
	for( var i = 0; i < data.width; i++){
		dataFile["!cols"].push({
			wpx : 1
		});
	}

	var wb = {
		SheetNames : ["Image"],
		Sheets : {
			"Image" : dataFile
		}
	};

	var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});
	var blob = new Blob([s2ab(wbout)], {type : "application/octet-stream"});
	var url = URL.createObjectURL(blob);
	postMessage(url);
};
