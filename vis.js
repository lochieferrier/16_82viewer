var Colors = {
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
	varDict["S"] = 20;
	varDict["b"] = 30;
	varDict["l_{fuel}"] = 3;
	varDict["d"] = 4;
	varDict["L"] = 10; //length out to booms
	varDict["S_h"] = 5;
	varDict["S_v"] = 4;
	varDict["b_h"] = 4;
	varDict["b_v"] = 5;
	varDict["lambda"] = 2;
	varDict["t_sep/d"] = 2.5;
	varDict["fuse_len"] = 10;

	//Constants used to draw something really
	varDict["tailBoomAR"] = 20;
	varDict["lambda_h"] = 1;
	varDict["lambda_v"] = 1;
	varDict["shaft_len"] = 1;
	varDict["d_prop"] = 5;
	return varDict;
}

function updateRendering(varDict){
	console.log(varDict)

	//Geometry
	fuselage = new Object();
	var mesh = new Mesh("cyl",fuselage,varDict["d"],varDict["fuse_len"])
	var position = new Position(fuselage,{x:varDict["fuse_len"]/2,y:0,z:0})
	var rotation = new Rotation(fuselage,{x:0,y:0,z:Math.PI/2})
	fuselage.geometry = new Geometry(mesh,position,rotation)
	drawCyl(ComponentColors.fuselage,fuselage.geometry.mesh,fuselage.geometry.position,fuselage.geometry.rotation)
	
	frontCap = new Object();
	var mesh = new Mesh("hemi",frontCap,varDict["d"])
	var position = new Position(frontCap,{x:fuselage.geometry.position.x.val + varDict["fuse_len"]*0.5,y:0,z:0})
	var rotation = new Rotation(frontCap,{x:0,y:0,z:-Math.PI/2})
	frontCap.geometry = new Geometry(mesh,position,rotation)
	drawHemi(ComponentColors.fuselage,frontCap.geometry.mesh,frontCap.geometry.position,frontCap.geometry.rotation)

	rearCap = new Object();
	var mesh = new Mesh("hemi",frontCap,varDict["d"])
	var position = new Position(frontCap,{x:fuselage.geometry.position.x.val-varDict["fuse_len"]*0.5,y:0,z:0})
	var rotation = new Rotation(frontCap,{x:0,y:0,z:Math.PI/2})
	frontCap.geometry = new Geometry(mesh,position,rotation)
	drawHemi(ComponentColors.fuselage,frontCap.geometry.mesh,frontCap.geometry.position,frontCap.geometry.rotation)

	
	wing = new Object();
	//syntax is span, aspect ratio, S
	var mesh = new Mesh("liftSurf",wing,varDict["b"],varDict["S"],varDict["lambda"])
	var position = new Position(wing,{x:fuselage.geometry.position.x.val,y:0,z:fuselage.geometry.mesh.d.val/2}) 
	var rotation = fuselage.geometry.rotation
	wing.geometry = new Geometry(mesh,position,rotation)
	drawWing(ComponentColors.wing,wing.geometry.mesh,wing.geometry.position,wing.geometry.rotation)

	//Draw tails -1 is left when viewed from rear, +1 is right
	for (var i = -1; i < 2; i = i+2){
		boom = new Object();
		var mesh = new Mesh("cyl",boom,varDict["L"]/varDict["tailBoomAR"],varDict["L"])
		var position = new Position(boom,{x:varDict["fuse_len"]/2+varDict["L"]/2,y:i*varDict["t_sep/d"]*varDict["d"]*0.5,z:fuselage.geometry.mesh.d.val/2})
		var rotation = fuselage.geometry.rotation;
		boom.geometry = new Geometry(mesh,position,rotation)
		drawCyl(ComponentColors.fuselage,mesh,position,rotation)

		horiz = new Object();
		var mesh = new Mesh("liftSurf",horiz,varDict["b_h"],varDict["S_h"],varDict["lambda_h"])
		var position = new Position(horiz,{x:boom.geometry.position.x.val+boom.geometry.mesh.h.val/2,y:boom.geometry.position.y.val,z:boom.geometry.position.z.val})
		var rotation = fuselage.geometry.rotation;
		horiz.geometry = new Geometry(mesh,position,rotation)
		drawWing(ComponentColors.stabilizer,mesh,position,rotation);

		vert = new Object();
		var mesh = new Mesh("liftSurf",vert,varDict["b_v"],varDict["S_v"],varDict["lambda_v"])
		var position = new Position(vert,{x:boom.geometry.position.x.val+boom.geometry.mesh.h.val/2,y:boom.geometry.position.y.val,z:boom.geometry.position.z.val+mesh.b.val/2})
		var rotation = new Rotation(vert,{x:Math.PI/2,y:0,z:Math.PI/2})
		horiz.geometry = new Geometry(mesh,position,rotation)
		drawWing(ComponentColors.stabilizer,mesh,position,rotation);

	}
	// prop = new Object();
	// var mesh = new Mesh("prop",prop,varDict["d_prop"],varDict["shaft_len"])
	// var position = new Position(prop,{x:boom.geometry.position.x.val+boom.geometry.mesh.h.val/2,y:boom.geometry.position.y.val,z:boom.geometry.position.z.val})
	// var rotation = new Rotation(prop,{x:Math.PI/2,y:0,z:Math.PI/2})
	// horiz.geometry = new Geometry(mesh,position,rotation)
	// drawWing(ComponentColors.stabilizer,mesh,position,rotation);

	// 	varDict["S"] = 10;
	// varDict["b"] = 10;
	// varDict["l_{fuel}"] = 3;
	// varDict["d"] = 4;
	// varDict["L"] = 10; //gonna guess this is fuselage length
	// varDict["S_h"] = 3;
	// varDict["S_v"] = 4;
	// varDict["b_h"] = 4;
	// varDict["b_v"] = 5;
	// varDict["lambda"] = 0.5;
	// varDict["t_sep/d"] = 3;
	// varDict["fuse_len"] = 10;
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
	console.log(this)
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
		// constraints.push.apply(constraints,this.mesh.getConstraints())
		// console.log(this.matesArr)
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
	return mesh;
}

