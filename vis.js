// Options
tailOption = "single"
CSVFileURL = "http://localhost:8000/sketch_params.csv"
wingThickness = 0.1

// Internal global variables
CENTERX = 0
CENTERY = 0
CENTERZ = 0
CSVresult = ""

var Colors = {
	//Colorscheme from
	//https://coolors.co/app/0a122a-274c77-6096ba-a3cef1-cdd6dd
	maastricht:0x0A122A,
	stpatricks:0x274c77,
	silverlake:0x6096ba,
	bbyblue:0xa3cef1,
	columbia:0xcdd6dd,
}

var ComponentColors = {
	fuselage:Colors.stpatricks,
	wing:Colors.silverlake,
	stabilizer:Colors.maastricht,
	esc:Colors.bbyblue,
	motor:Colors.bbyblue,
	propellers:Colors.silverlake
}

function handleFileSelect_csv(evt) {

    var files = evt.target.files; // FileList object
  	var varDict = new Object();

    // files is a FileList of File objects. List some properties.
    var output = [];

    for (var i = 0, f; f = files[i]; i++) {
       var reader = new FileReader();
        reader.onload = function(event)
        {
        	var contents = event.target.result
        	console.log(contents)
        	parsedData = Papa.parse(contents)
        	var varDict = new Object();
        	// varDict = getDummyDict();
			for (var i = 0; i < parsedData.data.length; i ++){
			  dataLine =parsedData.data[i]
			//   console.log(dataLine)
			  if (dataLine[0]!= ''){
			  	varDict[dataLine[0]] = parseFloat(dataLine[1])
			  }
			 }

    		updateRendering(varDict);

     	}
        reader.readAsText(f);
    }
    document.getElementById('files_csv').addEventListener('change', handleFileSelect_csv, false);
}

function getCSVFromServer(){
	console.log('calling')
	$.get(CSVFileURL ,function(msg) {
		if (msg != CSVresult){
			console.log('diff')
			CSVresult = msg;
			parsedData = Papa.parse(CSVresult)
        	var varDict = new Object();
        	// varDict = getDummyDict();
			for (var i = 0; i < parsedData.data.length; i ++){
			  dataLine =parsedData.data[i]
			//   console.log(dataLine)
			  if (dataLine[0]!= ''){
			  	varDict[dataLine[0]] = parseFloat(dataLine[1])
			  }
			 }
    		updateRendering(varDict);
		}
	});
}

function startLiveReload(){
	window.setInterval(function(){
		getCSVFromServer();
	}, 500);
}

