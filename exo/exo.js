var BABYLON;
(function (BABYLON) {
    var Chan = /** @class */ (function () {
        /**
         * Constructor.
         * @param _canvas the canvas where to draw the scene
         */
        function Chan(_canvas) {
            this._canvas = _canvas;
            this.size = 10;
            this.alreadyClicked = false;
            this._init();
            this._initLights();
            this._initGeometries();
            this._initPhysics();
            this._initInteractions();
        }
        Chan.prototype.assign = function (target, source) {
            for (var key in source) {
                target[key] = source[key];
            }
            return target;
        };
        /**
         * Runs the interactions game.
         */
        Chan.prototype.run = function () {
            var _this = this;
            this.engine.runRenderLoop(function () {
                _this.scene.render();
            });
        };
        /**
         * Inits the interactions.
         */
        Chan.prototype._init = function () {
            this.engine = new BABYLON.Engine(this._canvas);
            this.scene = new BABYLON.Scene(this.engine);
            this.camera = new BABYLON.FreeCamera('freeCamera', new BABYLON.Vector3(15, 15, 15), this.scene);
            this.camera.attachControl(this._canvas);
        };
        Chan.prototype._initLights = function () {
            var light = new BABYLON.PointLight('pointLight', new BABYLON.Vector3(15, 15, 15), this.scene);
        };
        Chan.prototype._initGeometries = function () {
            this.ground = BABYLON.Mesh.CreateGround('ground', 512, 512, 1, this.scene);
            this.ground.isPickable = true;
            this.cube = BABYLON.Mesh.CreateBox('box', 10, this.scene);
            this.cube.position.y = -10;
            this.cube.isPickable = true;
            var cubeSize = 10;
            var pos = new BABYLON.Vector3(0, -cubeSize / 2, 0);
            for (var i = 0; i < this.size; i++) {
                pos.x += cubeSize / 4 * 3;
                pos.y += cubeSize;
                for (var j = 0; j < this.size - i; j++) {
                    var inst = this.cube.createInstance(i.toString());
                    inst.position.set((pos.x + j * cubeSize), pos.y, pos.z);
                    pos.x += cubeSize / 2;
                }
                pos.x -= (this.size - i) * cubeSize / 2;
            }
            this.ball = BABYLON.Mesh.CreateSphere("sphere", 40, 20, this.scene);
            this.ball.position = new BABYLON.Vector3(100, 20, 150);
            var std = new BABYLON.StandardMaterial('std', this.scene);
            std.diffuseTexture = new BABYLON.Texture('../assets/maki.jpg', this.scene);
            this.cube.material = std;
            this.camera.position = new BABYLON.Vector3(100, 5, 200);
            this.camera.setTarget(this.cube.instances[this.size / 2].position);
            var skybox = BABYLON.Mesh.CreateBox('skybox', 500, this.scene);
            var skyboxMaterial = new BABYLON.StandardMaterial('skybox', this.scene);
            skyboxMaterial.disableLighting = true;
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('../assets/TropicalSunnyDay', this.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skybox.material = skyboxMaterial;
            skybox.infiniteDistance = true;
            //            std.reflectionTexture = new CubeTexture('../assets/TropicalSunnyDay', this.scene);
            //          std.reflectionTexture.coordinatesMode = Texture.INVCUBIC_MODE;
        };
        Chan.prototype._initPhysics = function () {
            this.scene.enablePhysics(new BABYLON.Vector3(0, -20, 0), new BABYLON.CannonJSPlugin());
            this.ground.physicsImpostor = new BABYLON.PhysicsImpostor(this.ground, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 0
            });
            this.ball.physicsImpostor = new BABYLON.PhysicsImpostor(this.ball, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 10
            });
            var instances = this.cube.instances;
            for (var i = 0; i < instances.length; i++) {
                instances[i].physicsImpostor = new BABYLON.PhysicsImpostor(instances[i], BABYLON.PhysicsImpostor.BoxImpostor, {
                    mass: 3
                });
            }
        };
        Chan.prototype._initInteractions = function () {
            var _this = this;
            this.scene.onPointerObservable.add(function (data) {
                if (data.type !== BABYLON.PointerEventTypes.POINTERUP)
                    return;
                if (data.pickInfo.pickedMesh === _this.cube) {
                    _this.cube.applyImpulse(data.pickInfo.ray.direction.multiplyByFloats(100, 100, 100), data.pickInfo.pickedPoint);
                }
                if (data.pickInfo.pickedMesh === _this.ball && !_this.alreadyClicked) {
                    _this.alreadyClicked = true;
                    _this.ball.applyImpulse(data.pickInfo.ray.direction.multiplyByFloats(1200, 1200, 1200), data.pickInfo.pickedPoint);
                }
            });
        };
        return Chan;
    }());
    BABYLON.Chan = Chan;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=exo.js.map