const bignumber = $("bignumber")

const saver = setInterval(()=>{
	localStorage["Incremental Inc."] = JSON.stringify(G, replacer)
}, 1000)

let paused = false

$("pause").onclick = function() {
	sfx.button.play()
	paused = true
	const unpauseBtn = showMessage("Paused", "The game is paused. I don't know what you expected.")
	unpauseBtn.innerText = "Unpause"
	unpauseBtn.addEventListener("click", ()=>paused=false)
}

let lastTime = Date.now()

let perSecondDisplay = 0
let lastScore = GAME.score
const perSecondEl = $("persecond")

function showEnd() {
	$("end").className = "fadein"
}

const secondloop = setInterval(()=>{
	perSecondDisplay = GAME.score - lastScore
	lastScore = GAME.score
	perSecondEl.innerText = perSecondDisplay.toTString("named")
}, 1000)

const tickloop = setInterval(()=>{
	const dt = (Date.now() - lastTime)/1000
	lastTime = Date.now()
	if (GAME.score >= 0n) {
		bignumber.firstChild.innerText = G.settings.bigNumberOverride ? GAME.score.toTString(G.settings.bigNumberFormat) : GAME.score.toTString(G.settings.numberFormat)
	} else {
		bignumber.firstChild.innerHTML = `<div>0</div><div class="red smaller">-${(-GAME.score).toTString(G.settings.numberFormat)} in debt</div>`
	}
	if (paused || !document.hasFocus()) return
	if (GAME.score < 0n) award("Financially Unrecoverable")
	GAME.events.emit("update", dt)
	if (GAME.score > GAME.limit) {
		GAME.score = GAME.limit
		bignumber.classList.add("shake")
	} else {
		bignumber.classList.remove("shake")
	}
}, 20)

GAME.events.on("error", function() {
	clearInterval(tickloop)
	clearInterval(secondloop)
	clearInterval(saver)
})

bignumber.onclick = ()=>{
	sfx.click.play()
	GAME.score += 1n
	if (GAME.tip) {
		$("tip").remove()
		GAME.tip = false
	}
	createParticle("+1", mouseX, mouseY)
}

createUpgrade("64bit",
	"Reach higher",
	"Escape the bounds of 32 bit computing",
	limit(32),
	function() {
		GAME.limit = limit(64)
	},
	_=> GAME.score >= limit(32)
)

createUpgrade("128bit",
	"And higher",
	"Escape the bounds of 64 bit computing",
	limit(64),
	function() {
		GAME.limit = limit(128)
	},
	_=> GAME.score >= limit(64)
)

createUpgrade("256bit",
	"And even higher",
	"Escape the bounds of 128 bit computing",
	limit(128),
	function() {
		GAME.limit = limit(256)
	},
	_=> GAME.score >= limit(128)
)

createUpgrade("512bit",
	"Finality",
	"Escape the bounds of limiting computing",
	limit(256),
	function() {
		GAME.limit = Infinity
	},
	_=> GAME.score >= limit(256)
)

addEventListener("keydown", function(e) {
	if (e.code == "Space") {
		e.preventDefault()
		bignumber.className = "press"
	}
})
addEventListener("keyup", function(e) {
	if (e.code == "Space") {
		bignumber.className = ""
		GAME.score += 1n
		if (GAME.tip) {
			$("tip").remove()
			GAME.tip = false
		}
		sfx.click.play()
		createParticle("+1", mouseX, mouseY)
	}
})

$("reset").onclick = ()=>{
	sfx.button.play()
	showMessage("Are you sure?", el("div.scroll", ...[
		el("p", "Are you sure you want to reset the game? This action cannot be undone!"),
		button("Yes, reset everything!", ()=>{
			Object.assign(GAME, DEFAULT_GAME)
			GAME.version = `v${MAJOR}.${MINOR}.${PATCH}`
			localStorage["Incremental Inc."] = JSON.stringify(G, replacer)
			clearInterval(saver)
			location.reload()
		}, ["center"]),
	])).innerText = "NO! GO BACK!"
}

$("achievements").onclick = ()=>{
	sfx.button.play()
	let achieved = 0
	let secret = 0
	const achEls = achievements.map(achievement=>{
		if (GAME.achievements[achievement.name]) {
			achieved ++
			return el("div.box."+(achievement.secret?"redachievement":"gold"), el("big.strong", achievement.name), el("br"), el("div", achievement.description))
		} else {
			if (!achievement.secret) return el("div.box", el("big.strong", "???"), el("br"), el("div", achievement.hidden && !GAME.achievementsVisible[achievement.name] ? "???" : achievement.description))
			else return (secret++,el("span.none"))
		}
	})
	showMessage("Achievements", el("div.scroll", el("h2.center",`${achieved}/${achievements.length-secret} Achievements`), el("br"), ...achEls))
}

if (!GAME.tip)
	$("tip").remove()