function updateRendering(varDict){

	CENTERX = varDict["x_cg"]
	createScene();
	createLights();
	render();

	//Geometry
	fuselage = new Object();
	var mesh = new Mesh("cyl",fuselage, varDict["R_Mission-Aircraft-Fuselage"]/2, varDict["l_Mission-Aircraft-Fuselage"])
	var position = new Position(fuselage,{x:varDict["l_Mission-Aircraft-Fuselage"]/2,y:0,z:0})
	var rotation = new Rotation(fuselage,{x:0,y:0,z:Math.PI/2})
	fuselage.geometry = new Geometry(mesh,position,rotation)
	drawCyl(ComponentColors.fuselage,fuselage.geometry.mesh,fuselage.geometry.position,fuselage.geometry.rotation)
	// console.log('drew fuselage')

	frontCap = new Object();
	var mesh = new Mesh("hemi",frontCap,varDict["R_Mission-Aircraft-Fuselage"]/2)
	var position = new Position(frontCap,{x:fuselage.geometry.position.x.val + varDict["l_Mission-Aircraft-Fuselage"]*0.5,y:0,z:0})
	var rotation = new Rotation(frontCap,{x:0,y:0,z:-Math.PI/2})
	frontCap.geometry = new Geometry(mesh,position,rotation)
	drawHemi(ComponentColors.fuselage,frontCap.geometry.mesh,frontCap.geometry.position,frontCap.geometry.rotation)
	// console.log('drew front cap')

	rearCap = new Object();
	var mesh = new Mesh("hemi",frontCap,varDict["R_Mission-Aircraft-Fuselage"]/2)
	var position = new Position(frontCap,{x:fuselage.geometry.position.x.val-varDict["l_Mission-Aircraft-Fuselage"]*0.5,y:0,z:0})
	var rotation = new Rotation(frontCap,{x:0,y:0,z:Math.PI/2})
	frontCap.geometry = new Geometry(mesh,position,rotation)
	drawHemi(ComponentColors.fuselage,frontCap.geometry.mesh,frontCap.geometry.position,frontCap.geometry.rotation)
	// console.log('drew last')

	wing = new Object();
	//syntax is span, aspect ratio, S
	var mesh = new Mesh("liftSurf",wing,varDict["b_Mission-Aircraft-Wing"],varDict["S_Mission-Aircraft-Wing"],varDict["lambda"])
	var position = new Position(wing,{x:fuselage.geometry.position.x.val,y:0,z:fuselage.geometry.mesh.d.val/2})
	var rotation = fuselage.geometry.rotation
	wing.geometry = new Geometry(mesh,position,rotation)
	drawWing(ComponentColors.wing,wing.geometry.mesh,wing.geometry.position,wing.geometry.rotation)

	cgSphere = new Object();
	var mesh = new Mesh("cyl",cgSphere,varDict["d_cg"],varDict["h_cg"])
	var position = new Position(cgSphere,{x:fuselage.geometry.position.x.val - 0.5*fuselage.geometry.mesh.h.val + varDict["x_cg"],y:0,z:fuselage.geometry.mesh.d.val/1.5})
	var rotation = new Rotation(cgSphere,{x:0,y:0,z:Math.PI/2})
	cgSphere.geometry = new Geometry(mesh,position,rotation)
	drawCyl(0xFF0000,cgSphere.geometry.mesh,cgSphere.geometry.position,cgSphere.geometry.rotation)
	if (tailOption== "single"){
		boom = new Object();
		var mesh = new Mesh("cyl",boom,varDict["d_0"]*0.0833333,varDict["l_Mission-Aircraft-Empennage-TailBoom"])
		var position = new Position(boom,{x:varDict["l_Mission-Aircraft-Fuselage"]/2+varDict["l_Mission-Aircraft-Empennage-TailBoom"]/2,y:0,z:fuselage.geometry.mesh.d.val/2})
		var rotation = fuselage.geometry.rotation;
		boom.geometry = new Geometry(mesh,position,rotation)
		drawCyl(ComponentColors.fuselage,mesh,position,rotation)

		horiz = new Object();
		var mesh = new Mesh("liftSurf",horiz,varDict["b_Mission-Aircraft-Empennage-HorizontalTail"],varDict["S_Mission-Aircraft-Empennage-HorizontalTail"],varDict["lambda_h"])
		var position = new Position(horiz,{x:boom.geometry.position.x.val+boom.geometry.mesh.h.val/2,y:boom.geometry.position.y.val,z:boom.geometry.position.z.val})
		var rotation = fuselage.geometry.rotation;
		horiz.geometry = new Geometry(mesh,position,rotation)
		drawWing(ComponentColors.stabilizer,mesh,position,rotation);

		vert = new Object();
		var mesh = new Mesh("liftSurf",vert,varDict["b_Mission-Aircraft-Empennage-VerticalTail"],varDict["S_Mission-Aircraft-Empennage-VerticalTail"],varDict["lambda_v"])
		var position = new Position(vert,{x:boom.geometry.position.x.val+boom.geometry.mesh.h.val/2,y:boom.geometry.position.y.val,z:boom.geometry.position.z.val+mesh.b.val/2})
		var rotation = new Rotation(vert,{x:Math.PI/2,y:0,z:Math.PI/2})
		horiz.geometry = new Geometry(mesh,position,rotation)
		drawWing(ComponentColors.stabilizer,mesh,position,rotation);

	}
	if (tailOption == "dual"){
		//Draw tails -1 is left when viewed from rear, +1 is right
		for (var i = -1; i < 2; i = i+2){
			boom = new Object();
			var mesh = new Mesh("cyl",boom,varDict["d_0"]*0.0833333,varDict["l_Mission-Aircraft-Empennage-TailBoom"])
			var position = new Position(boom,{x:varDict["l_Mission-Aircraft-Fuselage"]/2+varDict["l_Mission-Aircraft-Empennage-TailBoom"]/2,y:i*varDict["b_Mission-Aircraft-Empennage-HorizontalTail"]*0.5,z:fuselage.geometry.mesh.d.val/2})
			var rotation = fuselage.geometry.rotation;
			boom.geometry = new Geometry(mesh,position,rotation)
			drawCyl(ComponentColors.fuselage,mesh,position,rotation)

			horiz = new Object();
			var mesh = new Mesh("liftSurf",horiz,varDict["b_Mission-Aircraft-Empennage-HorizontalTail"],varDict["S_Mission-Aircraft-Empennage-HorizontalTail"],varDict["lambda_h"])
			var position = new Position(horiz,{x:boom.geometry.position.x.val+boom.geometry.mesh.h.val/2,y:boom.geometry.position.y.val,z:boom.geometry.position.z.val})
			var rotation = fuselage.geometry.rotation;
			horiz.geometry = new Geometry(mesh,position,rotation)
			drawWing(ComponentColors.stabilizer,mesh,position,rotation);

			vert = new Object();
			var mesh = new Mesh("liftSurf",vert,varDict["b_Mission-Aircraft-Empennage-VerticalTail"],varDict["S_Mission-Aircraft-Empennage-VerticalTail"]/2,varDict["lambda_v"])
			var position = new Position(vert,{x:boom.geometry.position.x.val+boom.geometry.mesh.h.val/2,y:boom.geometry.position.y.val,z:boom.geometry.position.z.val+mesh.b.val/2})
			var rotation = new Rotation(vert,{x:Math.PI/2,y:0,z:Math.PI/2})
			horiz.geometry = new Geometry(mesh,position,rotation)
			drawWing(ComponentColors.stabilizer,mesh,position,rotation);
		}
	}


	//
	// WARNING - THE PI TAIL OPTION DOES NOT MATCH CURRENT INPUT SYNTAX
	//


	// if (tailOption == "pi"){
	// 	//Draw tails -1 is left when viewed from rear, +1 is right
	// 	for (var i = -1; i < 2; i = i+2){
	// 		boom = new Object();
	// 		var mesh = new Mesh("cyl",boom,varDict["L"]/varDict["tailBoomAR"],varDict["L"])
	// 		var position = new Position(boom,{x:varDict["fuse_len"]/2+varDict["L"]/2,y:i*varDict["eta"]*varDict["d"]*0.5,z:fuselage.geometry.mesh.d.val/2})
	// 		var rotation = fuselage.geometry.rotation;
	// 		boom.geometry = new Geometry(mesh,position,rotation)
	// 		drawCyl(ComponentColors.fuselage,mesh,position,rotation)
	//
	// 		vert = new Object();
	// 		var mesh = new Mesh("liftSurf",vert,varDict["b_v"],varDict["S_v"]/2,varDict["lambda_v"])
	// 		var position = new Position(vert,{x:boom.geometry.position.x.val+boom.geometry.mesh.h.val/2,y:boom.geometry.position.y.val,z:boom.geometry.position.z.val+mesh.b.val/2})
	// 		var rotation = new Rotation(vert,{x:Math.PI/2,y:0,z:Math.PI/2})
	// 		vert.geometry = new Geometry(mesh,position,rotation)
	// 		drawWing(ComponentColors.stabilizer,mesh,position,rotation);
	//
	// 		horiz = new Object();
	// 		var mesh = new Mesh("liftSurf",horiz,varDict["b_h"],varDict["S_h"],varDict["lambda_h"])
	// 		var position = new Position(horiz,{x:boom.geometry.position.x.val+boom.geometry.mesh.h.val/2,y:fuselage.geometry.position.y.val,z:boom.geometry.position.z.val+vert.geometry.mesh.b.val})
	// 		var rotation = fuselage.geometry.rotation;
	// 		horiz.geometry = new Geometry(mesh,position,rotation)
	// 		drawWing(ComponentColors.stabilizer,mesh,position,rotation);
	//
	//
	//
	// 	}
	// }

	// prop = new Object();
	// var mesh = new Mesh("prop",prop,varDict["d_prop"],varDict["shaft_len"])
	// var position = new Position(prop,{x:boom.geometry.position.x.val+boom.geometry.mesh.h.val/2,y:boom.geometry.position.y.val,z:boom.geometry.position.z.val})
	// var rotation = new Rotation(prop,{x:Math.PI/2,y:0,z:Math.PI/2})
	// horiz.geometry = new Geometry(mesh,position,rotation)
	// drawWing(ComponentColors.stabilizer,mesh,position,rotation);
	renderVarDict(varDict)
	render();
	animate();
}

