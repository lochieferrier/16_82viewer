function handleFileSelect_csv(evt) {
    var files = evt.target.files; // FileList object
  	var varDict = new Object();

    // files is a FileList of File objects. List some properties.
    var output = [];
    console.log('reading file')
    for (var i = 0, f; f = files[i]; i++) {
    	console.log(files)
       var reader = new FileReader();

        reader.onload = function(event)
        {
        	var contents = event.target.result
        	console.log(contents)
     	}
        reader.readAsText(f);
    }
    document.getElementById('files_csv').addEventListener('change', handleFileSelect_csv, false);

	varDict = getDummyDict();
    updateRendering(varDict);
}
function getDummyDict(){
	var varDict = new Object();
	varDict["S"] = 10;
	varDict["b"] = 10;
	varDict["l_{fuel}"] = 3;
	varDict["d"] = 4;
	varDict["L"] = 10; //gonna guess this is fuselage length
	varDict["S_h"] = 3;
	varDict["S_v"] = 4;
	varDict["b_h"] = 4;
	varDict["b_v"] = 5;
	varDict["lambda"] = 0.5;
	varDict["t_sep/d"] = 3;
	return varDict;
}

function updateRendering(varDict){
	console.log(varDict)
	var geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
	geometry.dynamic = true;
	var material =  new THREE.MeshPhongMaterial( { color:0xcccccc, shading: THREE.FlatShading } );
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.x = 0;
	mesh.position.y = 0;
	mesh.position.z = 0;
	mesh.rotation.x = Math.PI/2
	mesh.rotation.z = Math.PI/2
	mesh.updateMatrix();
	mesh.matrixAutoUpdate = false;
		mesh.castShadow = true;
	mesh.receiveShadow = true;
	scene.add( mesh );	
	drawBoxOld("#cccccc",20,20,20,0,0,0)
}

$(document).ready(function(){
  console.log('jh')
  // updateRendering(getDummyDict())
  document.getElementById('files_csv').addEventListener('change', handleFileSelect_csv, false);
  init();
  animate();

});

// if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container
var camera, controls, scene, renderer;
var cross;

function init() {
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.z = 50;
	controls = new THREE.TrackballControls( camera );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [ 65, 83, 68 ];
	controls.addEventListener( 'change', render );
	// world
	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0xdddddd, 0.002 );
	
	
	// // lights
	// light = new THREE.DirectionalLight( 0xffffff );
	// light.position.set( 1, 1, 1 );
	// scene.add( light );
	// light = new THREE.DirectionalLight( 0xffffff );
	// light.position.set( -1, -1, -1 );
	// scene.add( light );
	// light = new THREE.AmbientLight( 0xffffff );
	// scene.add( light );
	// renderer
	createLights()
	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setClearColor( scene.fog.color );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container = document.getElementById('threedview');
	container.appendChild( renderer.domElement );
	// stats = new Stats();
	// container.appendChild( stats.dom );
	//
	window.addEventListener( 'resize', onWindowResize, false );
	//
		updateRendering();

	render();
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	controls.handleResize();
	render();
}
function animate() {
	requestAnimationFrame( animate );
	controls.update();
}
function render() {
	renderer.render( scene, camera );
	// stats.update();
}


// var camera, scene, renderer;
// 	var container, stats;
// 	var cube, plane;

// setup3D = function(componentsArr,n_rotors){

// 	// createScene();
// 	// createLights();
// 	// drawBoxOld('#ffccff',0,0,0,0,0,0)
	
// 	// console.log(componentsArr)
// 	// for(var i=0;i<componentsArr.length;i++){
// 	// 	drawComponent(componentsArr[i])
// 	// }
// 	// drawQuad();
// 	// createArm();
// 	// createBattery();
// 	// createSpeedController();
// 	// createMotor();
// 	// createPropeller();

// 	// / create the camera
// 	camera = new THREE.Camera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
// 	camera.position.y = 0;
// 	camera.position.z = 0;
// 	camera.position.y = 0;
// 	// create the Scene
// 	scene = new THREE.Scene();
// 	// create the Cube
// 	cube = new THREE.Mesh( new THREE.CubeGeometry( 200, 200, 200 ), new THREE.MeshNormalMaterial() );
// 	cube.position.y = 0;
// 	// add the object to the scene
// 	scene.add(cube);
// 	// create the container element
// 	container = document.createElement( 'div' );
// 	document.body.appendChild( container );

// 	// init the WebGL renderer and append it to the Dom
// 	renderer = new THREE.WebGLRenderer();
// 	renderer.setSize( window.innerWidth, window.innerHeight );
// 	container.appendChild( renderer.domElement );
// 	render()
// }
// function animate() {
// 				// render the 3D scene
// 				render();
// 				// relaunch the 'timer' 
// 				requestAnimationFrame( animate );
// 				// update the Stats element
// 				// stats.update();
// 			}
// /**
//  * Render the 3D scene
// */
// function render() {
// 	// animate the cube
// 	// cube.rotation.x += 0.02;
// 	// cube.rotation.y += 0.0225;
// 	// cube.rotation.z += 0.0175;
// 	// // make the cube bounce
// 	// var dtime	= Date.now() - startTime;
// 	// cube.scale.x	= 1.0 + 0.3*Math.sin(dtime/300);
// 	// cube.scale.y	= 1.0 + 0.3*Math.sin(dtime/300);
// 	// cube.scale.z	= 1.0 + 0.3*Math.sin(dtime/300);
// 	// actually display the scene in the Dom element
// 	renderer.render( scene, camera );
// }
function createLights() {
	// A hemisphere light is a gradient colored light; 
	// the first parameter is the sky color, the second parameter is the ground color, 
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	
	// A directional light shines from a specific direction. 
	// It acts like the sun, that means that all the rays produced are parallel. 
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// Set the direction of the light  
	shadowLight.position.set(0, 0, 25);
	
	// Allow shadow casting 
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	
	// to activate the lights, just add them to the scene
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}


drawBoxOld = function(){
	//Inputs are color, then x,y,z dims, then x,y,z positioning, then rotation
	//Returns the rectangle object drawn, for reference by others
	geometry = new THREE.BoxGeometry( arguments[1], arguments[2],arguments[3]);
	material = new THREE.MeshPhongMaterial( { color: arguments[0],wireframe:false} );
	mesh = new THREE.Mesh( geometry, material );
	
	if(arguments.length > 4){
		mesh.position.set(arguments[4],arguments[5],arguments[6])
	}
	if(arguments.length > 7){
		mesh.rotation.set(arguments[7],arguments[8],arguments[9])
	}
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	geometry.dynamic = true
	scene.add( mesh );
	console.log(mesh)
	return mesh;
}