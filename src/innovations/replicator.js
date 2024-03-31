// unlock upgrade
if (getUpgrade("replicator")) $("replicator").classList.remove("disabled")
createUpgrade("replicator",
	"Replicator",
	"Unlocks the sinewave replicator",
	500n,
	function() {
		$("replicator").classList.remove("disabled")
		GAME.replicator++
	},
	_=> getUpgrade("twohands")
)
// boost upgrades
createUpgrade("replicate1",
	"Overclocking",
	"Doubles the output of the replicator",
	2500n,
	function() {
		GAME.replicator *= 2
	},
	_=> getUpgrade("replicator")
)
createUpgrade("replicate2",
	"Dangerous Overclocking",
	"Doubles the output of the replicator",
	25000n,
	function() {
		GAME.replicator *= 2
		unhide("Pointless")
	},
	_=> getUpgrade("replicate1")
)
createUpgrade("farmreplicate",
	"Crop-Assisted Overclocking",
	"Quintuples the output of the replicator",
	500000n,
	function() {
		GAME.replicator *= 5
	},
	_=> GAME.farm && getUpgrade("replicate2")
)
createUpgrade("wave1",
	"Dual Processing",
	"Gives the replicator another wave",
	15000n,
	function() {
		GAME.waves ++
		if (GAME.waves == 3) award("Built on a throne of lies")
	},
	_=> getUpgrade("replicate1")
)
createUpgrade("wave2",
	"Tripple the Power",
	"Gives the replicator another wave",
	2_500_000n,
	function() {
		GAME.waves ++
	},
	_=> getUpgrade("wave1")
)
if (getUpgrade("momentum")) $("replicator-bar-canvas").classList.remove("hidden")
else createUpgrade("momentum",
	"Momentum",
	"Allows the replicator to give exponentially better returns, at the risk of overheating",
	7_500_000n,
	function() {
		$("replicator-bar-canvas").classList.remove("hidden")
		GAME.momentum = true
	},
	_=> getUpgrade("wave2") && getUpgrade("farmreplicate")
)

// replicator update logic

const r_ctx = $("replicator-canvas").getContext("2d")
const bar_ctx = $("replicator-bar-canvas").getContext("2d")
let totalTime = 0
let replicator_value = 0
let replicator_momentum = 1
let overheated = false
GAME.events.on("update", (dt)=>{
	document.body.dataset.scroll = document.body.scrollTop
	totalTime += dt
	r_ctx.clearRect(0, 0, 300, 150)
	r_ctx.strokeStyle = r_ctx.fillStyle = overheated ? "#f00" : "#0f0"
	r_ctx.strokeWidth = 1
	
	r_ctx.beginPath()
	r_ctx.moveTo(150, 0)
	r_ctx.lineTo(150, 150)
	replicator_value = 0
	for (let w = 1; w <= GAME.waves; w++) {
		for (let i = -150; i < 150; i++) {
			const pos = [150+i, 75-Math.sin(i/25+(totalTime*w))*50]
			if (i == -150) r_ctx.moveTo(...pos)
			else r_ctx.lineTo(...pos)
		}
		replicator_value += Math.sin(totalTime*w)*25*GAME.replicator
	}
	bar_ctx.strokeStyle = bar_ctx.fillStyle = overheated ? "#f00" : `rgb(${(replicator_momentum-1)/30*255}, ${255-(replicator_momentum-1)/30*255}, 0)`
	if (replicator_momentum > 1) replicator_momentum -= 3 * dt
	else {
		replicator_momentum = 1
		overheated = false
	}
	r_ctx.stroke()
	r_ctx.strokeRect(148, replicator_value/25/GAME.replicator/GAME.waves*-50 + 73, 4, 4)
	bar_ctx.clearRect(0, 0, 300, 10)
	bar_ctx.fillRect(0, 0, (replicator_momentum-1)*10, 10)
	if (overheated) replicator_value = -(replicator_momentum**2.5)
	replicator_value = replicator_value*((GAME.gain-GAME.loss)/100)
	$("replcost").innerText = Math.round(replicator_value*replicator_momentum).toTString(G.settings.numberFormat)
})
// buttons
$("replclick").onclick = $("replicator-canvas").onclick = ()=>{
	if (GAME.momentum && !overheated) replicator_momentum += 0.875+replicator_momentum/8
	sfx.click.play()
	let v = BigInt(~~(replicator_value*replicator_momentum))
	if (replicator_momentum > 35) {
		overheated = true
		replicator_momentum = 35
	}
	createParticle((v >= 0 ? "+" : "")+v.toTString(G.settings.numberFormat), mouseX, mouseY, (v >= 0 ? "#fff" : "#f77"))
	GAME.score += v
	if (v == 0 && getUpgrade("replicate2")) award("Pointless")
}