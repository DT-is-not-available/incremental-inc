const MAJOR = 0
const MINOR = 3
const PATCH = 0

const limit = bits => 2n**BigInt(bits)-1n
const $ = arg => document.getElementById(arg)

/************************************************************************
* @Function    : getScaleName()
* @Purpose     : Get the full name of the Short Scale Numeral System
*                Using the Conway-Guy system for forming number prefixes
*                Handles power from 0 to 1000
*                The largest scale name is, therefore, the number with
*                3,000 zeros (Novenonagintanongentillion)
*
* @Version     : 1.00
* @Author      : Mohsen Alyafei
* @Date        : 11 Mar 2022
* @Param       : {number} the power numeral of the base 1000
*                e.g.  1 means 1000^1 = 1,000 (thousand)
*                e.g.  2 means 1000^2 = 1,000,000 (million)
*                e.g.  3 means 1000^3 = 1,000,000,000 (billion)
*                e.g.  4 means 1000^4 = 1,000,000,000,000 (trillion)
*                e.g. 11 means 1000^11 = decillion
*
* @Returns     : {string} The name of the large number
* @Reference   : https://en.wikipedia.org/wiki/Names_of_large_numbers
*************************************************************************/


//===================================================================
function getScaleName(power=0) {
if (power >= 13001) {
	const name = getScaleName(power%13001)
	return (name.length > 0 ? name+" " : "") + "Infinity" + (Math.floor(power/13001) > 1 ? `^${Math.floor(power/13001)}` : "")
}
if (power<11) return power<2?["","thousand"][power]:["m","b","tr","quadr","quint","sext","sept","oct","non"][power-2]+"illion";
power-=1;
let big = Math.floor(power/1000);
power = power%1000;
let bigList = ["", "bigi", "biggeri", "biggesti", "undefini", "rurnningoutofnami", "notagoogoli", "cookieclicki", "twentyfourthousandandthreezerosi", "thesenamescantgetmuchlongerwithoutsoundingstupidi", "debti", "seriousdebti", "youcanstopplayingi"]
let tensList = [
[              ,[,,,,,,,,,,0]],
["deci"        ,[,,,,,,,"n",,"n",0]],       // 10
["viginti"     ,[,,,"s",,,"s","m",,"m",0]], // 20
["triginta"    ,[,,,"s",,,"s","n",,"n",1]], // 30
["quadraginta" ,[,,,"s",,,"s","n",,"n",1]], // 40
["quinquaginta",[,,,"s",,,"s","n",,"n",1]], // 50
["sexaginta"   ,[,,,,,,,"n",,"n",1]],       // 60
["septuaginta" ,[,,,,,,,"n",,"n",1]],       // 70
["octoginta"   ,[,,,,,,"x","m",,"m",1]],    // 80
["nonaginta"   ,[,,,,,,,,,,1]]              // 90
],
hundredsList = [
[              ,[,,,,,,,,,]],
["centi"       ,[,,,,,,"x","n",,"n"]],    // 100
["ducenti"     ,[,,,,,,,"n",,"n"]],       // 200
["trecenti"    ,[,,,"s",,,"s","n",,"n"]], // 300
["quadringenti",[,,,"s",,,"s","n",,"n"]], // 400
["quingenti"   ,[,,,"s",,,"s","n",,"n"]], // 500
["sescenti"    ,[,,,,,,,"n",,"n"]],       // 600
["septingenti" ,[,,,,,,,"n",,"n"]],       // 700
["octingenti"  ,[,,,,,,"x","m",,"m"]],    // 800
["nongenti"    ,[,,,,,,,,,]]              // 900
],
hund     = ~~(power / 100),               // Hundred Digit
ten      = ~~(power % 100 / 10),          // ten Digit
unit     = power % 10 % 10,               // unit Digit
unitName = ["","un","duo","tre","quattuor","quin","se","septe","octo","nove"][unit], // Get unit Name from Array
tenName  = tensList[ten][0],              // Get Tens Name from Array
hundName = hundredsList[hund][0];         // Get Hundreds Name from Array
tenName??=""; hundName??="";              // make it an empty string if undefined

// convert ten names ending with "a" to "i" if it was proceeding the "llion" word
if (!hund && tensList[ten][1][10]) tenName = tenName.slice(0,-1)+"i";
// Pickup and add the correct suffix to the unit Name (s,x,n, or m)
if (ten) tenName           =  (tensList[ten][1][unit]     ??="")+tenName;
else if (hund && !ten) hundName =  (hundredsList[hund][1][unit]??="")+hundName;
return unitName + tenName + hundName + bigList[big] + "llion";  // Create name
}
//===================================================================

Array.prototype.remove = function(el) {
    return this.splice(this.indexOf(el), 1)
}

Number.prototype.toTString = BigInt.prototype.toTString = function(t) {
	switch (t) {
		case "named":
		return this.toNamedString()
		case "exponential":
			if (this >= 1000000 || this <= -1000000) return this.toExponential()
		default:
		return this.toLocaleString()
	}
}
BigInt.prototype.toNamedString = function(decimals=3) {
    if (this < 1000000n) return this.toLocaleString()
    const string = this.toString()
    const power = Math.floor((string.length-1)/3)
    const n = string.substring(0, string.length-power*3+decimals)
    return n.substring(0, n.length-decimals)+("."+n.substring(n.length-decimals)).replace(/\.?0*$/,"")+" "+getScaleName(power)
}
BigInt.abs = function(a) {
	if (a < 0n) return -a
	else return a
}
Number.prototype.toNamedString = function(decimals=3) {
	if (this == Infinity) return "Infinity"
	const ten = 10**decimals
    if (this < 1000) return ((~~(this*ten))/ten).toLocaleString()
    return BigInt(~~this).toNamedString(decimals)
}

