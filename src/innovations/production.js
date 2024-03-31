// unlock upgrade
if (getUpgrade("generators")) $("automation").classList.remove("disabled")
createUpgrade("generators",
	"Production",
	"Unlocks generators for automatic production",
	20n,
	function() {
		$("automation").classList.remove("disabled")
		GAME.automation = true
	},
	_=> GAME.score >= 10n
)
// boost upgrades
createUpgrade("twohands",
	"Two Hands",
	"Doubles all autoclicker efficiency",
	250n,
	function() {
		GAME.multiplier *= 2
		GAME.doubleit++
	},
	_=> GAME.score >= 100n
)
createUpgrade("threehands",
	"Three Hands",
	"Tripples all autoclicker efficiency",
	1500n,
	function() {
		GAME.multiplier *= 3
		GAME.doubleit++
	},
	_=> getUpgrade("twohands")
)
createUpgrade("fourhands",
	"Four Hands",
	"Quadruples all autoclicker efficiency",
	15000n,
	function() {
		GAME.multiplier *= 4
		GAME.doubleit++
	},
	_=> getUpgrade("threehands")
)
createUpgrade("fivehands",
	"Five Hands",
	"Quintuples all autoclicker efficiency",
	150000n,
	function() {
		GAME.multiplier *= 5
		GAME.doubleit++
		if (GAME.doubleit != 4) award("Built on a throne of lies")
	},
	_=> GAME.farm && getUpgrade("fourhands")
)
// update
GAME.events.on("update", function(dt) {
	addToScore(GAME.autocount*dt*GAME.multiplier*1.5*((GAME.gain-GAME.loss)/100))
})

const autocosts = []

{
let c = 30n
for (let i = 0; i < GAME.autocount; i++) {
	autocosts.push(c)
	c = c*13n/10n
}
}

$("autobuy").onclick = function() {
	if (GAME.score < GAME.autocost) return
	sfx.button.play()
	GAME.autocount += 1
	GAME.score -= GAME.autocost
	autocosts.push(GAME.autocost)
	GAME.autocost = GAME.autocost*13n/10n
	$("autosell").disabled = false
}
$("autosell").onclick = function() {
	if (GAME.autocount <= 0) return
	GAME.autocost = autocosts.pop()
	sfx.button.play()
	GAME.autocount -= 1
	GAME.score += GAME.autocost
	if (GAME.autocount == 0) $("autosell").disabled = true
}

if (GAME.autocount == 0) $("autosell").disabled = true

makeCost($("autocost"), $("autobuy"), function() {
	$("autocount").innerText = GAME.autocount.toTString(G.settings.numberFormat)
	return GAME.autocost
})