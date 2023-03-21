class Game {
    constructor(state) {
        this.state = state;
        this.spawnedObjects = [];
        this.collidableObjects = [];
    }

    // example - we can add our own custom method to our game and call it using 'this.customMethod()'
    customMethod() {
        console.log("Custom method!");
    }

    checkIfMoveValid(object, newPosition)
    {
        let distanceCheck = object.collider.radius - 0.05;
        let distance;
        let closest;
        
        this.collidableObjects.forEach( (otherObject) => {
            
            if (otherObject != object)
            {
                distance = vec3.distance(newPosition, otherObject.model.position);
                
                if (closest == null || distance < closest)
                {
                    closest = distance;
                }
            }   
        });
        return closest > distanceCheck;
    }

    moveObject(object, translation)
    {
        let nextPosition = vec3.create();
        nextPosition = vec3.add(nextPosition, object.model.position, translation);
                    
        if (this.checkIfMoveValid(object, nextPosition)){
            object.translate(translation);
        }
    }

    checkIfSphereColliding(object, other)
    {
        let distanceVector = vec3.distance(object.model.position, other.model.position);
        return distanceVector < (object.collider.radius + other.collider.radius);
    }

    // example - create a collider on our object with various fields we might need (you will likely need to add/remove/edit how this works)
     createSphereCollider(object, radius, onCollide = null) {
         object.collider = {
            type: "SPHERE",
            radius: radius,
            onCollide: onCollide ? onCollide : (otherObject) => {
                console.log(`Collided with ${otherObject.name}`);
            },
         };
         this.collidableObjects.push(object);
     }

    // example - function to check if an object is colliding with collidable objects
     checkCollision(object) {
         // loop over all the other collidable objects 
         this.collidableObjects.forEach( (otherObject) => {
            // do a check to see if we have collided, if we have we can call object.onCollide(otherObject) which will
            // call the onCollide we define for that specific object. This way we can handle collisions identically for all
            // objects that can collide but they can do different things (ie. player colliding vs projectile colliding)
            // use the modeling transformation for object and otherObject to transform position into current location
            if (otherObject != object){
                if(this.checkIfSphereColliding(object, otherObject)){
                    object.collider.onCollide(otherObject);  
                } 
            }
        });

    }

    // runs once on startup after the scene loads the objects
    async onStart() {
        console.log("On start");

        // this just prevents the context menu from popping up when you right click
        document.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        }, false);

        // example - set an object in onStart before starting our render loop!
        this.player = getObject(this.state, "Player");
        this.wall1 = getObject(this.state, "Wall");
        // example - create sphere colliders on our two objects as an example, we give 2 objects colliders otherwise
        // no collision can happen
        this.createSphereCollider(this.player, 0.5);
        this.createSphereCollider(this.wall1, 0.5);

        
        // example - setting up a key press event to move an object in the scene
        document.addEventListener("keypress", (e) => {
            e.preventDefault();
            let translation = vec3.create();

            switch (e.key) {
                case "a":
                    translation = vec3.fromValues(0,0,-0.5);
                    this.moveObject(this.player, translation);
                    break;

                case "d":
                    translation = vec3.fromValues(0,0,0.5);
                    this.moveObject(this.player, translation);
                    break;

                case "w":
                    translation = vec3.fromValues(0.5,0,0);
                    this.moveObject(this.player, translation);
                    break;

                case "s":
                    translation = vec3.fromValues(-0.5,0,0);
                    this.moveObject(this.player, translation);
                    break;

                default:
                    break;
            }
        });

        this.customMethod(); // calling our custom method! (we could put spawning logic, collision logic etc in there ;) )

        // example: spawn some stuff before the scene starts
        // for (let i = 0; i < 10; i++) {
        //     for (let j = 0; j < 10; j++) {
        //         for (let k = 0; k < 10; k++) {
        //             spawnObject({
        //                 name: `new-Object${i}${j}${k}`,
        //                 type: "cube",
        //                 material: {
        //                     diffuse: randomVec3(0, 1)
        //                 },
        //                 position: vec3.fromValues(4 - i, 5 - j, 10 - k),
        //                 scale: vec3.fromValues(0.5, 0.5, 0.5)
        //             }, this.state);
        //         }
        //     }
        // }

        // for (let i = 0; i < 10; i++) {
        //     let tempObject = await spawnObject({
        //         name: `new-Object${i}`,
        //         type: "cube",
        //         material: {
        //             diffuse: randomVec3(0, 1)
        //         },
        //         position: vec3.fromValues(4 - i, 0, 0),
        //         scale: vec3.fromValues(0.5, 0.5, 0.5)
        //     }, this.state);


        // tempObject.constantRotate = true; // lets add a flag so we can access it later
        // this.spawnedObjects.push(tempObject); // add these to a spawned objects list

        // this.cube.collidable = true;
        // this.cube.onCollide = (object) => { // we can also set a function on an object without defining the function before hand!
        //     console.log(`I collided with ${object.name}!`);
        // };
    }

    // Runs once every frame non stop after the scene loads
    onUpdate(deltaTime) {
        // TODO - Here we can add game logic, like moving game objects, detecting collisions, you name it. Examples of functions can be found in sceneFunctions

        // example: Rotate a single object we defined in our start method
        // this.cube.rotate('x', deltaTime * 0.5);

        // example: Rotate all objects in the scene marked with a flag
        this.state.objects.forEach((object) => {
             if (object.name == "Cube") {
                 object.rotate('x', deltaTime * 0.5);
             }
         });

        // simulate a collision between the first spawned object and 'cube' 
        // if (this.spawnedObjects[0].collidable) {
        //     this.spawnedObjects[0].onCollide(this.cube);
        // }

        // example: Rotate all the 'spawned' objects in the scene
        // this.spawnedObjects.forEach((object) => {
        //     object.rotate('y', deltaTime * 0.5);
        // });


        //example - call our collision check method on our cube
        // this.collidableObjects.forEach( (object) => {
        //     this.checkCollision(object);
        // }); 
    }
}
