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
            var that = this;
            BABYLON.SceneLoader.Append("/assets/", "badboy.babylon", this.scene, function (scene) {
                that.badboy = scene.meshes.forEach(function (element) {
                    if (element.name == "badboy") {
                        that.scene = scene;
                        that._createProjectile(false);
                    }
                });
            });
            this.camera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(15, 15, 15), this.scene);
            this.camera.attachControl(this._canvas);
        };
        Chan.prototype._initLights = function () {
            var light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(100, 100, 150), this.scene);
        };
        Chan.prototype._initGeometries = function () {
            this.ground = BABYLON.Mesh.CreateGround("ground", 512, 512, 1, this.scene);
            this.ground.isPickable = true;
            this.ground.checkCollisions = true;
            this._createPyramid();
            this._createSkybox();
            this._setCamera();
            //            std.reflectionTexture = new CubeTexture('../assets/TropicalSunnyDay', this.scene);
            //          std.reflectionTexture.coordinatesMode = Texture.INVCUBIC_MODE;
        };
        Chan.prototype._createProjectile = function (respawn) {
            var y = 20;
            if (respawn)
                y = 50;
            console.log("A", this.badboy);
            this.badboy.scaling = new BABYLON.Vector3(5, 5, 5);
            this.badboy.position = new BABYLON.Vector3(100, y, 150);
            this.badboy.checkCollisions = true;
            var std = new BABYLON.StandardMaterial("std", this.scene);
            std.diffuseTexture = new BABYLON.Texture("../assets/leave.jpg", this.scene);
            std.reflectionTexture = new BABYLON.CubeTexture("../assets/leave.jpg", this.scene);
            this.badboy.material = std;
            console.log("Z");
            this._initPhysics();
            this._initInteractions();
        };
        Chan.prototype._createPyramid = function () {
            this.cube = BABYLON.Mesh.CreateBox("box", 10, this.scene);
            this.cube.position.y = -10;
            this.cube.isPickable = true;
            this.cube.checkCollisions = true;
            var cubeSize = 10;
            var pos = new BABYLON.Vector3(0, -cubeSize / 2, 0);
            for (var i = 0; i < this.size; i++) {
                pos.x += (cubeSize / 4) * 3;
                pos.y += cubeSize;
                for (var j = 0; j < this.size - i; j++) {
                    var inst = this.cube.createInstance(i.toString());
                    inst.position.set(pos.x + j * cubeSize, pos.y, pos.z);
                    pos.x += cubeSize / 2;
                }
                pos.x -= ((this.size - i) * cubeSize) / 2;
            }
            var std = new BABYLON.StandardMaterial("std", this.scene);
            std.diffuseTexture = new BABYLON.Texture("../assets/maki.jpg", this.scene);
            this.cube.material = std;
        };
        Chan.prototype._createSkybox = function () {
            var skybox = BABYLON.Mesh.CreateBox("skybox", 500, this.scene);
            var skyboxMaterial = new BABYLON.StandardMaterial("skybox", this.scene);
            skyboxMaterial.disableLighting = true;
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../assets/TropicalSunnyDay", this.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            skybox.material = skyboxMaterial;
            skybox.infiniteDistance = true;
        };
        Chan.prototype._setCamera = function () {
            this.camera.position.y = 100;
            this.camera.ellipsoid.y = 10;
            this.camera.maxZ = 10000;
            this.camera.checkCollisions = true;
            this.camera.applyGravity = true;
            this.camera.position = new BABYLON.Vector3(100, 5, 200);
            this.camera.setTarget(this.cube.instances[this.size / 2].position);
        };
        Chan.prototype._initPhysics = function () {
            this.scene.enablePhysics(new BABYLON.Vector3(0, -30, 0), new BABYLON.CannonJSPlugin());
            this.ground.physicsImpostor = new BABYLON.PhysicsImpostor(this.ground, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 0
            });
            this.badboy.physicsImpostor = new BABYLON.PhysicsImpostor(this.badboy, BABYLON.PhysicsImpostor.BoxImpostor, {
                mass: 10
            });
            var instances = this.cube.instances;
            for (var i = 0; i < instances.length; i++) {
                instances[i].physicsImpostor = new BABYLON.PhysicsImpostor(instances[i], BABYLON.PhysicsImpostor.BoxImpostor, {
                    mass: 5
                });
            }
        };
        Chan.prototype._initInteractions = function () {
            var _this = this;
            console.log("alal");
            this.scene.onPointerObservable.add(function (data) {
                if (data.type !== BABYLON.PointerEventTypes.POINTERUP)
                    return;
                if (data.pickInfo.pickedMesh === _this.cube) {
                    _this.cube.applyImpulse(data.pickInfo.ray.direction.multiplyByFloats(100, 100, 100), data.pickInfo.pickedPoint);
                }
                console.log(_this);
                if (data.pickInfo.pickedMesh === _this.badboy && !_this.alreadyClicked) {
                    _this.alreadyClicked = true;
                    console.log("ici");
                    _this.badboy.applyImpulse(data.pickInfo.ray.direction.multiplyByFloats(2000, 2000, 2000), data.pickInfo.pickedPoint);
                }
            });
        };
        return Chan;
    }());
    BABYLON.Chan = Chan;
})(BABYLON || (BABYLON = {}));
//# sourceMappingURL=exo.js.map