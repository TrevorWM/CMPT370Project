class Game {
    constructor(state) {
        this.state = state;
        this.spawnedObjects = [];
        this.collidableObjects = [];
    }

    /* CUSTOM METHODS */
    handleEnemyMovement(deltaTime)
    {
        let speed = 3;
        let translation = vec3.create();

        vec3.normalize(translation, translation);
        vec3.scale(translation, this.enemy.movementVector, deltaTime * speed);
        

        let nextPosition = vec3.create();
        nextPosition = vec3.add(nextPosition, this.enemy.model.position, translation);

        if (this.checkIfMoveValid(this.enemy, nextPosition))
        {
            this.enemy.translate(translation);
        } 
        else
        {
            this.enemy.movementVector = this.getRandomDirectionVector();
        }
    
    }

    getRandomDirectionVector()
    {
        let xDirection = this.getRandomDirectionValue();
        let zDirection = this.getRandomDirectionValue();

        if (xDirection == 0 && zDirection == 0)
        {
            return this.getRandomDirectionVector();
        }

        return vec3.fromValues(xDirection, 0, zDirection);

    }

    getRandomDirectionValue()
    {
        let value = Math.random();

        if (value < 0.33)
        {
            value = -1;
        } 
        else if (value > 0.66)
        {
            value = 1;
        } 
        else 
        {
            value = 0;
        }

        return value;
    }

    handlePlayerMovement(deltaTime)
    {
        let speed = 5;
        let translation = vec3.fromValues(0,0,0);

        if (this.player.movementType == 3)
        {
            translation = this.getThirdPersonPlayerDirection();
        }

        vec3.normalize(translation, translation);
        vec3.scale(translation, translation, deltaTime * speed);
        

        let nextPosition = vec3.create();
        nextPosition = vec3.add(nextPosition, this.player.model.position, translation);

        if (this.checkIfMoveValid(this.player, nextPosition)){
            this.player.translate(translation);
        }
        
    }

    getThirdPersonPlayerDirection()
    {
        let temp = vec3.create();

        if (state.keyboard.w){
            vec3.add(temp, temp, vec3.fromValues(1,0,0));
            
        }
        
        if (state.keyboard.a) {
            vec3.add(temp, temp, vec3.fromValues(0,0,-1));

        }
        
        if (state.keyboard.s) {
            vec3.add(temp, temp, vec3.fromValues(-1,0,0));

        }
        
        if (this.state.keyboard.d){
            vec3.add(temp, temp, vec3.fromValues(0,0,1));
        }

        return temp;
    }

    checkIfMoveValid(object, newPosition)
    {
        let dummy = {
            name: object.name,
            model: {
                position: newPosition,
                scale: object.model.scale,
            },
            centroid: object.centroid,
            collider: object.collider,
        };

        this.checkCollisionForSphereColliders(dummy);

        object.colliding = dummy.colliding;

        return !object.colliding;
    }


    checkIfSphereColliding(object, other)
    {
        let distanceVector = vec3.distance(object.model.position, other.model.position);
        return distanceVector < object.collider.radius;
    }

    checkIfBoxColliding(object, other)
    {
        this.setBoxColliderCoordinates(other);

        const x = Math.max(other.collider.dimensions.xMin, Math.min(object.model.position[0], other.collider.dimensions.xMax));
        const y = Math.max(other.collider.dimensions.yMin, Math.min(object.model.position[1], other.collider.dimensions.yMax));
        const z = Math.max(other.collider.dimensions.zMin, Math.min(object.model.position[2], other.collider.dimensions.zMax));
        
        let distance = vec3.distance(vec3.fromValues(x,y,z), object.model.position);

        return distance < object.collider.radius;
    }

    // example - create a collider on our object with various fields we might need (you will likely need to add/remove/edit how this works)
     createSphereCollider(object, radius, onCollide = null) {
         object.collider = {
            type: "SPHERE",
            radius: radius,
            onCollide: onCollide ? onCollide : (otherObject) => {
                //console.log(`Collided with ${otherObject.name}`);
            },
         };
         this.collidableObjects.push(object);
     }

     createBoxCollider(object, onCollide = null)
     {
        object.collider = {
            type: "BOX",
            dimensions: {
                xMin: 0,
                xMax: 0,
                yMin: 0,
                yMax: 0,
                zMin: 0,
                zMax: 0,
            },
            onCollide: onCollide ? onCollide : (otherObject) =>
            {
                //console.log(`I was hit by: ${otherObject}`);
            },
        };
        this.collidableObjects.push(object);
     }

     setBoxColliderCoordinates(object)
     {
        let x1 = object.model.position[0] - object.centroid[0] * object.model.scale[0];
        let x2 = object.model.position[0] + object.centroid[0] * object.model.scale[0];

        let y1 = object.model.position[1] - object.centroid[1] * object.model.scale[1];
        let y2 = object.model.position[1] + object.centroid[1] * object.model.scale[1];

        let z1 = object.model.position[2] - object.centroid[2] * object.model.scale[2];
        let z2 = object.model.position[2] + object.centroid[2] * object.model.scale[2];

        object.collider.dimensions.xMin = Math.min(x1,x2);
        object.collider.dimensions.xMax = Math.max(x1,x2);
        object.collider.dimensions.yMin = Math.min(y1,y2);
        object.collider.dimensions.yMax = Math.max(y1,y2);
        object.collider.dimensions.zMin = Math.min(z1,z2);
        object.collider.dimensions.zMax = Math.max(z1,z2);
     }

    // example - function to check if an object is colliding with collidable objects
     checkCollisionForSphereColliders(object) {
         
         this.collidableObjects.forEach( (otherObject) => {
            
            if (otherObject.name != object.name){
                
                switch(otherObject.collider.type)
                {   
                    case "SPHERE":
                        if(this.checkIfSphereColliding(object, otherObject))
                        {
                            object.collider.onCollide(otherObject);
                            object.colliding = true;
                        }
                        break;
                    
                    case "BOX":
                        if(this.checkIfBoxColliding(object, otherObject))
                        {
                            object.collider.onCollide(otherObject);
                            object.colliding = true;
                        }
                        break;

                    default:
                        object.colliding = false;
                        break;
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
        this.player.movementType = 3;
        this.wall1 = getObject(this.state, "Wall");
        this.enemy = getObject(this.state, "Enemy");
        this.enemy.movementVector = vec3.fromValues(1,0,0);
        //this.enemy.colliding = false;
        // example - create sphere colliders on our two objects as an example, we give 2 objects colliders otherwise
        // no collision can happen
        this.createSphereCollider(this.player, 0.5);
        this.createSphereCollider(this.enemy, 0.5, (otherObject) =>{
            if(otherObject.name == "Player")
            {
                console.log("GAME OVER");
            }
        });
        this.createBoxCollider(this.wall1);
        
        // calling our custom method! (we could put spawning logic, collision logic etc in there ;) )

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
        
        this.handlePlayerMovement(deltaTime);

        this.handleEnemyMovement(deltaTime);
        //console.log(this.player.model.position);
        // TODO - Here we can add game logic, like moving game objects, detecting collisions, you name it. Examples of functions can be found in sceneFunctions

        // example: Rotate a single object we defined in our start method
        // this.cube.rotate('x', deltaTime * 0.5);

        // example: Rotate all objects in the scene marked with a flag
        

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
        //     this.checkCollisionForSphere(object);
        // }); 
    }
}