class EventEmitter {
    constructor() {
        this.events = {}
        this.listenerId = 0
    }
    register(event) {
        if (this.events[event]) throw new TypeError(`Event ${event} already exists`)
        this.events[event] = {}
    }
    on(event, callback) {
        if (!this.events[event]) throw new TypeError(`Event ${event} does not exist`)
        if (typeof callback !== "function") throw new TypeError(`Callback must be a function`)
        const eventObj = this.events[event]
        this.listenerId ++
        eventObj[this.listenerId] = callback
        return this.listenerId
    }
    cancel(event, id) {
        if (!this.events[event]) throw new TypeError(`Event ${event} does not exist`)
        delete this.events[event][id]
    }
    emit(event, o) {
        if (!this.events[event]) throw new TypeError(`Event ${event} does not exist`)
        for (const [k, v] of Object.entries(this.events[event])) {
            v(o)
        }
    }
}

BigInt.prototype.toExponential = function() { return this.toLocaleString(undefined, {notation: "scientific", maximumFractionDigits: 3}).replace("E", "e+") }

function replacer(key, val) {
	if (val == Infinity) {
		return "#Infinity"
	} else if (val == undefined) {
		return "#undefined"
	} else if (val == NaN) {
		return "#NaN"
	} else if (typeof val === "bigint") {
		return "n"+val
	} else if (typeof val === "string") {
		return "'"+val
	} else return val
}

function reviver(key, val) {
	if (typeof val === "string") {
		if (val[0] == "n") {
			return BigInt(val.substr(1))
		} else if (val[0] == "'") {
			return val.substr(1)
		} else if (val[0] == "#") {
			if (val == "#Infinity") return Infinity
			if (val == "#NaN") return NaN
			return undefined
		} else throw new Error("Invalid String Type")
	} else return val
}

class SFX {
	constructor(...args) {
		this.audio = new Audio(...args)
	}
	play() {
		if (this.audio.paused)
			this.audio.play()
		else
			this.audio.currentTime = 0
	}
}

const sfx = {}

sfx.click = new SFX("sounds/increment.wav")
sfx.button = new SFX("sounds/buttonclick.wav")
sfx.plant1 = new SFX("sounds/plant1.mp3")
sfx.plant2 = new SFX("sounds/plant2.mp3")
sfx.plant3 = new SFX("sounds/plant3.mp3")
sfx.harvest = new SFX("sounds/harvest.wav")
sfx.omen = new SFX("sounds/omen.wav")

let mouseX = 0
let mouseY = 0

addEventListener("mousemove", e=>{
	mouseX = e.clientX
	mouseY = e.clientY
})

const DEFAULT_GAME = {
	score: 0n,
	score_fPart: 0,
	autocost: 30n,
	autocount: 0,
	automation: false,
	multiplier: 1,
	doubleit: 0,
	replicator: 0,
	waves: 1,
	tip: true,
	farm: false,
	plots: [
		{
			growtime: 0,
			numbers: []
		}
	],
	gain: 100,
	loss: 0,
	researchPoints: 0n,
	particlecount: 0,
	particlecost: 500_000n,
	particlesimulator: {
		particles: {},
		pid: 0n,
	},
	particles: false,
	limit: limit(32),
	maxplots: 6,
	maxplantlength: 5,
	farmcost: 15000n,
	maxstemval: 2,
	farmspeed: 1,
	momentum: false,
	upgrades: {},
	achievements: {},
	achievementsVisible: {},
	researchProjects: {}
}

const DEFAULTSETTINGS = {
	bigNumberFormat: "named",
	bigNumberOverride: false,
	numberFormat: "named",
	music: true,
	sound: true
}

function getUpgrade(id, bought=true) {
	return bought ? GAME.upgrades[id] == 2 : GAME.upgrades[id] > 0
}
let HACKING = false
let G = JSON.parse(localStorage["Incremental Inc."] || `{}`, reviver)
if (!G.game) {
	// reformatting
	G = {
		game: G,
		settings: DEFAULTSETTINGS,
	}
}
const GAME = Object.assign(Object.assign({}, DEFAULT_GAME), G.game)
G.game = GAME
G.settings = Object.assign(Object.assign({}, DEFAULTSETTINGS), G.settings)
const achievements = [
	{
		name: "Pointless",
		description: "Click the replicate button right when the value hits 0 after buying Dangerous Overclocking",
		hidden: true,
	},
	{
		name: "Financially Unrecoverable",
		description: "Go into debt",
		hidden: true,
	},
	{
		name: "Built on a throne of lies",
		description: "Get further than you should be by abusing the v0.2.13 innovation rework",
		secret: true,
	},
]
const achievementObject = {}
for (let i = 0; i < achievements.length; i++) {
	achievementObject[achievements[i].name] = achievements[i]
}
Object.defineProperty(GAME, "events", {
	enumerable: false,
	writable: false,
	value: new EventEmitter()
})

GAME.events.register("update")
GAME.events.register("error")

$("mymistakes").innerText += "STARTGAME:"+btoa(JSON.stringify(G, replacer))+"\n"

function IFUCKEDUP(e) {
	preloader.wait()
	GAME.events.emit("error")
    document.getElementById("thebigbad").classList.add("goddammit")
    document.getElementById("mymistakes").innerText+=`CURRENTGAME:${btoa(JSON.stringify(G, replacer))}
${e.error.message}
${e.error.stack}\n`
	return true
}

$("copyit").onclick = function() {
	navigator.clipboard.writeText(document.getElementById("mymistakes").innerText)
}

window.addEventListener("error", IFUCKEDUP)