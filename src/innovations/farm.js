const plots = $("plots")
const plotlist = []

// plot setup
function createPlot(pl) {
	const plot = document.createElement("div")
	function addPlotStem(n, skip=false) {
		const stem = document.createElement("span")
		stem.className = "stem"
		stem.innerText = n
		let container = plot
		let prevRand = Math.floor(Math.random()*3)-1
		let deviation = 0
		let index = 0
		while (container.lastChild instanceof Element) {
			container = container.lastChild
			prevRand = parseInt(container.dataset.rand)
			if (index < 2 && deviation + prevRand != 0) deviation += prevRand
			index ++
		}
		stem.dataset.index = index
		if (deviation < -1) deviation = -1
		if (deviation > 1) deviation = 1
		if (index == 0) stem.dataset.rand = 0
		else if (index == 1 || (index == 2 && Math.floor(Math.random()*2))) {
			stem.dataset.rand = Math.floor(Math.random()*2)*2-1
		}
		else if (index <= 3) {
			stem.dataset.rand = Math.floor(Math.random()*3)*-deviation
		}
		else {
			stem.dataset.rand = - deviation * 2
		}
		container.append(stem)
		if (!skip) pl.numbers.push(n)
	}
	plot.className = "plot"
	for (let i = 0; i < pl.numbers.length; i++) {
		addPlotStem(pl.numbers[i], true)
	}
	plots.append(plot)
	plot.onclick = function() {
		if (pl.numbers.length == 0) {
			const v = ~~(Math.random()*GAME.maxstemval+1)
			addPlotStem(v)
			createParticle("-"+v.toTString(G.settings.numberFormat), mouseX, mouseY, "#f77")
			GAME.score -= BigInt(v)
			sfx["plant"+Math.floor(Math.random()*3+1)].play()
			return
		}
		let v = 0n
		for (let i = 0; i < pl.numbers.length; i++) {
			v += BigInt(pl.numbers[i] * 10**i)
		}
		plot.innerText = ""
		if (v > 1000000n) {
			v /= -100n
			createParticle(v.toTString(G.settings.numberFormat), mouseX, mouseY, "#f77")
		} else {
			createParticle("+"+v.toTString(G.settings.numberFormat), mouseX, mouseY)
		}
		GAME.score += v
		pl.numbers = []
		if (v < 0) 
			sfx.omen.play()
		else
			sfx.harvest.play()
	}
	plotlist.push({
		addStem: addPlotStem,
		dat: pl,
		elem: plot
	})
}

for (let i = 0; i < GAME.plots.length; i++) {
	createPlot(GAME.plots[i])
}

// unlock upgrade
if (getUpgrade("farming")) $("farms").classList.remove("disabled")
createUpgrade("farming",
	"Farming",
	"Unlocks generators for automatic production",
	20000n,
	function() {
		$("farms").classList.remove("disabled")
		GAME.farm = true
	},
	_=> GAME.score >= 15000n
)
// buttons
makeCost($("farmcost"), $("farmbuy"), function() {
	$("farmcount").innerText = GAME.plots.length.toTString(G.settings.numberFormat)+"/"+GAME.maxplots.toTString(G.settings.numberFormat)
	return GAME.farmcost
})
$("farmbuy").onclick = ()=>{
	if (GAME.score < GAME.farmcost || GAME.plots.length >= GAME.maxplots) return
	sfx.button.play()
	const pl = {
		growtime: 0,
		numbers: []
	}
	createPlot(pl)
	GAME.plots.push(pl)
	GAME.score -= GAME.farmcost
	GAME.farmcost *= 145n
	GAME.farmcost /= 100n
}
// farm update logic
GAME.events.on("update", (dt)=>{
	if (!GAME.farm) return
	for (let i = 0; i < plotlist.length; i++) {
		const {elem, addStem, dat} = plotlist[i]
		if (dat.numbers.length >= GAME.maxplantlength || dat.numbers.length == 0) {
			dat.growtime = 0
			continue
		}
		dat.growtime += dt*GAME.farmspeed
		if (dat.growtime > 20) {
			dat.growtime = 0
			addStem(Math.floor(Math.random()*GAME.maxstemval + 1))
		}
	}
})
// boost upgrades
createUpgrade("farmland1",
	"Bigger farmland",
	"Increases your maximum plots by 6",
	300000n,
	function() {
		GAME.maxplots += 6
		if (GAME.maxplots == 18) award("Built on a throne of lies")
	},
	_=> GAME.farm
)
createUpgrade("farm34",
	"3s and 4s",
	"Increases maximum crop yield",
	1_000_000n,
	function() {
		GAME.maxstemval += 2
		if (GAME.maxstemval == 6) award("Built on a throne of lies")
	},
	_=> GAME.farm
)
createUpgrade("speedgrow",
	"Greenhouse",
	"Speeds up crop growth 2.5x",
	2_000_000n,
	function() {
		GAME.farmspeed *= 2.5
	},
	_=> getUpgrade("farm34") && getUpgrade("farmland1")
)
createUpgrade("farm56",
	"5s, 6s and 7s",
	"Increases maximum crop yield",
	5_000_000n,
	function() {
		GAME.maxstemval = 7
	},
	_=> getUpgrade("speedgrow")
)
createUpgrade("farmland2",
	"Second floor",
	"Increases your maximum plots by 12",
	10_000_000n,
	function() {
		GAME.maxplots = 24
	},
	_=> getUpgrade("speedgrow")
)