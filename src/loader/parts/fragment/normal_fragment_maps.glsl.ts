export default /* glsl */ `



#ifdef USE_NORMALMAP_OBJECTSPACE

	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals

	#ifdef FLIP_SIDED

		normal = - normal;

	#endif

	#ifdef DOUBLE_SIDED

		normal = normal * faceDirection;

	#endif

	normal = normalize( normalMatrix * normal );

#elif defined( USE_NORMALMAP_TANGENTSPACE )

	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef USE_BASE_NORMALMAP
		vec3 baseNormal =  texture2D( baseNormalMap, vUvBase ).xyz * 2.0 - 1.0;
		vec3 source = vec3(0.0, 0.0, 1.0);
        vec3 v = cross( baseNormal, source);
        float c = dot(source, baseNormal);
        float k = 1.0 / (1.0 + c);
        
        mat3 vx = mat3(
            0, -v.z, v.y,
            v.z, 0, -v.x,
            -v.y, v.x, 0
        );
        
        // Rodrigues' Rotasyon Formülü
        vx = mat3(1.0) + vx + vx * vx * k;

        mapN = vx * mapN;
	#endif
	mapN.xy *= normalScale;

	normal = normalize( tbn * mapN );

#elif defined( USE_BUMPMAP )

	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );

#endif
`;
