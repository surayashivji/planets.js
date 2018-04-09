//////////////////////////////////////////////////////////////////////////////////
// Texture Planets: planets that use existing textures (not procedural).
//////////////////////////////////////////////////////////////////////////////////

/*
TexturePlanet

@param Number - radius: radius of the SphereGeometry
@param Number - width: width of the SphereGeometry
@param Number - height: height of the SphereGeometry
@param Number - bumpScale: (optional) how much the bump map affects material (0-1 range)
*/
function TexturePlanet(radius, width, height, bumpScale = 0.05) {
  this.geometrySize = {
    radius,
    width,
    height
  };
  this.scale = bumpScale;
};

/*
Creates a textured planet based on a local image path.

@param String - localPath: local path to the texture (relative to where the library is placed)
@param String - bumpMapPath: (optional) local path to the path that creates a bump map (See https://threejs.org/docs/#api/materials/MeshPhongMaterial.bumpMap)
@return THREE.Mesh - polygon mesh planet (See https://threejs.org/docs/#api/objects/Mesh).
*/
TexturePlanet.prototype.createPlanetFromPath = function(localPath, bumpMapPath = localPath) {
  var geometry	= new THREE.SphereGeometry(this.geometrySize.radius, this.geometrySize.width, this.geometrySize.height);
  var textureMap = new THREE.TextureLoader().load(localPath);
  var textureBumpMap = new THREE.TextureLoader().load(bumpMapPath);
  var material	= new THREE.MeshPhongMaterial({
		map	: textureMap,
		bumpMap	: textureBumpMap,
		bumpScale: this.scale,
	});
	var mesh = new THREE.Mesh(geometry, material);
	return mesh;
};

/*
Creates a textured planet based on a url.

@param String - urlPath: url to the texture image (png or jpeg) that will be on the planet.
@param String - bumpMapPath: (optional) url path to the path that creates a bump map (See https://threejs.org/docs/#api/materials/MeshPhongMaterial.bumpMap)
@return THREE.Mesh - polygon mesh planet (See https://threejs.org/docs/#api/objects/Mesh).
*/
TexturePlanet.prototype.createPlanetFromUrl = function(urlPath, bumpMapUrlPath = urlPath) {
  var geometry	= new THREE.SphereGeometry(this.geometrySize.radius, this.geometrySize.width, this.geometrySize.height);
  var textureLoader = new THREE.TextureLoader();
  textureLoader.crossOrigin = "Anonymous";
  var textureMap = textureLoader.load(urlPath);
  var textureBumpMap = textureLoader.load(bumpMapUrlPath);
  var material	= new THREE.MeshPhongMaterial({
		map	: textureMap,
		bumpMap	: textureBumpMap,
		bumpScale: this.scale,
	});
  material.needsUpdate = true;
  var mesh	= new THREE.Mesh(geometry, material);
  return mesh;
};

//////////////////////////////////////////////////////////////////////////////////
// Procedural Planets: Planets that can be updated and changed in real time.
//////////////////////////////////////////////////////////////////////////////////

/*
Procedural Planets
*/
function ProceduralPlanet() {
};