renderVarDict = function(varDict){
	varDictStr = ""
	for (var varKey in varDict){
		variable = varDict[varKey]
		varDictStr = varDictStr + '<li>'+varKey+' : '+variable+'</li>'
	}
	$('#varDictView').html(varDictStr)
}

Mesh = function(){
	type = arguments[0]
	parentObj = arguments[1]
	this.type = type
	this.volume = new Variable("volume"+parentObj.nameStr,"m^3")
	if (type=="rect"){
		this.xlen = new Variable("xlen"+parentObj.nameStr,arguments[2],"m")
		this.ylen = new Variable("ylen"+parentObj.nameStr,arguments[3],"m")
		this.zlen = new Variable("zlen"+parentObj.nameStr,arguments[4],"m")
	}
	if (type=="cyl"){
		this.d = new Variable("d"+parentObj.nameStr,arguments[2],"m")
		this.h = new Variable("h"+parentObj.nameStr,arguments[3],"m")
	}
	if (type=="hemi"){
		this.d = new Variable("d"+parentObj.nameStr,arguments[2],"m")
	}
	if (type=="liftSurf"){
		this.b = new Variable("b"+parentObj.nameStr,arguments[2],"m")
		this.S = new Variable("S"+parentObj.nameStr,arguments[3],"m")
		this.lambda = new Variable("lambda"+parentObj.nameStr,arguments[4],"m")
	}
	if (type=="prop"){
		this.d = new Variable("d"+parentObj.nameStr,arguments[2],"m")
		this.shaftLen = new Variable("shaftLen"+parentObj.nameStr,arguments[3],"m")
	}
}

