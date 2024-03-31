function createParticle(text, x, y, color="white") {
	const el = document.createElement("div")
	document.body.append(el)
	el.className = "particle"
	el.innerText = text
	el.style.color = color
	el.style.left = (x - el.clientWidth/2)+"px"
	el.style.top = (y - el.clientHeight/2)+"px"
	setTimeout(()=>el.remove(), 750)
}

function instantCreateUpgrade(ID, name, desc, cost, func) {
	const costEl = el("div.strong", "Cost - "+cost.toTString(G.settings.numberFormat))
	const buyBtn = el("button", "Buy")
	const container = el("div.upgrade", el("div.description", el("div.strong", name), el("div", desc), costEl), buyBtn)
	$("upgrades").append(container)
	const updateFn = GAME.events.on("update", ()=>{
		container.style.opacity = 1
		if (GAME.score < cost) {
			costEl.style.color = "#f77"
			buyBtn.disabled = true
		} else {
			costEl.style.color = "#fff"
			buyBtn.disabled = false
		}
	})
	buyBtn.addEventListener("click", function() {
		sfx.button.play()
		if (GAME.score >= cost) {
			GAME.score -= cost
			func()
			GAME.upgrades[ID] = 2
			container.remove()
			GAME.events.cancel("update", updateFn)
		}
	})
}

function randb() {
	return Math.round(Math.random()) && true
}

function getPoint(angle, distance=1, x=0, y=0) {
    var result = {};

    result.x = (Math.cos(angle * Math.PI / 180) * distance + x);
    result.y = (Math.sin(angle * Math.PI / 180) * distance + y);

    return result;
}

function createUpgrade(ID, title, desc, cost, func, req=null) {
	if (GAME.upgrades[ID] == 2) return ID
	else if (!GAME.upgrades[ID]) GAME.upgrades[ID] = 0
	if (!req || GAME.upgrades[ID] == 1) {
		instantCreateUpgrade(ID, title, desc, cost, func)
	} else {
		let id
		const updateFn = ()=>{
			if (req()) {
				GAME.events.cancel("update", id)
				GAME.upgrades[ID] = 1
				instantCreateUpgrade(ID, title, desc, cost, func)
			}
		}
		id = GAME.events.on("update", updateFn)
	}
	return ID
}

function addToScore(smallint, bigint=0n) {
	GAME.score += bigint
	GAME.score_fPart += smallint
	GAME.score += BigInt(Math.floor(GAME.score_fPart))
	GAME.score_fPart -= Math.floor(GAME.score_fPart)
}

// cost helpers
const costHelpers = []
function makeCost(element, button, func, costtype="score", suffix=null) {
	const arr = [element, button, func, costtype, suffix]
	return costHelpers.push(arr)
}
GAME.events.on("update", function() {
	for (let i = 0; i < costHelpers.length; i++) {
		const costHelper = costHelpers[i]
		if (!costHelper) continue
		const cost = costHelper[2]()
		if (GAME[costHelper[3]] < cost) {
			costHelper[0].style.color = "#f77"
			costHelper[1].disabled = true
		} else {
			costHelper[0].style.color = "#fff"
			costHelper[1].disabled = false
		}
		let costText = cost.toTString(G.settings.numberFormat)
		if (costHelper[4]) costText += " " + costHelper[4]
		costHelper[0].innerText = costText
	}
})

function el(tag, ...children) {
	const classes = tag.split(".")
	const name = classes.shift()
	const elem = document.createElement(name)
	elem.className = classes.join(" ")
	if (children.length) elem.append(...children)
	return elem
}

function button(text, callback, classes=[]) {
	const btn = document.createElement("button")
	btn.append(text)
	btn.onclick = ()=>{
		sfx.button.play()
		callback(btn)
	}
	btn.className = classes.join(" ")
	return btn
}

function showMessage(title, content) {
	let btn
	const container = el("div.dialogue", el("fieldset.column", el("legend", el("h2", title)), content, btn = button("Close", ()=>container.remove())))
	document.body.append(container)
	return btn
}

const notifContainer = document.getElementById("notifs")
function notify(title, content) {
	const container = el("div.column.gold", el("div", el("big.strong.center", title)), el("div.center", content))
	notifContainer.append(container)
	setTimeout(_=>container.remove(), 5250)
}

function award(name) {
	if (GAME.achievements[name]) return
	const achievement = achievementObject[name]
	if (!achievement) return console.error(new Error("that achievement dont exist you big dummy"))
	GAME.achievements[name] = true
	notify("Achievement unlocked: "+name, achievement.description)
}

function unhide(name) {
	if (GAME.achievementsVisible[name]) return
	const achievement = achievementObject[name]
	if (!achievement) return console.error(new Error("that achievement dont exist you big dummy"))
	if (!achievement.hidden) return console.error(new Error("that achievement isnt hidden you big dummy"))
	GAME.achievementsVisible[name] = true
}