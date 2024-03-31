class MusicLooper {
	constructor(parts) {
		this.parts = parts
		this.volume = 1
		this.partGains = {}
		for (const [k, v] of Object.entries(this.parts)) {
			this.partGains[k] = 0
		}
	}
	play(time=0, delay=0, loopPos=0) {
		for (const [k, v] of Object.entries(this.parts)) {
			v.play(time, delay, loopPos)
		}
	}
	stop() {
		for (const [k, v] of Object.entries(this.parts)) {
			v.stop()
		}
	}
	gainPart(part, value) {
		this.parts[part].gain(value*this.volume)
		this.partGains[part] = value
	}
	gainAll(value) {
		for (const [k, v] of Object.entries(this.parts)) {
			v.gain(value*this.volume)
			this.partGains[k] = value
		}
	}
	setVolume(value) {
		this.volume = value
		for (const [k, v] of Object.entries(this.parts)) {
			v.gain(this.partGains[k]*this.volume)
		}
	}
}
let music
{
	const loops = {}
	function onAudioReady() {
		console.timeEnd("Music loading")
		music = new MusicLooper(loops)
		music.play(0, 0.1, 64)
		music.gainAll(0)
		const doMusic = async function() {
			await waitFor(_=>!GAME.tip)
			AnimateFunc(v=>music.gainPart("hihat",v), 0, 1, 5)
			await waitFor(_=>getUpgrade("generators"))
			AnimateFunc(v=>music.gainPart("kick",v), 0, 1, 5)
			await waitFor(_=>GAME.autocount > 0)
			AnimateFunc(v=>music.gainPart("snarekick",v), 0, 1, 5)
			await waitFor(_=>GAME.autocount > 2)
			AnimateFunc(v=>music.gainPart("piano1",v), 0, 1, 5)
			await waitFor(_=>getUpgrade("twohands"))
			AnimateFunc(v=>music.gainPart("bitdrums",v), 0, 1, 5)
			await waitFor(_=>getUpgrade("replicator"))
			let saw = AnimateFunc(v=>music.gainPart("saw",v), 0, 1, 5)
			await waitFor(_=>getUpgrade("replicate2")||getUpgrade("wave1")||getUpgrade("farming"))
			AnimateFunc(v=>music.gainPart("triangle",v), 0, 1, 5)
			await waitFor(_=>getUpgrade("farming"))
			saw.cancel()
			AnimateFunc(v=>music.gainPart("saw",v), music.partGains["saw"], 0, 5)
			AnimateFunc(v=>music.gainPart("piano2",v), 0, 1, 5)
		}
		doMusic()
	}
	addEventListener("mouseup", function() {
		let totalParts = 0
		function load(part) {
			totalParts ++
			loopify(`audio/inc-${part}.ogg`, function ready(err, loop) {
				if (err) {
					console.error(err)
				} else {
					totalParts --
					loops[part] = loop
					if (totalParts == 0) onAudioReady()
				}
			})
		}
		return
		console.time("Music loading")
		load("hihat")
		load("kick")
		load("snarekick")
		load("piano1")
		load("bitdrums")
		load("saw")
		load("triangle")
		load("piano2")
		load("square1")
	}, {once:true})
}