Position = function(parentObj,valDict){
	this.x = new Variable("xpos"+parentObj.nameStr,valDict.x,"m")
	this.y = new Variable("ypos"+parentObj.nameStr,valDict.y,"m")
	this.z = new Variable("zpos"+parentObj.nameStr,valDict.z,"m")

	if (valDict.x == undefined){
		this.x = new Variable("xpos"+parentObj.nameStr,"m")
	}
	if (valDict.y == undefined){
		this.y = new Variable("ypos"+parentObj.nameStr,"m")
	}
	if (valDict.z == undefined){
		this.z = new Variable("zpos"+parentObj.nameStr,"m")
	}
}

Rotation = function(parentObj,valDict){
	this.x = new Variable("xrot"+parentObj.nameStr,valDict.x,"degrees")
	this.y = new Variable("yrot"+parentObj.nameStr,valDict.y,"degrees")
	this.z = new Variable("zrot"+parentObj.nameStr,valDict.z,"degrees")

	if (valDict.x == undefined){
		this.x = new Variable("xrot"+parentObj.nameStr,"degrees")
	}
	if (valDict.y == undefined){
		this.y = new Variable("yrot"+parentObj.nameStr,"degrees")
	}
	if (valDict.z == undefined){
		this.z = new Variable("zrot"+parentObj.nameStr,"degrees")
	}
}

Geometry = function(mesh,position,rotation){
	this.mesh = mesh
	this.position = position
	this.rotation = rotation
	this.matesArr = []

	this.getFace = function(faceStr){
		if (faceStr=="z_upper"){
			var xArr = []
			var yArr = []
			var zArr = []
			xArr.push(this.position.x)
		}
	}
	this.getConstraints = function(){
		var constraints = []
		for(var i = 0; i<this.matesArr.length; i++){
			constraints.push.apply(constraints,this.matesArr[i].getConstraints())
		}
		return constraints;
	}
}


