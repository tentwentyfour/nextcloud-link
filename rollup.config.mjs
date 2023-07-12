import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

import nopePolyFill from 'rollup-plugin-polyfill-node';

const outDir = './bundle';
const outName = 'nextcloud-client';
const outExt = '.js';
const bundleName = 'nextCloudClient';

function createOutputConfig(format, sourceMap = false, formatName = format) {
  return {
    file: `${outDir}/${outName}${formatName && formatName.length > 0 ? `.${formatName}` : ''}${outExt}`,
    format,
    name: bundleName,
    sourcemap: sourceMap,
  };
}

const config = [
  {
    input: 'source/client.ts',
    output: [
      createOutputConfig('es', true),
      createOutputConfig('cjs', true),
      {
        ...createOutputConfig('es', true, 'es.min'),
        plugins: [terser()]
      }
    ],
    plugins: [
      typescript({ declaration: false, sourceMap: true, inlineSources: true }),
      nopePolyFill()
    ],
    external: ['lonad', 'webdav', 'axios']
  },
  {
    input: 'source/client.ts',
    output: [
      createOutputConfig('iife', true, ''),
      {
        ...createOutputConfig('iife', false, 'min'),
        plugins: [terser()]
      }
    ],
    plugins: [
      resolve({
        browser: true,
        resolveOnly: ['lonad'],
      }),
      commonjs(),
      typescript({ declaration: false }),
      nopePolyFill()
    ],
  }
];

export default config;