drawHemi = function(color,mesh,position,rotation){
	//Make spinner
	var geometry = new THREE.SphereGeometry( mesh.d.val*0.5, 100, 100, 2*Math.PI, 2*Math.PI, 3*Math.PI/2);
	var material = new THREE.MeshBasicMaterial( { color: color, wireframe:false} );
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(position.x.val,position.y.val,position.z.val)
	mesh.rotation.set(rotation.x.val,rotation.y.val,rotation.z.val)
	console.log(mesh)
	mesh.material.side = THREE.DoubleSide;
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	geometry.dynamic = true
	scene.add( mesh );
}

drawWing = function(color,mesh,position,rotation){
	halfSpan = mesh.b.val/2
	midChord = mesh.S.val/Math.pow(mesh.b.val,1)
	tipHalfChord = midChord/(mesh.lambda.val)
	rootHalfChord = midChord*(mesh.lambda.val)

	var extrudeSettings = {
				curveSegments	: 100,
				steps			: 200,
				bevelEnabled	: false,
				// bevelEnabled	: true,
				// bevelThickness	: 0.0,
				amount			: rootHalfChord*0.2
	};
	
	var pts = 
                [
                 new THREE.Vector2(halfSpan,tipHalfChord),
                 new THREE.Vector2(halfSpan,-tipHalfChord),
                 new THREE.Vector2(0,-rootHalfChord),
                 new THREE.Vector2(-halfSpan,-tipHalfChord),
                 new THREE.Vector2(-halfSpan,tipHalfChord),
                 new THREE.Vector2(0,rootHalfChord)
                 // new THREE.Vector2(halfSpan,tipHalfChord)
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
	
	// //Make blade
	// for(var j=0; j<2;j++){
	// 	bladeRect = drawBoxOld(ComponentColors.propellers,chord,diameter/2,thickness)
		
	// 	if(j==0){
	// 		flp=-1;
	// 	}
	// 	else{
	// 		flp =1;
	// 	}
	// 	bladeRect.rotateY(Math.radians(flp*aoa))
	// 	bladeRect.position.set(propShaft.position.x,propShaft.position.y+flp*diameter/4,propShaft.position.z+shaftLen/2);
	// 	scene.add( bladeRect );

	// }
	// //Make spinner
	// var geometry = new THREE.SphereGeometry( shaftRadius*1.5, 10, 10, Math.PI, Math.PI, 3*Math.PI/2);
	// var material = new THREE.MeshPhongMaterial( { color: ComponentColors.propellers} );
	// spinnerHemi = new THREE.Mesh( geometry, material );
	// spinnerHemi.material.side = THREE.DoubleSide;
	// spinnerHemi.rotateX(Math.radians(90))
	// spinnerHemi.position.set(propShaft.position.x,propShaft.position.y,propShaft.position.z+shaftLen*0.5)
	// scene.add( spinnerHemi );


}

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

$(document).ready(function(){
	
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
	updateRendering(getDummyDict());

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