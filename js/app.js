var lastTime = 0; // Tiempo de la última vez que se ejecutó la animación
var elapTime = 0;
var minTime = 30;
var frameTime = 0;
var frameCount = 0;
var fps;

var renderer, escena;

var piso, fondo, vueltaAlMundo, sillasVoladoras, montaniaRusa;

var camara, camaraOrbital, camaraPrimeraPersona, camaraSeguimiento;

var ambientColor, directionalColor, directionalPosition;
var spotlightColor, spotlightPosition, spotlightDirection;

function start() { // jshint ignore:line
	init();
	loop();
}

function init() {
	var up = vec3.fromValues(0, 0, -1);

	var w = window.innerWidth - 1;
	var h = window.innerHeight - 4;

	renderer = new Renderer(w, h);

	// ubico el canvas del renderer en el body
	var canvasContainer = document.getElementById("canvas-container");
	canvasContainer.appendChild(renderer.getCanvasElement());

	// CREAR OBJETOS

	piso = new Piso();

	fondo = new Fondo();
	fondo.translateZ(-150);

	var material = new TexturedMaterial("images/metal.jpg");
	// material.setShininess(1.0);
	material.scale(3,1);
	material.translate(0,-0.4);
	var images = ["images/beach/front.jpg", "images/beach/back.jpg",
	              "images/green-grass-texture.jpg", "images/beach/top.jpg",
	              "images/beach/left.jpg", "images/beach/right.jpg"];
	material.setCubeMap(images, 1.0);

	vueltaAlMundo = new VueltaAlMundo(material);
	vueltaAlMundo.translateX(100);

	sillasVoladoras = new SillasVoladoras();
	sillasVoladoras.translateY(-100);
	sillasVoladoras.translateZ(-10);
	sillasVoladoras.rotateX(Utils.degToRad(90));

	montaniaRusa = new MontaniaRusa();
	montaniaRusa.translateX(-150);
	montaniaRusa.translateY(200);
	//montaniaRusa.translateZ(50);

	escena = new Scene();

	// habilita la iluminacion
	ambientColor = 0.8;
	directionalColor = 0.4;
	spotlightColor = 0.0;

	directionalPosition = [-600, 200, 400];
	spotlightPosition = [10.0, 0.0, 0.0];
	spotlightDirection = [1.0, 0.0, -0.7]; // TODO deberia ser -1,0,0

	escena.setAuto(montaniaRusa.getCarro());
	escena.setLightSources(ambientColor, directionalColor, directionalPosition, spotlightColor, spotlightPosition, spotlightDirection);

	// AGREGAR OBJETOS A LA ESCENA

	escena.add(piso);
	escena.add(fondo);
	escena.add(vueltaAlMundo);
	escena.add(sillasVoladoras);
	escena.add(montaniaRusa);

	var eyeOrbital = vec3.fromValues(0, 100, 20);
	var targetOrbital = vec3.fromValues(0, 0, -10);
	camaraOrbital = new CamaraOrbital(w, h, eyeOrbital, targetOrbital, up);
	camara = camaraOrbital;

	var eyePP = vec3.fromValues(0, 0, 6);
	var targetPP = vec3.fromValues(3, 0, 6);
	camaraPrimeraPersona = new CamaraPrimeraPersona(w, h, eyePP, targetPP, up);

	var eyeSeguimiento = vec3.fromValues(0, 0, 10);
	var targetSeguimiento = vec3.fromValues(20, 0, 0);
	camaraSeguimiento = new CamaraSeguimiento(montaniaRusa.getCarro(), w, h, eyeSeguimiento, targetSeguimiento, up);
}

function listenToKeyboard() {
	// TODO: dado que Keyboard es estático sería bueno poner el
	// comportamiento de a cada objeto en los metodos update()
	// correspondientes y no en esta funcion

	// camaras
	if (Keyboard.isKeyPressed(Keyboard.C, true)) {
		if (camara === camaraOrbital) {
			camara = camaraPrimeraPersona;
		} else if (camara === camaraPrimeraPersona) {
			camara = camaraSeguimiento;
		} else {
			camara = camaraOrbital;
		}
	}

	var camaraVel = 1;
	if (Keyboard.isKeyPressed(Keyboard.W)) {
		camaraPrimeraPersona.trasladarAdelante(camaraVel);
	} else if (Keyboard.isKeyPressed(Keyboard.S)) {
		camaraPrimeraPersona.trasladarAtras(camaraVel);
	}
	if (Keyboard.isKeyPressed(Keyboard.D)) {
		camaraPrimeraPersona.trasladarDerecha(camaraVel);
	} else if (Keyboard.isKeyPressed(Keyboard.A)) {
		camaraPrimeraPersona.trasladarIzquierda(camaraVel);
	}
}

function listenToMouse() {
	if (Mouse.isButtonPressed(Mouse.LEFT)) {
		var speed = 10;

		var deltaX = Mouse.getDeltaX();
		var deltaY = Mouse.getDeltaY();

		if (camara === camaraPrimeraPersona) {
			camara.rotate(deltaX * speed, 0);
		} else {
			camara.rotate(deltaX * speed, deltaY * speed);
		}
	}

	if (camara == camaraOrbital && Mouse.isWheelMoving()) {
		if (Mouse.getWheelDelta() < 0) {
			camara.zoomOut();
		} else {
			camara.zoomIn();
		}
	}
}

/*
 * Función que calcula el tiempo delta.
 * El tiempo delta consiste en determinar el número de milisegundos
 * transcurridos desde la última ejecución de la función animate, y mover
 * los objetos en consecuencia según la velocidad por segundo que nosotros
 * le hayamos dicho que tienen.
 * Con el método de tiempo delta, nos aseguramos a que el objeto siempre
 * mantenga una velocidad de animación constante, y que se vea igual en toda
 * clase de ordenadores lentos o rápidos (siempre que tengan un mínimo
 * de potencia para mover webgl con cierta fluidez, claro).
 */
function elapsedTime() {
	var timeNow = new Date().getTime();
	var elapsed = 0;
	if (lastTime !== 0) {
		elapsed = timeNow - lastTime;
	}
	lastTime = timeNow;
	return elapsed;
}

/*
 * Función que ejecuta la animación.
 * Hace uso de la función requestAnimationFrame que notifica al navegador
 * que debe volver a pintar la escena webGL.
 * Se podría conseguir un efecto similar al uso de requestAnimFrame,
 * pidiéndole que sea javascript el que llame a la función drawScene
 * con regularidad.
 * Dado que el setInterval de javascript se ejecuta esté la pestaña abierta
 * o no, ésto supone un increíble desperdicio de rendimiento, que podría
 * acabar perjudicando a la velocidad de ejecución de los javascripts.
 * Sin embargo, requestAnimFrame sólo se llama cuando el canvas donde
 * se dibuja la escene está visible.
 */
function loop() {
	requestAnimationFrame(loop);

	var time = elapsedTime();

	elapTime += time;
	frameTime += time;

	if (frameTime < minTime) {
		return;
	} else {
		time = frameTime;
		frameTime = 0;
	}

	frameCount++;

	if(elapTime >= 1000) {
		fps = frameCount;
		frameCount = 0;
		elapTime -= 1000;

		document.getElementById('test').innerHTML = fps;
	}

	renderer.clear();

	listenToKeyboard();
	listenToMouse();

	escena.update(time); // actualiza todos los modelos
	if (camara === camaraSeguimiento) {
		camaraSeguimiento.update();
	}
	renderer.render(escena, camara.getPerspectiveCamera());
}
