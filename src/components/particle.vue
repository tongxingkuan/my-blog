<template>
  <div class="particle" id="particle" ref="particleRef"></div>
</template>
<script setup lang="js">
import {
    WebGLRenderer, //渲染器
    Scene, //场景
    PerspectiveCamera, //相机
    BufferGeometry, //材质
    BufferAttribute,
    Points,
    ShaderMaterial, //球体 全景用
    Color, //加载器  内部使用ImageLoader来加载文件
} from "three";

const particleRef = ref(null);
const loading = ref(true); // 加载标志

const props = defineProps({
  amountX: Number,
  amountY: Number
}); // 参数

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const scene = new Scene(); //场景

const mouseX = ref(0);
const windowHalfX = ref(SCREEN_WIDTH / 2);
const count = ref(0);

const camera = new PerspectiveCamera(
  75, //摄像机视锥体垂直视野角度
  SCREEN_WIDTH / SCREEN_HEIGHT, //摄像机视锥体长宽比
  1, //摄像机视锥体近端面
  10000 //摄像机视锥体远端面
);
camera.position.z = 1000;

const total = props.amountX * props.amountY;
const positions = new Float32Array(total * 3);
const scales = new Float32Array(total);
const SEPARATION = 100;
let i = 0, j = 0;
for (let ix = 0; ix < props.amountX; ix++) {
  for (let iy = 0; iy < props.amountY; iy++) {
    positions[i] = ix * SEPARATION - (props.amountX * SEPARATION) / 2;
    positions[i + 1] = 0;
    positions[i + 2] = iy * SEPARATION - (props.amountY * SEPARATION) / 2;
    scales[j] = 1;
    i += 3;
    j++;
  }
}

const geometry = new BufferGeometry()
geometry.setAttribute('position', new BufferAttribute(positions, 3))
geometry.setAttribute('scale', new BufferAttribute(scales, 1))

// 初始化粒子材质
const material = new ShaderMaterial({
  uniforms: {
    color: { value: new Color(0x11b9c8) }
  },
  vertexShader: `
    attribute float scale;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4( position, 2.0 );
      gl_PointSize = scale * ( 300.0 / - mvPosition.z );
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    void main() {
      if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
      gl_FragColor = vec4( color, 1.0 );
    }
  `
});

const particles = new Points(geometry, material);
scene.add(particles);

const renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearAlpha(0)

const onWindowResize = () => {
  windowHalfX.value = window.innerWidth / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

const onDocumentMouseMove = (event) => {
  mouseX.value = event.clientX - windowHalfX.value;
};

const onDocumentTouchStart = (event) => {
  if (event.touches.length === 1) {
    mouseX.value = event.touches[0].pageX - windowHalfX.value;
  }
};

const onDocumentTouchMove = (event) => {
  if (event.touches.length === 1) {
    event.preventDefault();
    mouseX.value = event.touches[0].pageX - windowHalfX.value;
  }
};

// 执行动画
const animate = () => {
  requestAnimationFrame(animate);
  render();
}

const render = () => {
  camera.position.x += (mouseX.value - camera.position.x) * 0.05;
  camera.position.y = 400;
  camera.lookAt(scene.position);
  const positions = particles.geometry.attributes.position.array;
  const scales = particles.geometry.attributes.scale.array;
  // 计算粒子位置及大小
  let i = 0
  let j = 0
  for (let ix = 0; ix < props.amountX; ix++) {
    for (let iy = 0; iy < props.amountY; iy++) {
      positions[i + 1] = (Math.sin((ix + count.value) * 0.3) * 100) + (Math.sin((iy + count.value) * 0.5) * 100)
      scales[j] = (Math.sin((ix + count.value) * 0.3) + 1) * 8 + (Math.sin((iy + count.value) * 0.5) + 1) * 8
      i += 3
      j++
    }
  }
  // 重新渲染粒子
  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.attributes.scale.needsUpdate = true;
  renderer.render(scene, camera);
  count.value += 0.1;
}

window.addEventListener('resize', onWindowResize, { passive: false })
document.addEventListener('mousemove', onDocumentMouseMove, { passive: false })
document.addEventListener('touchstart', onDocumentTouchStart, { passive: false })
document.addEventListener('touchmove', onDocumentTouchMove, { passive: false })

onMounted(() => {
  loading.value = false;
});

watch(loading, (e) => {
  if (!e) {
    particleRef.value?.append(renderer.domElement);
    animate();
  }
});
</script>
<style lang="less" scoped>
.particle {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: -1;
}
</style>