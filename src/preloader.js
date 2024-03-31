preloader = {}

{

let shouldMoveOn = true

preloader.wait = function() {
	shouldMoveOn = false
}

const files = [
	"src/startup.js",
	"src/animation.js",
	"src/helpers.js",
	"src/innovations/production.js",
	"src/innovations/replicator.js",
	"src/innovations/farm.js",
	"src/innovations/research.js",
	"src/innovations/particles.js",
	"audio/music.js",
	"src/changelog.js",
	"src/main.js",
]

let i = 0

function loadNext() {
	shouldMoveOn = true
	const src = files[i++]
	if (!src) {
		document.getElementById("loading").remove()
		return
	}
	const script = document.createElement("script")
	script.src = src
	script.onload = ()=>{
		if (shouldMoveOn) loadNext()
	}
	document.body.append(script)
}

preloader.loadNext = loadNext

onload = loadNext

}