drawBox = function(color,mesh,position,rotation){
	//Inputs are color, then mesh, position,rotation
	//Returns the rectangle object drawn, for reference by others
	geometry = new THREE.BoxGeometry( mesh.xlen.val, mesh.ylen.val,mesh.zlen.val);
	material = new THREE.MeshPhongMaterial( { color: color} );
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(position.x.val,position.y.val,position.z.val)
	mesh.rotation.set(rotation.x.val,rotation.y.val,rotation.z.val)
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	geometry.dynamic = true
	scene.add( mesh );
	return mesh;
}

drawCyl = function(color,mesh,position,rotation){
	//Inputs are color, then mesh, position,rotation
	//Returns the cylinder object drawn, for reference by others
	geometry = new THREE.CylinderGeometry( mesh.d.val*0.5,mesh.d.val*0.5,mesh.h.val,10);
	material = new THREE.MeshPhongMaterial( { color: color} );
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(position.x.val,position.y.val,position.z.val)
	mesh.rotation.set(rotation.x.val,rotation.y.val,rotation.z.val)
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	geometry.dynamic = true
	scene.add( mesh );
	// console.log(scene)
	return mesh;
}

drawHemi = function(color,mesh,position,rotation){
	//Make spinner
	var geometry = new THREE.SphereGeometry( mesh.d.val*0.5, 100, 100, 2*Math.PI, 2*Math.PI, 3*Math.PI/2);
	var material = new THREE.MeshBasicMaterial( { color: color, wireframe:false} );
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(position.x.val,position.y.val,position.z.val)
	mesh.rotation.set(rotation.x.val,rotation.y.val,rotation.z.val)
	// console.log(mesh)
	mesh.material.side = THREE.DoubleSide;
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	geometry.dynamic = true
	scene.add( mesh );
}

drawWing = function(color,mesh,position,rotation){
	halfSpan = mesh.b.val/2
	rootHalfChord = mesh.S.val/(mesh.b.val*(1+mesh.lambda.val));
	tipHalfChord = mesh.lambda.val*rootHalfChord;

	var extrudeSettings = {
				curveSegments	: 100,
				steps			: 200,
				bevelEnabled	: false,
				amount			: rootHalfChord*wingThickness
	};

	var pts = [
                 new THREE.Vector2(halfSpan,tipHalfChord),
                 new THREE.Vector2(halfSpan,-tipHalfChord),
                 new THREE.Vector2(0,-rootHalfChord),
                 new THREE.Vector2(-halfSpan,-tipHalfChord),
                 new THREE.Vector2(-halfSpan,tipHalfChord),
                 new THREE.Vector2(0,rootHalfChord)
              ];

	var shape = new THREE.Shape(pts);
	var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	var material = new THREE.MeshLambertMaterial( { color: ComponentColors.wing, wireframe: false } );
	var mesh = new THREE.Mesh( geometry, material );
	mesh.rotation.set(rotation.x.val,rotation.y.val,rotation.z.val)
	mesh.position.set(position.x.val,position.y.val,position.z.val)
	scene.add( mesh );

}

drawProp = function(color,mesh,position,rotation){
	// 	//Make propellers
	aoa = 10
	diameter = 0.2
	shaftRadius = mesh.d.val*0.01
	shaftLen = mesh.shaftLen.val
	chord = diameter*0.03
	thicknessToChordRatio = 0.1 //Thickness to chord ratio
	thickness = chord*thicknessToChordRatio

	// //Make shaft
	//Geometry
	propShaft = new Object();
	var mesh = new Mesh("cyl",propShaft,varDict["d_prop"],varDict["shaft_len"])
	var position = new Position(propShaft,{x:varDict["fuse_len"],y:0,z:0})
	var rotation = new Rotation(propShaft,{x:0,y:0,z:Math.PI/2})
	propShaft.geometry = new Geometry(mesh,position,rotation)
	drawCyl(ComponentColors.propellers,fuselage.geometry.mesh,fuselage.geometry.position,fuselage.geometry.rotation)
	propShaft.rotateX(Math.radians(90))
	propShaft.position.set(motorCyl.position.x,motorCyl.position.y,motorHeight+shaftLen/2)
	scene.add( propShaft );


}

