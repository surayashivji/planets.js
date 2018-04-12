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
StarColor

@param String (Hex Code) - coronaColor: surrounding glow color of the star.
@param String (Hex Code) - coreColor: primary color of the star (center).
@param String (Hex Code) - innerBorderColor: color for the thin inner border of the star.
@param String (Hex Code) - outerBorderColor: color for the thin outer border of the star.
@param Number (Range 0-1) - intensity: intensity of the star's colors.
*/
function StarColor(coronaColor, coreColor, innerBorderColor, outerBorderColor, intensity) {
  this.corona = coronaColor;
  this.core = coreColor;
  this.innerBorder = innerBorderColor;
  this.outerBorder = outerBorderColor;
  this.intensity = intensity;
}

/*
StarPlanets

@param Number - radius: sphere radius of star.
@param StarColor - starPlanetColor: StarColor object with each color component of the star.
@param Number (Range 0-1) - particleDisplacement: how spread out the star's particles are.
@param Number (Range 0-0.01) - timeMultiplier: how fast the star's particles move.
*/
function StarPlanet(radius, starPlanetColor, particleDisplacement, timeMultiplier) {
  this.radius = radius;
  this.colors = starPlanetColor;
  this.shaders = {};
  this.timeMultiplier = timeMultiplier;
  this.displacement = particleDisplacement;
  this.starObject = new THREE.Object3D();
  this.start_time =+ new Date();
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
        value : this.timeMultiplier
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
        value : starPlanetColor.intensity
    },
    ratio_step_2:
    {
        type  : 'f',
        value : 0.9
    },
    displacement:
    {
        type  : 'f',
        value : this.displacement
    }
  };
  THREE.Cache.enabled = true;
}

/*
Creates the base sphere geometry for the star.

@param Dictionary - shader: dict of shaders (value) and their names (keys) for the Star planet.
*/
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
  sphereGeometry.name = "Sphere";
  return sphereGeometry;
}

/*
Creates the surrounding halo geometry for the star.

@param Dictionary - shader: dict of shaders (value) and their names (keys) for the Star planet.
*/
StarPlanet.prototype.createHalo = function(shader) {
  var haloVertexShader = document.getElementById('shader-vertex-star-halo').textContent;
  var haloFragmentShader = document.getElementById('shader-fragment-star-halo').textContent;
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
    haloGeometry.name = "Halo";
    return haloGeometry;
}

/*
Creates the surrounding halo geometry for the star.

@param Dictionary - shader: dict of shaders (value) and their names (keys) for the Star planet.
*/
StarPlanet.prototype.createStar = function(shader) {
  var sphere = this.createSphereObject(shader);
  var halo = this.createHalo(shader);
  this.starObject.add(sphere);
  this.starObject.add(halo);
}

/*
Loads the shaders for the star.

@param callback function executes after the shaders have been loaded.
*/
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

/*
Updates halo position and shader uniforms every frame.

@param THREE.PerspectiveCamera - camera: reference to the camera being used in the scene.
*/
StarPlanet.prototype.updateFrames = function(camera) {
  this.starMaterialUniforms.time.value =+ new Date() - this.start_time;
  if (this.starObject.children.length > 0) {
    var halo = this.starObject.children[1];
    this.starObject.children.forEach(function(element) {
      if(element.name == "Halo") {
        halo.lookAt(camera.position);
      }
    });
  }
}

/*
Sets up debugging for a Star Planet.
*/
StarPlanet.prototype.setupDebugging = function() {
  this.gui = new dat.GUI();
  this.gui_params  = this.gui.addFolder('Properties');
  this.gui_presets = this.gui.addFolder('Predefined Colors');
  this.gui_manual_update = false;

  this.gui_params.open();

  // var coronaColor = this.gui_params.addColor(this.colors.corona).name('Corona Color');
  // var coreColor = this.gui_params.addColor(this.colors.core).name('Core Color');
  // var innerBorderColor = this.gui_params.addColor(this.colors.innerBorder).name('Inner Border Color');
  // var outerBorderColor = this.gui_params.addColor(this.colors.outerBorder).name('Outer Border Color');

  this.gui_params.add(this.starMaterialUniforms.ratio_step_1,'value').min(0).max(1).step(0.01).name('Intensity');
  this.gui_params.add(this.starMaterialUniforms.displacement,'value').min(0).max(1).step(0.0001).name('displacement');
  this.gui_params.add(this.starMaterialUniforms.time_multiplier,'value').min(0).max(0.01).step(0.00001).name('time multiplier');

  // this.gui_presets.open();
  // this.gui_presets.add(window, 'this.showPresetPurple').name('Purple Star');
  // this.gui_presets.add(window, 'showPresetBlue').name('Blue Star');
  // this.gui_presets.add(window, 'showPresetGreen').name('Green Star');
  // this.gui_presets.add(window, 'showPresetWhite').name('White Star');
}

StarPlanet.prototype.showPresetPurple = function() {
  console.log("purple!!");
}

/*
Upd
*/
StarPlanet.prototype.updateColorsDebugging = function() {
  this.starMaterialUniforms.color_step_1.value = new THREE.Color(this.colors.corona);
  this.starMaterialUniforms.color_step_2.value = new THREE.Color(this.colors.core);
  this.starMaterialUniforms.color_step_3.value = new THREE.Color(this.colors.innerBorder);
  this.starMaterialUniforms.color_step_4.value = new THREE.Color(starPlanetColor.outerBorder);

  this.gui_manual_update = true;

  // coronaColor.setValue(this.colors.corona);
  // color_2.setValue(this.colors.core);
  // color_3.setValue(this.colors.innerBorder);
  // color_4.setValue(starPlanetColor.outerBorder);

  this.gui_manual_update = false;
}


function go_preset_red()
{
    colors.current = Object.create(colors.red);
    update_colors();
}

function go_preset_blue()
{
    colors.current = Object.create(colors.blue);
    update_colors();
}

function go_preset_green()
{
    colors.current = Object.create(colors.green);
    update_colors();
}


//////////////////////////////////////////////////////////////////////////////////
// Procedural Planets: Planets that can be updated and changed in real time.
//////////////////////////////////////////////////////////////////////////////////

/*
Procedural Planets
*/
function ProceduralPlanet() {
};
