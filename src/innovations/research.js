if (getUpgrade("research")) $("research").classList.remove("disabled")
createUpgrade("research",
	"Research Center",
	"Unlocks the gain/loss research center",
	5_000_000n,
	function() {
		$("research").classList.remove("disabled")
		GAME.research = true
	},
	_=> GAME.score >= 7_500_000n
)

const gain = $("gain")
const loss = $("loss")
$("plusgain").onclick = ()=>{
	if (GAME.researchPoints > 0) {
		GAME.researchPoints--
		GAME.gain++
	sfx.button.play()
	}
}
$("plusloss").onclick = ()=>{
	if (GAME.researchPoints > 0) {
		GAME.researchPoints--
		GAME.loss++
		sfx.button.play()
	}
}
const researchpoints = $("researchpoints")
const minesweeper = $("minesweeper")
const ms_buttons = {}
const ms_board = {}

function ms_reset() {
	for (const [k, v] of Object.entries(ms_buttons)) {
		ms_buttons[k].className = ""
	}
	for (const [k, v] of Object.entries(ms_board)) {
		delete ms_board[k]
	}
}

function ms_generate(x, y) {
	const nonos = {}
	for (let xp = x-1; xp < x+2; xp++) {
		for (let yp = y-1; yp < y+2; yp++) {
			nonos[[xp, yp]] = true
		}
	}
	const maxBombs = 7+Math.floor(Math.random()*11)
	for (let i = 0; i < maxBombs; i++) {
		const xpos = Math.floor(Math.random()*10)
		const ypos = Math.floor(Math.random()*10)
		if (ms_board[[xpos, ypos]] || nonos[[xpos, ypos]]) {
			i--
			continue
		} else {
			ms_board[[xpos, ypos]] = true
		}
	}
	ms_board.generated = true
	ms_board.left = 100-maxBombs
	ms_board.bombs = maxBombs
}

GAME.events.on("update", function() {
	gain.innerText = GAME.gain.toTString(G.settings.numberFormat)
	loss.innerText = GAME.loss.toTString(G.settings.numberFormat)
	researchpoints.innerText = GAME.researchPoints.toTString(G.settings.numberFormat)
	$("plusgain").disabled = GAME.researchPoints <= 0
	$("plusloss").disabled = GAME.researchPoints <= 0
})

const researchprojects = $("researchprojects")

function createProject(name, costs) {
	if (!GAME.researchProjects[name]) GAME.researchProjects[name] = 0
	const progress = el("progress")
	const researchBtn = el("button", "Research")
	const cost = el("span", "...")
	function getCost() {
		return costs[GAME.researchProjects[name]]
	}
	progress.value = GAME.researchProjects[name]/costs.length
	researchprojects.append(el("div.box.research", el("div", el("div", name+" - ", cost), progress), researchBtn))
	if (GAME.researchProjects[name] >= costs.length) {
		researchBtn.remove()
		cost.innerText = "Researched"
		cost.className = "green"
	} else {
		const helper = makeCost(cost, researchBtn, getCost, "researchPoints", "kp")
		researchBtn.onclick = function() {
			GAME.researchPoints -= getCost()
			GAME.researchProjects[name]++
			sfx.button.play()
			progress.value = GAME.researchProjects[name]/costs.length
			if (GAME.researchProjects[name] >= costs.length) {
				costHelpers.remove(helper)
				researchBtn.remove()
				cost.innerText = "Researched"
				cost.className = "green"
			}
		}
	}
}

if (GAME.HACKING) createProject("Particle Physics", [25n, 65n, 130n, 1750n])

function pressMS(btn, x, y) {
	if (ms_board.dead) {
		ms_reset()
		return
	}
	if (btn.classList.contains("pressed")) return
	sfx.click.play()
	if (!ms_board.generated) ms_generate(x, y)
	btn.classList.add("pressed")
	btn.classList.remove("flagged")
	if (ms_board[[x, y]]) {
		ms_board.dead = true
		btn.classList.add("bomb")
		createParticle("Fail", mouseX, mouseY, "#f77")
		return
	}
	let bombs = 0
	for (let xp = x-1; xp < x+2; xp++) {
		for (let yp = y-1; yp < y+2; yp++) {
			if (ms_board[[xp, yp]]) bombs++
		}
	}
	btn.classList.add("_"+bombs)
	if (bombs == 0) {
		for (let xp = x-1; xp < x+2; xp++) {
			for (let yp = y-1; yp < y+2; yp++) {
				if (x == xp && y == yp) continue
				if (ms_buttons[[xp, yp]]) pressMS(ms_buttons[[xp, yp]], xp, yp)
			}
		}
	}
	ms_board.left--
	if (ms_board.left == 0) {
		createParticle("+"+ms_board.bombs.toTString(G.settings.numberFormat)+" kp", mouseX, mouseY)
		GAME.researchPoints += BigInt(ms_board.bombs)
		ms_reset()
	}
}

function rpressMS(btn, x, y) {
	if (btn.classList.contains("pressed")) return
	sfx.button.play()
	if (btn.classList.contains("flagged"))
		btn.classList.remove("flagged")
	else
		btn.classList.add("flagged")
}

for (let y = 0; y < 10; y++) {
	const div = el("div")
	for (let x = 0; x < 10; x++) {
		const btn = el("button")
		div.append(btn)
		btn.onclick = ()=>pressMS(btn, x, y)
		btn.oncontextmenu = (e)=>{
			e.preventDefault()
			rpressMS(btn, x, y)
		}
		ms_buttons[[x,y]] = btn
	}
	minesweeper.append(div)
}