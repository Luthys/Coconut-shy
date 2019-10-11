module BABYLON {
    export interface IChan {
        run(): void;
    }

    export class Chan implements IChan {
        public engine: Engine;
        public scene: Scene;
        public camera: FreeCamera;
        public cube: Mesh;
        public ground: Mesh;
        public size: number
        public ball: Mesh;
        publuc alreadyClicked: boolean

        /**
         * Constructor.
         * @param _canvas the canvas where to draw the scene
         */
        public constructor(private _canvas: HTMLCanvasElement) {
            this.size = 10;
            this.alreadyClicked = false;

            this._init();
            this._initLights();
            this._initGeometries();
            this._initPhysics();
            this._initInteractions();

        }

        public assign<T extends any, U extends any>(target: T, source: U): T & U {
            for (const key in source) {
                target[key] = source[key];
            }

            return target as T & U;
        }

        /**
         * Runs the interactions game.
         */
        public run(): void {
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        }

        /**
         * Inits the interactions.
         */
        private _init(): void {
            this.engine = new Engine(this._canvas);
            this.scene = new Scene(this.engine);

            this.camera = new FreeCamera('freeCamera', new Vector3(15, 15, 15), this.scene);
            this.camera.attachControl(this._canvas);
            this.camera.position.y = 100
            this.camera.ellipsoid.y = 10
            this.camera.maxZ = 100000;
            this.camera.checkCollisions = true;
            this.camera.applyGravity = true;
            console.log(this.camera)
        }

        private _initLights(): void {
            const light = new PointLight('pointLight', new Vector3(15, 15, 15), this.scene);
        }

        private _initGeometries(): void {
            this.ground = Mesh.CreateGround('ground', 512, 512, 1, this.scene);
            this.ground.isPickable = true;
            this.ground.checkCollisions = true;

            this.cube = Mesh.CreateBox('box', 10, this.scene);
            this.cube.position.y = -10;
            this.cube.isPickable = true;
            this.cube.checkCollisions = true
            const cubeSize = 10;
            const pos = new Vector3(0, -cubeSize/2, 0)
            for(let i = 0; i < this.size; i++) {
                pos.x += cubeSize / 4 * 3;
                pos.y += cubeSize;
                for(let j = 0; j < this.size - i; j++) {
                    const inst = this.cube.createInstance(i.toString());
                    inst.position.set((pos.x + j * cubeSize), pos.y, pos.z);
                    pos.x += cubeSize / 2;
                }
                pos.x -= (this.size - i) * cubeSize / 2
            }
            
            
            
            this.ball = Mesh.CreateSphere("sphere", 40, 20, this.scene); 
            this.ball.position = new Vector3(100, 20, 150)
            this.ball.checkCollisions = true

            const std = new StandardMaterial('std', this.scene);
            std.diffuseTexture = new Texture('../assets/maki.jpg', this.scene);
            this.cube.material = std;

            this.camera.position = new Vector3(100, 5, 200)
            this.camera.setTarget(this.cube.instances[this.size/2].position);

            

            const skybox = Mesh.CreateBox('skybox', 500, this.scene);
            const skyboxMaterial = new StandardMaterial('skybox', this.scene);
            skyboxMaterial.disableLighting = true;
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new CubeTexture('../assets/TropicalSunnyDay', this.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
            skybox.material = skyboxMaterial;
            skybox.infiniteDistance = true;

//            std.reflectionTexture = new CubeTexture('../assets/TropicalSunnyDay', this.scene);
  //          std.reflectionTexture.coordinatesMode = Texture.INVCUBIC_MODE;
        }

        private _initPhysics(): void {
            this.scene.enablePhysics(new Vector3(0, -30, 0), new CannonJSPlugin());

            this.ground.physicsImpostor = new PhysicsImpostor(this.ground, PhysicsImpostor.BoxImpostor, {
                mass: 0
            });

            this.ball.physicsImpostor = new PhysicsImpostor(this.ball, PhysicsImpostor.BoxImpostor, {
                mass: 10
            });

            let instances = this.cube.instances
            for(let i = 0; i < instances.length; i++) {
                instances[i].physicsImpostor = new PhysicsImpostor(instances[i], PhysicsImpostor.BoxImpostor, {
                    mass: 5
                });
            }
        }

        private _initInteractions(): void {
            this.scene.onPointerObservable.add((data) => {
                if (data.type !== PointerEventTypes.POINTERUP)
                    return;
                
                if (data.pickInfo.pickedMesh === this.cube) {
                    this.cube.applyImpulse(data.pickInfo.ray.direction.multiplyByFloats(100, 100, 100), data.pickInfo.pickedPoint);
                }

                if (data.pickInfo.pickedMesh === this.ball && !this.alreadyClicked) {
                    this.alreadyClicked = true;
                    this.ball.applyImpulse(data.pickInfo.ray.direction.multiplyByFloats(2000, 2000, 2000), data.pickInfo.pickedPoint);
                }
            });
        }
    }
}