$(document).ready(function(){

  document.getElementById('files_csv').addEventListener('change', handleFileSelect_csv, false);

});

var container
var camera, controls, scene, renderer;
var cross;

createScene = function(){
	scene = new THREE.Scene();
	var HEIGHT = $('#threedview').height();
	var WIDTH = $('#threedview').width();
	// Create the camera
	console.log(HEIGHT,WIDTH)
	if (typeof camera == 'undefined'){
		aspectRatio = WIDTH / HEIGHT;
		fieldOfView = 60;
		nearPlane = 0.001;
		farPlane = 10000;
		camera = new THREE.PerspectiveCamera(
			fieldOfView,
			aspectRatio,
			nearPlane,
			farPlane
		);
		// Set the position of the camera
		camera.position.x = -10
		camera.position.y = 0
		camera.position.z = 10

		camera.up = new THREE.Vector3(0,0,1);
		camera.lookAt(new THREE.Vector3(10,10,1));
		renderer = new THREE.WebGLRenderer({
		// Allow transparency to show the gradient background
		// we defined in the CSS
			alpha: true,
			antialias: true}
		);
		renderer.setSize( WIDTH,HEIGHT );
	}
	raycaster = new THREE.Raycaster();
	container = document.getElementById('threedview');
	container.appendChild(renderer.domElement);
	controls = new THREE.TrackballControls( camera,renderer.domElement );
	controls.target.x = CENTERX
	controls.target.y = CENTERY
	controls.target.z = CENTERZ
	// renderer.domElement.addEventListener('mousedown', onMouseDown, false);
	// renderer.domElement.addEventListener('mousemove', onMouseMove, false);
	window.addEventListener( 'resize', onWindowResize, false );
}

function createLights() {
	// A hemisphere light is a gradient colored light;
	// the first parameter is the sky color, the second parameter is the ground color,
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)

	// A directional light shines from a specific direction.
	// It acts like the sun, that means that all the rays produced are parallel.
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// Set the direction of the light
	shadowLight.position.set(150, 350, 350);

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

	createLights()
	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setClearColor( scene.fog.color );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight/1.5 );
	container = document.getElementById('threedview');
	container.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, true );

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

render = function () {
	requestAnimationFrame( render );
	controls.update()
	// changes to the vertices
	renderer.render(scene, camera);
};

