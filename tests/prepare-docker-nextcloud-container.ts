/*
* The docker container is weird. Accessing it the first time seems
* to always return a 405 for some reason. Accessing it in a prepare
* script seems to make it work just fine.
*/

import { WebDavClient } from '../lib/cjs/webdav.js';
import configuration   from './configuration.js';

(async () => {
  const client = await WebDavClient.create(configuration.connectionOptions.url, configuration.connectionOptions);

  console.log('Waiting about 25 seconds for Nextcloud installation to complete. This can take a while, depending on your system…');
  await new Promise(resolve => setTimeout(resolve, 25000));
  console.info('Set-up should be complete by now. Starting to probe for readyness…');
  let times = 0;

  while (true) {
    console.log('Checking nextcloud availability…');

    if (await client.checkConnectivity()) {
      break;
    }

    times += 1;

    if (times > 20) {
      console.log('The nextcloud container does not seem to work. Aborting…');
      process.exit(1);
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  process.exit(0);
})();
