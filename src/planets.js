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
// Star Planets: "Planets" that resemble stars
//////////////////////////////////////////////////////////////////////////////////

/*
Star Planets
*/
function StarColor(coronaColor, coreColor, innerBorderColor, outerBorderColor) {
  this.corona = coronaColor;
  this.core = coreColor;
  this.innerBorder = innerBorderColor;
  this.outerBorder = outerBorderColor;
}

function StarPlanet(radius, starPlanetColor, particleDisplacement, timeMultiplier) {
  this.radius = radius;
  this.colors = starPlanetColor;
  this.shaders = {};
  this.starMaterialUniforms = {
    sphere_radius:
    {
      type  : 'f',
      value : this.radius
    },
    sphere_position:
    {
        type  : 'v3',
        value : new THREE.Vector3(0,0,0)
    },
    time:
    {
        type  : 'f',
        value : 0
    },
    time_multiplier:
    {
        type  : 'f',
        value : 0.0005
    },
    color_step_1:
    {
        type  : 'c',
        value : new THREE.Color(this.colors.corona)
    },
    color_step_2:
    {
        type  : 'c',
        value : new THREE.Color(this.colors.core)
    },
    color_step_3:
    {
        type  : 'c',
        value : new THREE.Color(this.colors.innerBorder)
    },
    color_step_4:
    {
        type  : 'c',
        value : new THREE.Color(starPlanetColor.outerBorder)
    },
    ratio_step_1:
    {
        type  : 'f',
        value : 0.4
    },
    ratio_step_2:
    {
        type  : 'f',
        value : 0.9
    },
    displacement:
    {
        type  : 'f',
        value : 0.03
    }
  };

  this.starObject = new THREE.Object3D();
  THREE.Cache.enabled = true;
}

StarPlanet.prototype.createSphereObject = function(shader) {

var sphereVertexShader   = document.getElementById( 'shader-vertex-star-sphere' ).textContent;
var sphereFragmentShader = document.getElementById( 'shader-fragment-star-sphere' ).textContent;
  // var sphereVertexShader = shader.sphere_vertex_shader;
  // var sphereFragmentShader = shader.sphere_fragment_shader;
  var sphereGeometry = new THREE.SphereGeometry(this.radius, 100, 100);
  var sphereMaterial = new THREE.ShaderMaterial({
      wireframe      : false,
      vertexShader   : sphereVertexShader,
      fragmentShader : sphereFragmentShader,
      uniforms       : this.starMaterialUniforms,
      transparent    : true
  });
  var sphereGeometry = new THREE.Mesh(sphereGeometry, sphereMaterial);
  return sphereGeometry;
}

StarPlanet.prototype.createHalo = function(shader) {
  var haloVertexShader   = document.getElementById( 'shader-vertex-star-halo' ).textContent;
  var haloFragmentShader = document.getElementById( 'shader-fragment-star-halo' ).textContent;
  // var haloVertexShader = shader.halo_vertex_shader;
  // var haloFragmentShader = shader.halo_fragment_shader;
  var haloGeometry = new THREE.PlaneBufferGeometry( 4, 4, 40, 40 );
  var haloMaterial = new THREE.ShaderMaterial({
      vertexShader   : haloVertexShader,
      fragmentShader : haloFragmentShader,
      uniforms       : this.starMaterialUniforms,
      transparent    : true
    });
    var haloGeometry = new THREE.Mesh(haloGeometry, haloMaterial);
    return haloGeometry;
}

StarPlanet.prototype.createStar = function(shader) {
  var sphere = this.createSphereObject(shader);
  var halo = this.createHalo(shader);
  this.starObject.add(sphere);
  this.starObject.add(halo);
}

StarPlanet.prototype.init = function(callback) {
  var initialShaders = {
    sphere_fragment_shader: 'libs/shaders/shader-fragment-star-sphere.glsl',
    sphere_vertex_shader: 'libs/shaders/shader-vertex-star-sphere.glsl',
    halo_vertex_shader: 'libs/shaders/shader-vertex-star-halo.glsl',
    halo_fragment_shader: 'libs/shaders/shader-fragment-star-halo.glsl'
  };
  var numberOfShaders = Object.keys(initialShaders).length;
  var manager = new THREE.LoadingManager();
  var loader = new THREE.FileLoader(manager);
  // var loader = new THREE.XHRLoader();
  var self = this;
  for (let key in initialShaders) {
    let value = initialShaders[key];
    loader.load(value, function(shaderContent) {
      initialShaders[key] = shaderContent;
      numberOfShaders--;
      if (numberOfShaders === 0) {
        callback(initialShaders);
      }
    });
  }
}


//////////////////////////////////////////////////////////////////////////////////
// Procedural Planets: Planets that can be updated and changed in real time.
//////////////////////////////////////////////////////////////////////////////////

/*
Procedural Planets
*/
function ProceduralPlanet() {
};
