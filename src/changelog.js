const version = `v${MAJOR}.${MINOR}.${PATCH}`
const versionNumber = document.getElementById("ver")
versionNumber.innerText = version
function parseChangeLog(txt) {
	const string = txt.trimStart().trimEnd()
	const lines = string.split("\n")
	function p(text) {
		const els = []
		text.replace(/<(\S+?)>|(.[^<]*)/gm, function(m, link, text) {
			if (link) {
				const elem = el("a", link)
				elem.href = link
				els.push(elem)
			} else els.push(text)
		})
		return els
	}
	return el("div.scroll", ...lines.map(line => {
		if (line.trimStart().trimEnd() == "---") {
			return el("hr")
		} else if (line.match(/^\s*-/)) {
			return el("li.ws", ...p(line.replace(/^\s*-\s*/,"")))
		} else if (line.match(/^\s*##/)) {
			return el("h4.ws", ...p(line.replace(/^\s*##\s*/,"")))
		} else if (line.match(/^\s*#/)) {
			return el("h3.ws", ...p(line.replace(/^\s*#\s*/,"")))
		} else return el("p.ws", ...p(line))
	}))
}
if (localStorage["Incremental Inc."]) if (!GAME.version || GAME.version != version) {
	preloader.wait()
	fetch("changelogs/"+version).then(e=>e.text()).then((text)=>{
		showMessage(version+" Changelog", parseChangeLog(text))
		preloader.loadNext()
	})
}
GAME.version = version