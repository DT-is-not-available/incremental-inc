addEventListener("click", ()=>{
	const out = document.getElementById("out")
	
	function write(text) {
		out.append("\n"+text)
	}
	
	write("Loading...")
	function audio(uri) {
		return new Promise(function(resolve, reject) {
			var context = new (window.AudioContext || window.webkitAudioContext)(),
				request = new XMLHttpRequest()
			
			request.responseType = "arraybuffer"
			request.open("GET", uri, true)
			
			var gainNode = context.createGain()
			
			// XHR failed
			request.onerror = function() {
				reject(new Error("Couldn't load audio from " + uri))
			}
			
			// XHR complete
			request.onload = function() {
				return resolve(request.response)
				
				context.decodeAudioData(request.response,function(buffer){
					resolve(buffer)
				},function(err){
					// Audio was bad
					reject(new Error("Couldn't decode audio from " + uri))
				})
			}
			
			request.send()
		})
	}
	
	Promise.all([
		audio("audio/inc-hihat.ogg")
	]).then(arr=>{
		write(JSON.stringify(arr, null, "\t"))
		console.log(arr)
	}).catch(err=>{
		alert(err)
		throw err
	})
}, {once:true})