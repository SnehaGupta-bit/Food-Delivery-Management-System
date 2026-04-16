import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box as ThreeBox } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import * as THREE from 'three';

// Floating Revenue Orb
const RevenueOrb = ({ position }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.8, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <meshStandardMaterial
          color={hovered ? '#a78bfa' : '#8b5cf6'}
          emissive={hovered ? '#8b5cf6' : '#7c3aed'}
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
      
      <Text
        position={[0, 0, 0.9]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        ₹2.8M
      </Text>
      
      <Text
        position={[0, -0.2, 0.9]}
        fontSize={0.08}
        color="#ffffff80"
        anchorX="center"
        anchorY="middle"
      >
        Revenue
      </Text>
    </group>
  );
};

// Rotating Order Cube
const OrderCube = ({ position }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z += 0.003;
    }
  });

  return (
    <group position={position}>
      <ThreeBox
        ref={meshRef}
        args={[1, 1, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <meshStandardMaterial
          color={hovered ? '#22d3ee' : '#06b6d4'}
          emissive={hovered ? '#06b6d4' : '#0891b2'}
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={0.6}
        />
      </ThreeBox>
      
      <Text
        position={[0, 0, 0.6]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        15.8K
      </Text>
      
      <Text
        position={[0, -0.15, 0.6]}
        fontSize={0.06}
        color="#ffffff80"
        anchorX="center"
        anchorY="middle"
      >
        Orders
      </Text>
    </group>
  );
};

// Analytics Sphere
const AnalyticsSphere = ({ position }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.008;
      meshRef.current.material.emissiveIntensity = 
        0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.6, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.15 : 1}
      >
        <meshStandardMaterial
          color={hovered ? '#34d399' : '#10b981'}
          emissive={hovered ? '#10b981' : '#059669'}
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.7}
          wireframe={false}
        />
      </Sphere>
      
      {/* Orbiting particles */}
      {[...Array(8)].map((_, i) => (
        <Sphere key={i} args={[0.02, 8, 8]} position={[
          Math.cos((i / 8) * Math.PI * 2) * 1.2,
          Math.sin((i / 8) * Math.PI * 2) * 0.3,
          Math.sin((i / 8) * Math.PI * 2) * 1.2
        ]}>
          <meshBasicMaterial color="#ffffff" />
        </Sphere>
      ))}
      
      <Text
        position={[0, 0, 0.7]}
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        AI
      </Text>
    </group>
  );
};

// Parallax Cards
const ParallaxCard = ({ position, title, value, color }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.z = position[2] + Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <ThreeBox args={[1.2, 0.8, 0.1]} scale={hovered ? 1.05 : 1}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </ThreeBox>
      
      <Text
        position={[0, 0.1, 0.06]}
        fontSize={0.08}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>
      
      <Text
        position={[0, -0.1, 0.06]}
        fontSize={0.12}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-bold.woff"
      >
        {value}
      </Text>
    </group>
  );
};

const ThreeDSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="chart-card threed-section"
    >
      <Box className="chart-header">
        <div>
          <Typography variant="h6" className="chart-title">
            🌐 3D Interactive Analytics
          </Typography>
          <Typography variant="body2" className="chart-subtitle">
            Immersive data visualization experience
          </Typography>
        </div>
      </Box>

      <Box className="chart-content threed-canvas-container">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          style={{ height: '400px', background: 'transparent' }}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
          
          {/* Main 3D Objects */}
          <RevenueOrb position={[-3, 1, 0]} />
          <OrderCube position={[0, 0, 0]} />
          <AnalyticsSphere position={[3, -1, 0]} />
          
          {/* Parallax Cards */}
          <ParallaxCard 
            position={[-2, -2, -2]} 
            title="Users" 
            value="8.9K" 
            color="#f59e0b" 
          />
          <ParallaxCard 
            position={[2, -2, -2]} 
            title="Vendors" 
            value="342" 
            color="#ec4899" 
          />
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>

        {/* 3D Controls Info */}
        <Box className="threed-controls-info">
          <Typography variant="caption">
            🖱️ Drag to rotate • Auto-rotating • Hover for interactions
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ThreeDSection;