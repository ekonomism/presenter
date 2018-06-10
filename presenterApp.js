// JavaScript File
"use strict";

//  presenterApp.js
//
//  Created by Mattias Lundbäck on May 28 2018.
//  Copyright 2018 Ekonomismus AB.
// 
//  
(function() {
	// Identitet presentation och kontroll
	var idPres=0;
	var idKontroll=0;
   // Flagga för om presentation är uppe
   var flagga=0;
	// Presenter
	var APP_NAME = "PRESENTER";
	// Link to HTML file
	var APP_URL = Script.resolvePath("index.html");
	// Path to icon
   var APP_ICON = Script.resolvePath("projektor.png");
   // Get a reference to the tablet 
	var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
	// The following lines create a button on the tablet's menu screen
	var button = tablet.addButton({
        icon: APP_ICON,
        text: APP_NAME
    });
    // Default username and presentation
    var susername = "ekonomism";
    var spresentation = "test";
    // Default adress for presentation
    var adress = "https://slides.com/" + susername +"/" + spresentation + "/live";
	 // Show kontrollpanel for presenter
	 function onClicked() {
		tablet.gotoWebScreen(APP_URL);
	 }
    button.clicked.connect(onClicked);
    
    // Position for presentation
    function getPositionPresentation() {
    	var direction = Quat.getFront(MyAvatar.orientation);
    	var distance = -1.5;
    	var offsetfromground = 1.8;
    	var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
    	position.y += offsetfromground;
    	return position;
    }
 
    // Position for kontrollpanel
    function getPositionKontroll() {
    	var direction = Quat.getFront(MyAvatar.orientation);
    	var distance = 1;
    	var offsetfromavatar = 0.5;
    	var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
    	position.y += offsetfromavatar;
    	return position;
    }
  
    // Handle the events we're recieving from the web UI
    function onWebEventReceived(event) {
    	print("presenterApp.js received a web event:" + event);
        // Converts the event to a JavasScript Object
    	if (typeof event === "string") {
            event = JSON.parse(event);
        } 
        
        if (event.type === "click") {

        	if (event.data  === "open") {
        	       susername = event.anvandare;
        	       spresentation = event.presentation;
        	       print("variabler ..." + susername + spresentation + flagga);
        	       // Presentation
        	       adress = "https://slides.com/" + susername + "/" + spresentation + "/live";
        	       if (flagga === 1) {
        	       	// Ändra presentation
                	var success = Entities.editEntity(idPres, {
                    "sourceUrl": adress
                  });
                } else { 
                  // Skapa presentation
        	         var properties = {
        		        "type": "Web",
        		        "position": getPositionPresentation(),
        		        "sourceUrl": adress
        	         }; 
                  properties.name = "Presentation";
                  properties.dimensions = {
                    "x": 4.5,
                    "y": 3,
                    "z": 0.2
                  };
                  var rotation = Quat.fromPitchYawRollDegrees(0, 180, 0 );
                  properties.rotation = Quat.multiply(MyAvatar.orientation, rotation);
                  idPres=Entities.addEntity(properties);
                }
                // Overlay
                adress = "https://slides.com/" + susername + "/" + spresentation + "/speaker";
                if (flagga === 1) {
                	// Ändra overlay
                	var success = Overlays.editOverlay(idKontroll, {
                    url: adress
                  });
                } else { 
                  // Skapa overlay
                  idKontroll = Overlays.addOverlay("web3d", {
                    position: getPositionKontroll(),
                    rotation: MyAvatar.orientation,
                    dimensions: { x: 0.75, y: 0.5, z: 0.2 },
                    solid: true,
                    grabbable: true,
                    url: adress
                  });
                  flagga=1;   
                  }      
            // Delete presentation
        	 } else if (event.data  === "close") {
                print("Deleting presentation ...");
                if (flagga===1) {
                   Entities.deleteEntity(idPres);
                }    
                print("Deleting kontrollpanel ...");
                if (flagga===1) {
                  Overlays.deleteOverlay(idKontroll);
                }   
                flagga=0;
            // Decrease size of presentation
        	 } else if (event.data  === "decrease") {
        	 	  if (flagga===1) {
                var decreaseEntityProperties = Entities.getEntityProperties(idPres);
                var pos = decreaseEntityProperties.position;
                var dimensioner = decreaseEntityProperties.dimensions;
                pos.y = (pos.y-0.5*dimensioner.y)+0.5*0.85*dimensioner.y;
                var propertiesToChange = {
                  dimensions: Vec3.multiply(decreaseEntityProperties.dimensions, 0.85), position: pos
                };
                Entities.editEntity(idPres, propertiesToChange);
              }   
            // Increase size of presentation
          } else if (event.data  === "increase") {
          	  if (flagga===1) {
                var increaseEntityProperties = Entities.getEntityProperties(idPres);
                var pos = increaseEntityProperties.position;
                var dimensioner = increaseEntityProperties.dimensions;
                pos.y = (pos.y-0.5*dimensioner.y)+0.5*1.2*dimensioner.y;
                var propertiesToChange = {
                  dimensions: Vec3.multiply(increaseEntityProperties.dimensions, 1.2), position: pos
                };
                Entities.editEntity(idPres, propertiesToChange);
              }
        	 }
        }  
    }
    tablet.webEventReceived.connect(onWebEventReceived);
	// Provide a way to "uninstall" the app
	// Here, we write a function called "cleanup" which gets executed when
	// this script stops running. It'll remove the app button from the tablet.
	function cleanup() {
        tablet.removeButton(button);
	}
    Script.scriptEnding.connect(cleanup);
}()); 