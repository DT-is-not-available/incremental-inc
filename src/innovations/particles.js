if (getUpgrade("particles")) $("particles").classList.remove("disabled")
createUpgrade("particles",
	"Particle Simulator",
	"Unlocks the particle simulator",
	15_000_000n,
	function() {
		$("particles").classList.remove("disabled")
		GAME.particles = true
	},
	_=> GAME.researchProjects["Particle Physics"] >= 1
)

const simulator = GAME.particlesimulator

$("partlaunch").onclick = function() {
	function spawnP(x, y, vx, vy) {
		simulator.particles[simulator.pid++] = {
			x: x,
			y: y,
			angle: Math.random()*360,
			speed: 3,
			color: "#fff"
		}
	}
	spawnP(150, 75, 1, 1)
}

const p_ctx = $("particles-canvas").getContext("2d")

const particleparticles = {}
var ppid = 0

GAME.events.on("update", function(dt) {
	if (!GAME.particles) return
	p_ctx.clearRect(0, 0, 300, 150)
	for (const [id, particle] of Object.entries(simulator.particles)) {
		// particle logic
		var {x, y} = getPoint(particle.angle)
		particle.x += x*particle.speed*dt*50
		particle.y += y*particle.speed*dt*50
		if (particle.x < 0) x = Math.abs(x)
		if (particle.y < 0) y = Math.abs(y)
		if (particle.x >= 300) x = -Math.abs(x)
		if (particle.y >= 150) y = -Math.abs(y)
		particle.angle = Math.atan2(y, x) * 180 / Math.PI
		for (const [id2, particle2] of Object.entries(simulator.particles)) {
			// does it not exist? (has it been deleted)
			if (!simulator.particles[id2]) continue
			// collision
			if (particle != particle2 && Math.sqrt((particle.x - particle2.x)**2+(particle.y - particle2.y)**2) < particle.speed+particle2.speed) {
				const px = (particle.x + particle2.x) / 2
				const py = (particle.y + particle2.y) / 2
				delete simulator.particles[id]
				delete simulator.particles[id2]
				particleparticles[ppid++] = {
					x: px,
					y: py,
					v: 0
				}
			}
		}
		// draw
		p_ctx.fillStyle = particle.color
		p_ctx.fillRect(particle.x-1, particle.y-1, 2, 2)
	}
	p_ctx.fillStyle = "#fff"
	for (const [id, p] of Object.entries(particleparticles)) {
		if (p.v >= 10) {
			delete particleparticles[id]
			continue
		}
		p.v += 1
		const isodd = p.v%3
		for (let i = 0; i < p.v; i+=3) {
			p_ctx.fillRect(p.x-1-isodd-i, p.y-1-isodd-i, 1, 1)
			p_ctx.fillRect(p.x-1-isodd-i, p.y+isodd+i, 1, 1)
			p_ctx.fillRect(p.x+isodd+i, p.y-1-isodd-i, 1, 1)
			p_ctx.fillRect(p.x+isodd+i, p.y+isodd+i, 1, 1)
		}
	}
})