drawFoil = function(){
	var extrudeSettings = {
				curveSegments	: 100,
				steps			: 200,
				bevelEnabled	: false,
				amount			: 100
	};
	a = 10
	b = 10
	var line = new THREE.SplineCurve(
                [
                 new THREE.Vector2(a*0.0000000, b*0.0000000),
				 new THREE.Vector2(a*0.0005839, b*0.0042603),
				 new THREE.Vector2(a*0.0023342, b*0.0084289),
				 new THREE.Vector2(a*0.0052468, b*0.0125011),
				 new THREE.Vector2(a*0.0093149, b*0.0164706),
				 new THREE.Vector2(a*0.0145291, b*0.0203300),
				 new THREE.Vector2(a*0.0208771, b*0.0240706),
				 new THREE.Vector2(a*0.0283441, b*0.0276827),
				 new THREE.Vector2(a*0.0369127, b*0.0311559),
				 new THREE.Vector2(a*0.0465628, b*0.0344792),
				 new THREE.Vector2(a*0.0572720, b*0.0376414),
				 new THREE.Vector2(a*0.0690152, b*0.0406310),
				 new THREE.Vector2(a*0.0817649, b*0.0434371),
				 new THREE.Vector2(a*0.0954915, b*0.0460489),
				 new THREE.Vector2(a*0.1101628, b*0.0484567),
				 new THREE.Vector2(a*0.1257446, b*0.0506513),
				 new THREE.Vector2(a*0.1422005, b*0.0526251),
				 new THREE.Vector2(a*0.1594921, b*0.0543715),
				 new THREE.Vector2(a*0.1775789, b*0.0558856),
				 new THREE.Vector2(a*0.1964187, b*0.0571640),
				 new THREE.Vector2(a*0.2159676, b*0.0582048),
				 new THREE.Vector2(a*0.2361799, b*0.0590081),
				 new THREE.Vector2(a*0.2570083, b*0.0595755),
				 new THREE.Vector2(a*0.2784042, b*0.0599102),
				 new THREE.Vector2(a*0.3003177, b*0.0600172),
				 new THREE.Vector2(a*0.3226976, b*0.0599028),
				 new THREE.Vector2(a*0.3454915, b*0.0595747),
				 new THREE.Vector2(a*0.3686463, b*0.0590419),
				 new THREE.Vector2(a*0.3921079, b*0.0583145),
				 new THREE.Vector2(a*0.4158215, b*0.0574033),
				 new THREE.Vector2(a*0.4397317, b*0.0563200),
				 new THREE.Vector2(a*0.4637826, b*0.0550769),
				 new THREE.Vector2(a*0.4879181, b*0.0536866),
				 new THREE.Vector2(a*0.5120819, b*0.0521620),
				 new THREE.Vector2(a*0.5362174, b*0.0505161),
				 new THREE.Vector2(a*0.5602683, b*0.0487619),
				 new THREE.Vector2(a*0.5841786, b*0.0469124),
				 new THREE.Vector2(a*0.6078921, b*0.0449802),
				 new THREE.Vector2(a*0.6313537, b*0.0429778),
				 new THREE.Vector2(a*0.6545085, b*0.0409174),
				 new THREE.Vector2(a*0.6773025, b*0.0388109),
				 new THREE.Vector2(a*0.6996823, b*0.0366700),
				 new THREE.Vector2(a*0.7215958, b*0.0345058),
				 new THREE.Vector2(a*0.7429917, b*0.0323294),
				 new THREE.Vector2(a*0.7638202, b*0.0301515),
				 new THREE.Vector2(a*0.7840324, b*0.0279828),
				 new THREE.Vector2(a*0.8035813, b*0.0258337),
				 new THREE.Vector2(a*0.8224211, b*0.0237142),
				 new THREE.Vector2(a*0.8405079, b*0.0216347),
				 new THREE.Vector2(a*0.8577995, b*0.0196051),
				 new THREE.Vector2(a*0.8742554, b*0.0176353),
				 new THREE.Vector2(a*0.8898372, b*0.0157351),
				 new THREE.Vector2(a*0.9045085, b*0.0139143),
				 new THREE.Vector2(a*0.9182351, b*0.0121823),
				 new THREE.Vector2(a*0.9309849, b*0.0105485),
				 new THREE.Vector2(a*0.9427280, b*0.0090217),
				 new THREE.Vector2(a*0.9534372, b*0.0076108),
				 new THREE.Vector2(a*0.9630873, b*0.0063238),
				 new THREE.Vector2(a*0.9716559, b*0.0051685),
				 new THREE.Vector2(a*0.9791229, b*0.0041519),
				 new THREE.Vector2(a*0.9854709, b*0.0032804),
				 new THREE.Vector2(a*0.9906850, b*0.0025595),
				 new THREE.Vector2(a*0.9947532, b*0.0019938),
				 new THREE.Vector2(a*0.9976658, b*0.0015870),
				 new THREE.Vector2(a*0.9994161, b*0.0013419),
				 new THREE.Vector2(a*1.0000000, b*0.0012600),
				 new THREE.Vector2(a*1.0000000, b*-.0000000),
				 new THREE.Vector2(a*0.9994161, b*-.0013419),
				 new THREE.Vector2(a*0.9976658, b*-.0015870),
				 new THREE.Vector2(a*0.9947532, b*-.0019938),
				 new THREE.Vector2(a*0.9906850, b*-.0025595),
				 new THREE.Vector2(a*0.9854709, b*-.0032804),
				 new THREE.Vector2(a*0.9791229, b*-.0041519),
				 new THREE.Vector2(a*0.9716559, b*-.0051685),
				 new THREE.Vector2(a*0.9630873, b*-.0063238),
				 new THREE.Vector2(a*0.9534372, b*-.0076108),
				 new THREE.Vector2(a*0.9427280, b*-.0090217),
				 new THREE.Vector2(a*0.9309849, b*-.0105485),
				 new THREE.Vector2(a*0.9182351, b*-.0121823),
				 new THREE.Vector2(a*0.9045085, b*-.0139143),
				 new THREE.Vector2(a*0.8898372, b*-.0157351),
				 new THREE.Vector2(a*0.8742554, b*-.0176353),
				 new THREE.Vector2(a*0.8577995, b*-.0196051),
				 new THREE.Vector2(a*0.8405079, b*-.0216347),
				 new THREE.Vector2(a*0.8224211, b*-.0237142),
				 new THREE.Vector2(a*0.8035813, b*-.0258337),
				 new THREE.Vector2(a*0.7840324, b*-.0279828),
				 new THREE.Vector2(a*0.7638202, b*-.0301515),
				 new THREE.Vector2(a*0.7429917, b*-.0323294),
				 new THREE.Vector2(a*0.7215958, b*-.0345058),
				 new THREE.Vector2(a*0.6996823, b*-.0366700),
				 new THREE.Vector2(a*0.6773025, b*-.0388109),
				 new THREE.Vector2(a*0.6545085, b*-.0409174),
				 new THREE.Vector2(a*0.6313537, b*-.0429778),
				 new THREE.Vector2(a*0.6078921, b*-.0449802),
				 new THREE.Vector2(a*0.5841786, b*-.0469124),
				 new THREE.Vector2(a*0.5602683, b*-.0487619),
				 new THREE.Vector2(a*0.5362174, b*-.0505161),
				 new THREE.Vector2(a*0.5120819, b*-.0521620),
				 new THREE.Vector2(a*0.4879181, b*-.0536866),
				 new THREE.Vector2(a*0.4637826, b*-.0550769),
				 new THREE.Vector2(a*0.4397317, b*-.0563200),
				 new THREE.Vector2(a*0.4158215, b*-.0574033),
				 new THREE.Vector2(a*0.3921079, b*-.0583145),
				 new THREE.Vector2(a*0.3686463, b*-.0590419),
				 new THREE.Vector2(a*0.3454915, b*-.0595747),
				 new THREE.Vector2(a*0.3226976, b*-.0599028),
				 new THREE.Vector2(a*0.3003177, b*-.0600172),
				 new THREE.Vector2(a*0.2784042, b*-.0599102),
				 new THREE.Vector2(a*0.2570083, b*-.0595755),
				 new THREE.Vector2(a*0.2361799, b*-.0590081),
				 new THREE.Vector2(a*0.2159676, b*-.0582048),
				 new THREE.Vector2(a*0.1964187, b*-.0571640),
				 new THREE.Vector2(a*0.1775789, b*-.0558856),
				 new THREE.Vector2(a*0.1594921, b*-.0543715),
				 new THREE.Vector2(a*0.1422005, b*-.0526251),
				 new THREE.Vector2(a*0.1257446, b*-.0506513),
				 new THREE.Vector2(a*0.1101628, b*-.0484567),
				 new THREE.Vector2(a*0.0954915, b*-.0460489),
				 new THREE.Vector2(a*0.0817649, b*-.0434371),
				 new THREE.Vector2(a*0.0690152, b*-.0406310),
				 new THREE.Vector2(a*0.0572720, b*-.0376414),
				 new THREE.Vector2(a*0.0465628, b*-.0344792),
				 new THREE.Vector2(a*0.0369127, b*-.0311559),
				 new THREE.Vector2(a*0.0283441, b*-.0276827),
				 new THREE.Vector2(a*0.0208771, b*-.0240706),
				 new THREE.Vector2(a*0.0145291, b*-.0203300),
				 new THREE.Vector2(a*0.0093149, b*-.0164706),
				 new THREE.Vector2(a*0.0052468, b*-.0125011),
				 new THREE.Vector2(a*0.0023342, b*-.0084289),
				 new THREE.Vector2(a*0.0005839, b*-.0042603),
				 new THREE.Vector2(a*0.000000,b*0.0000000)

                ]);
	var shape = new THREE.Shape(line.getSpacedPoints(100));
	var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

	var material = new THREE.MeshLambertMaterial( { color: 0xb00000, wireframe: false } );
	var mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );
}

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
