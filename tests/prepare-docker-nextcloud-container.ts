/*
* The docker container is weird. Accessing it the first time seems
* to always return a 405 for some reason. Accessing it in a prepare
* script seems to make it work just fine.
*/

import { WebDavClient } from '../source/webdav';
import configuration   from './configuration.js';

(async () => {
  const client = new WebDavClient(configuration.connectionOptions.url, configuration.connectionOptions);

  console.log('Waiting about 25 seconds for Nextcloud installation to complete. This can take a while, depending on your system…');
  await new Promise(resolve => setTimeout(resolve, 25000));
  console.info('Set-up should be complete by now. Starting to probe for readyness…');
  let times = 0;

  while (true) {
    console.log('Checking nextcloud availability…');

    try {
      const isConnected = await client.checkConnectivity()

      if (isConnected) {
        break;
      }
    } catch (error) {
      console.error('Error while checking nextcloud availability:', error);
    }

    times += 1;

    if (times > 30) {
      console.log('The nextcloud container does not seem to work. Aborting…');
      process.exit(1);
    }

    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  process.exit(0);
})();
