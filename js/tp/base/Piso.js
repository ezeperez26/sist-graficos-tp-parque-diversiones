function Piso() {
	//this.cuerpoRigido;
	//this.groundMaterial;

	var pisoSize = 2000;

	//var material = new ColoredMaterial(Color.FORESTGREEN);
	var material = new TexturedMaterial("images/grass_texture.png");
	material.setNormalMap("images/grass_normalmap.png");

	Sprite.call(this, pisoSize, pisoSize, material);

	this.translateZ(-10);

	/*
	// TODO creo que acá es en y = -10
	// Plano del Suelo, ubicado en z = -10
	this.groundMaterial = new CANNON.Material("groundMaterial");
	var groundShape = new CANNON.Plane();
	// masa 0 implica que el cuerpo tiene masa infinita
	this.cuerpoRigido = new CANNON.RigidBody(0, groundShape, this._groundMaterial);
	this.cuerpoRigido.useQuaternion = true;
	this.cuerpoRigido.position.z = ConstantesTanque.ALTURA_PISO;
	*/
}

Piso.prototype = Object.create(Sprite.prototype);
Piso.prototype.constructor = Piso;

/*
Piso.prototype.getCuerpoRigido = function () {
	return this.cuerpoRigido;
};

Piso.prototype.getMaterial = function () {
	return this.groundMaterial;
};
*/
