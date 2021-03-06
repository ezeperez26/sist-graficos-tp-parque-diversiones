/*
 * Pared perimetral para la cabina
 */
function ParedCabina(espesor, ancho, largo, alto, material) {
	PrimitiveModel.call(this);

	var path = [[0, 0, 0], [0, 0, ancho], [largo, 0, ancho], [largo, 0, 0], [0, 0, 0]];
	var forma = new Rectangle(espesor, alto);

	var recorrido = new Path(1);
	recorrido.addStretch(new LinearCurve(path));

	var geometry = new SweptSurface(recorrido, forma);
	geometry.setClosedShapes(true);
	geometry.setClosedEndings(true);

	this.init(geometry, material);
	this.translateX(-espesor * 4);
	this.translateZ(-espesor * 4);
}

ParedCabina.prototype = Object.create(PrimitiveModel.prototype);

ParedCabina.prototype.constructor = ParedCabina;
