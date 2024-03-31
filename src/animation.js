const Animations = {
	// Linear
	Linear: x=>x,
	// Sine
	EaseInSine: x=> 1 - Math.cos((x * Math.PI) / 2),
	EaseOutSine: x=> Math.sin((x * Math.PI) / 2),
	EaseInOutSine: x=> -(Math.cos(Math.PI * x) - 1) / 2,
	// Quadratic
	EaseInQuad: x=> x**2,
	EaseOutQuad: x=> 1-(1-x)**2,
	EaseInOutQuad: x=> x < 0.5 ? (x**2)*2 : (1-(1-x)**2*2),
	// Cubic
	EaseInCubic: x=> x**3,
	EaseOutCubic: x=> 1-(1-x)**3,
	EaseInOutCubic: x=> x < 0.5 ? (x**3)*4 : (1-(1-x)**3*4),
	// Expo
	EaseInExpo: x=>x === 0 ? 0 : Math.pow(2, 10 * x - 10),
	EaseOutExpo: x=>x === 1 ? 1 : 1 - Math.pow(2, -10 * x),
	EaseInOutExpo: x=>x === 0 ? 0 : (x === 1 ? 1 : (x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2))
}

function Animate(obj, prop, start, end, time=1, animation=Animations.EaseInOutSine, ...animationParameters) {
	return AnimateFunc((v)=>obj[prop]=v, start, end, time, animation, ...animationParameters)
}

function AnimateFunc(callback, start, end, time=1, animation=Animations.EaseInOutSine, ...animationParameters) {
	let i
	let t
	const promise = new Promise(function(resolve) {
		if (start === null) start = obj[prop]
		let ms = time*1000
		let startTime = Date.now()
		let endTime = startTime + ms
		let range = end - start
		i = setInterval(function(){
			let percent = (ms-(endTime - Date.now()))/ms
			callback(start + range * animation(percent, ...animationParameters))
		})
		t = setTimeout(function(){
			clearInterval(i)
			callback(end)
			resolve()
		}, ms)
		callback(start)
	})
	promise.cancel = function() {
		clearInterval(i)
		clearTimeout(t)
	}
	return promise
}

function wait(ms) {
	return new Promise(function(resolve) {
		setTimeout(function(){
			resolve()
		}, ms)
	})
}

function waitFor(cnd) {
	return new Promise(function(resolve) {
		let i
		i = setInterval(function(){
			if (cnd()) {
				clearInterval(i)
				resolve()
			}
		})
	})
}