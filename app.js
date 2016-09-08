var $file = document.querySelector('input');
var imageWorker = new Worker('worker.js');

imageWorker.onmessage = function(e){
	var a = document.createElement('a');
		a.download = "image.xlsx";
		a.href = e.data;
		a.innerText = "Download image";
		a.className = "btn btn--download";
	document.body.appendChild(a);
	document.body.classList.remove('is-loading');
};

function makeCanvas( file ){
	return new Promise(function( resolve, reject ){
		var url = URL.createObjectURL(file);
		var img = new Image();
		img.onload = function(){
			var canvas = document.createElement('canvas');
				canvas.width = this.width;
				canvas.height = this.height;

			var ctx = canvas.getContext('2d');
			ctx.drawImage( this, 0, 0 );
			URL.revokeObjectURL( this.src );
			resolve(canvas);
		};
		img.onerror = reject;
		img.src = url;
	});
}

$file.addEventListener('change', function(e){
	document.body.classList.add('is-loading');
	var file = e.target.files[0];
	makeCanvas(file)
		.then(function( canvas ){
			var imageData = canvas.getContext('2d').getImageData(0,0, canvas.width, canvas.height );
			imageWorker.postMessage(imageData);
		})
		.catch(console.error);
});
